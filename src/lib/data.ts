import { SEED_VEHICLES } from "@/data/seed";
import { createClient } from "@/lib/supabase/server";
import type { VehicleWithMedia } from "@/types/database";

/** Falls back to seed data until Supabase env vars are configured (or if the query fails). */
export async function getVehicles(): Promise<VehicleWithMedia[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return SEED_VEHICLES;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_media(*), transparency_hotspots(*)")
      .in("status", ["available", "pending"])
      .order("created_at", { ascending: false });
    if (error || !data) throw error ?? new Error("No data");
    return data as unknown as VehicleWithMedia[];
  } catch (e) {
    console.error("getVehicles failed, using seed data:", e);
    return SEED_VEHICLES;
  }
}
