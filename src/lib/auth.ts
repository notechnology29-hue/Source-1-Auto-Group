import "server-only";
import { createClient } from "@/lib/supabase/server";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Returns the cookie-bound Supabase client plus user only when the verified
 * session belongs to an admin (app_metadata.role === 'admin'); otherwise null.
 * getUser() re-validates the JWT with Supabase rather than trusting the cookie.
 */
export async function getAdmin() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return { supabase, user };
}
