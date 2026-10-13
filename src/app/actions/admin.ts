"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import Mux from "@mux/mux-node";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { decodeVin, VIN_REGEX } from "@/lib/nhtsa";
import type {
  ActionResult,
  DecodedVin,
  TransparencyHotspot,
  Vehicle,
  VehicleMedia,
} from "@/types/database";

const UNAUTHORIZED = { ok: false, error: "Not authorized. Please sign in again." } as const;

// ───────────── VIN decoder ─────────────

export async function decodeVinAction(rawVin: string): Promise<ActionResult<DecodedVin>> {
  if (!(await getAdmin())) return UNAUTHORIZED;

  const vin = String(rawVin ?? "").trim().toUpperCase();
  if (!VIN_REGEX.test(vin)) {
    return { ok: false, error: "VIN must be 17 characters (letters and digits, no I, O, or Q)." };
  }
  try {
    const decoded = await decodeVin(vin);
    if (!decoded) return { ok: false, error: "NHTSA could not decode this VIN. Check it and try again." };
    return { ok: true, data: decoded };
  } catch {
    return { ok: false, error: "The NHTSA service is unavailable right now. Enter the details manually." };
  }
}

// ───────────── Vehicle create ─────────────

const vehicleSchema = z.object({
  stock_number: z.string().trim().min(1, "Stock number is required").max(30),
  vin: z.string().trim().toUpperCase().regex(VIN_REGEX, "Invalid VIN"),
  year: z.coerce.number().int().min(1980).max(2100),
  make: z.string().trim().min(1, "Make is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(60),
  trim: z.string().trim().max(80).optional().default(""),
  condition: z.enum(["excellent", "good", "fair"]),
  status: z.enum(["available", "pending", "sold"]),
  price: z.coerce.number().min(0).max(10_000_000),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
  exterior_color: z.string().trim().max(40).optional().default(""),
  drivetrain: z.string().trim().max(20).optional().default(""),
  engine: z.string().trim().max(80).optional().default(""),
  features: z.string().optional().default(""),
  clean_carfax: z.boolean(),
});

export async function createVehicleAction(input: unknown): Promise<ActionResult<Vehicle>> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid vehicle details." };
  }
  const v = parsed.data;
  const features = v.features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, 40);

  const { data, error } = await admin.supabase
    .from("vehicles")
    .insert({
      ...v,
      trim: v.trim || null,
      exterior_color: v.exterior_color || null,
      drivetrain: v.drivetrain || null,
      engine: v.engine || null,
      features,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "A vehicle with this stock number or VIN already exists." };
    return { ok: false, error: "Could not save the vehicle. Please try again." };
  }
  revalidatePath("/");
  return { ok: true, data: data as Vehicle };
}

// ───────────── Vehicle update / delete ─────────────

const uuid = z.string().uuid();

export async function updateVehicleAction(id: string, input: unknown): Promise<ActionResult<Vehicle>> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;
  if (!uuid.safeParse(id).success) return { ok: false, error: "Invalid vehicle." };

  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid vehicle details." };
  }
  const v = parsed.data;
  const features = v.features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, 40);

  const { data, error } = await admin.supabase
    .from("vehicles")
    .update({
      ...v,
      trim: v.trim || null,
      exterior_color: v.exterior_color || null,
      drivetrain: v.drivetrain || null,
      engine: v.engine || null,
      features,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Another vehicle already uses this stock number or VIN." };
    return { ok: false, error: "Could not update the vehicle. Please try again." };
  }
  if (!data) return { ok: false, error: "Vehicle not found." };
  revalidatePath("/");
  revalidatePath("/admin/inventory");
  return { ok: true, data: data as Vehicle };
}

export async function deleteVehicleAction(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;
  if (!uuid.safeParse(id).success) return { ok: false, error: "Invalid vehicle." };

  // Leads cascade with the vehicle in the schema, so protect lead history.
  const { count } = await admin.supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", id);
  if ((count ?? 0) > 0) {
    return { ok: false, error: `This vehicle has ${count} lead(s). Mark it Sold instead of deleting to keep that history.` };
  }

  // Media and hotspots cascade with the vehicle.
  const { error } = await admin.supabase.from("vehicles").delete().eq("id", id);
  if (error) return { ok: false, error: "Could not delete the vehicle." };
  revalidatePath("/");
  revalidatePath("/admin/inventory");
  return { ok: true, data: undefined };
}

// ───────────── Media management ─────────────

export async function setPrimaryMediaAction(vehicleId: string, mediaId: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;
  if (!uuid.safeParse(vehicleId).success || !uuid.safeParse(mediaId).success) {
    return { ok: false, error: "Invalid photo." };
  }

  const { data: target } = await admin.supabase
    .from("vehicle_media")
    .select("id")
    .eq("id", mediaId)
    .eq("vehicle_id", vehicleId)
    .eq("media_type", "image")
    .maybeSingle();
  if (!target) return { ok: false, error: "That photo does not belong to this vehicle." };

  // A unique partial index allows one primary per vehicle, so clear before setting.
  const clear = await admin.supabase
    .from("vehicle_media")
    .update({ is_primary: false })
    .eq("vehicle_id", vehicleId)
    .eq("is_primary", true);
  if (clear.error) return { ok: false, error: "Could not change the primary photo." };

  const set = await admin.supabase.from("vehicle_media").update({ is_primary: true }).eq("id", mediaId);
  if (set.error) return { ok: false, error: "Could not change the primary photo." };
  revalidatePath("/");
  return { ok: true, data: undefined };
}

export async function deleteMediaAction(vehicleId: string, mediaId: string): Promise<ActionResult<{ newPrimaryId: string | null }>> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;
  if (!uuid.safeParse(vehicleId).success || !uuid.safeParse(mediaId).success) {
    return { ok: false, error: "Invalid media." };
  }

  const { data: item } = await admin.supabase
    .from("vehicle_media")
    .select("id, is_primary")
    .eq("id", mediaId)
    .eq("vehicle_id", vehicleId)
    .maybeSingle();
  if (!item) return { ok: false, error: "Media not found." };

  // Hotspots on this photo cascade with it.
  const { error } = await admin.supabase.from("vehicle_media").delete().eq("id", mediaId);
  if (error) return { ok: false, error: "Could not delete the media." };

  // Promote the next photo so the card never loses its cover image.
  let newPrimaryId: string | null = null;
  if (item.is_primary) {
    const { data: next } = await admin.supabase
      .from("vehicle_media")
      .select("id")
      .eq("vehicle_id", vehicleId)
      .eq("media_type", "image")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) {
      await admin.supabase.from("vehicle_media").update({ is_primary: true }).eq("id", next.id);
      newPrimaryId = next.id;
    }
  }
  revalidatePath("/");
  return { ok: true, data: { newPrimaryId } };
}

// ───────────── Cloudinary (signed, direct-from-browser uploads) ─────────────

export async function signCloudinaryUploadAction(
  stockNumber: string,
): Promise<ActionResult<{ cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string }>> {
  if (!(await getAdmin())) return UNAUTHORIZED;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return { ok: false, error: "Cloudinary is not configured." };

  const folder = `source1/${stockNumber.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 40)}`;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);
  return { ok: true, data: { cloudName, apiKey, timestamp, folder, signature } };
}

// ───────────── Mux (direct upload → playback id) ─────────────

function mux() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) return null;
  return new Mux({ tokenId, tokenSecret });
}

export async function createMuxUploadAction(): Promise<ActionResult<{ uploadId: string; url: string }>> {
  if (!(await getAdmin())) return UNAUTHORIZED;
  const client = mux();
  if (!client) return { ok: false, error: "Mux is not configured." };

  const origin = (await headers()).get("origin") ?? "*";
  try {
    const upload = await client.video.uploads.create({
      cors_origin: origin,
      new_asset_settings: { playback_policy: ["public"] },
    });
    if (!upload.url) return { ok: false, error: "Could not start the video upload." };
    return { ok: true, data: { uploadId: upload.id, url: upload.url } };
  } catch {
    return { ok: false, error: "Could not start the video upload." };
  }
}

/** Poll until Mux has created the asset; returns the public HLS URL once a playback id exists. */
export async function resolveMuxUploadAction(
  uploadId: string,
): Promise<ActionResult<{ ready: boolean; url?: string }>> {
  if (!(await getAdmin())) return UNAUTHORIZED;
  const client = mux();
  if (!client) return { ok: false, error: "Mux is not configured." };

  try {
    const upload = await client.video.uploads.retrieve(uploadId);
    if (upload.status === "errored" || upload.status === "cancelled" || upload.status === "timed_out") {
      return { ok: false, error: "Mux could not process this video." };
    }
    if (!upload.asset_id) return { ok: true, data: { ready: false } };
    const asset = await client.video.assets.retrieve(upload.asset_id);
    const playbackId = asset.playback_ids?.[0]?.id;
    return playbackId
      ? { ok: true, data: { ready: true, url: `https://stream.mux.com/${playbackId}.m3u8` } }
      : { ok: true, data: { ready: false } };
  } catch {
    return { ok: false, error: "Could not check the video status." };
  }
}

// ───────────── Media records ─────────────

const mediaSchema = z.object({
  vehicle_id: z.string().uuid(),
  url: z.string().url().max(500),
  media_type: z.enum(["image", "video"]),
});

export async function saveMediaAction(input: unknown): Promise<ActionResult<VehicleMedia>> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const parsed = mediaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid media." };
  const { vehicle_id, url, media_type } = parsed.data;

  // Only accept URLs that point at our own Cloudinary account or Mux streams.
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const allowed =
    media_type === "image"
      ? Boolean(cloud) && url.startsWith(`https://res.cloudinary.com/${cloud}/`)
      : url.startsWith("https://stream.mux.com/");
  if (!allowed) return { ok: false, error: "Media URL is not from an approved source." };

  // The first image of a vehicle becomes its primary photo.
  let is_primary = false;
  if (media_type === "image") {
    const { count } = await admin.supabase
      .from("vehicle_media")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", vehicle_id)
      .eq("is_primary", true);
    is_primary = (count ?? 0) === 0;
  }

  const { data, error } = await admin.supabase
    .from("vehicle_media")
    .insert({ vehicle_id, url, media_type, is_primary })
    .select()
    .single();
  if (error) return { ok: false, error: "Could not save the media record." };
  revalidatePath("/");
  return { ok: true, data: data as VehicleMedia };
}

// ───────────── Transparency hotspots ─────────────

const hotspotSchema = z.object({
  vehicle_id: z.string().uuid(),
  media_id: z.string().uuid(),
  x_coordinate: z.coerce.number().min(0).max(100),
  y_coordinate: z.coerce.number().min(0).max(100),
  title: z.string().trim().min(1, "Give the disclosure a title").max(120),
  description: z.string().trim().max(1000).default(""),
  severity: z.enum(["cosmetic", "upgrade", "repaired"]),
});

export async function saveHotspotAction(input: unknown): Promise<ActionResult<TransparencyHotspot>> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;

  const parsed = hotspotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid hotspot." };
  const h = parsed.data;

  // Make sure the photo belongs to this vehicle.
  const { data: media } = await admin.supabase
    .from("vehicle_media")
    .select("id")
    .eq("id", h.media_id)
    .eq("vehicle_id", h.vehicle_id)
    .eq("media_type", "image")
    .maybeSingle();
  if (!media) return { ok: false, error: "That photo does not belong to this vehicle." };

  const { data, error } = await admin.supabase
    .from("transparency_hotspots")
    .insert({
      ...h,
      x_coordinate: Math.round(h.x_coordinate * 100) / 100,
      y_coordinate: Math.round(h.y_coordinate * 100) / 100,
    })
    .select()
    .single();
  if (error) return { ok: false, error: "Could not save the hotspot." };
  revalidatePath("/");
  return { ok: true, data: data as TransparencyHotspot };
}

export async function deleteHotspotAction(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return UNAUTHORIZED;
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid hotspot." };

  const { error } = await admin.supabase.from("transparency_hotspots").delete().eq("id", id);
  if (error) return { ok: false, error: "Could not delete the hotspot." };
  revalidatePath("/");
  return { ok: true, data: undefined };
}
