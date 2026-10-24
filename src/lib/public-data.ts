import { cacheLife } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { SEED_VEHICLES } from "@/data/seed";
import type { Database, VehicleWithMedia } from "@/types/database";

/**
 * Cookie-free, cached vehicle list for metadata, the sitemap and structured data.
 * Anonymous access only, so RLS limits it to public listings.
 */
export async function getPublicVehicles(): Promise<VehicleWithMedia[]> {
  "use cache";
  cacheLife("minutes");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return SEED_VEHICLES;

  try {
    const supabase = createServerClient<Database>(url, key, { cookies: { getAll: () => [], setAll() {} } });
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_media(*), transparency_hotspots(*)")
      .in("status", ["available", "pending"])
      .order("created_at", { ascending: false });
    if (error || !data) throw error ?? new Error("No data");
    return data as unknown as VehicleWithMedia[];
  } catch (e) {
    console.error("getPublicVehicles failed, using seed data:", e);
    return SEED_VEHICLES;
  }
}
