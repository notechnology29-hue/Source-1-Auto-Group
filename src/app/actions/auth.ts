"use server";

import { redirect } from "next/navigation";
import { getAdmin, isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(_prev: { error?: string } | undefined, formData: FormData) {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured on this deployment." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  redirect("/admin");
}

export async function changePasswordAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
) {
  const admin = await getAdmin();
  if (!admin) return { error: "Please sign in again." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current) return { error: "Enter your current password." };
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  if (next !== confirm) return { error: "New passwords don't match." };
  if (next === current) return { error: "Choose a password different from the current one." };

  // Re-verify the current password so a hijacked session can't silently change it.
  const { error: authError } = await admin.supabase.auth.signInWithPassword({
    email: admin.user.email ?? "",
    password: current,
  });
  if (authError) return { error: "Current password is incorrect." };

  const { error } = await admin.supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message || "Could not update the password." };
  return { ok: true };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

