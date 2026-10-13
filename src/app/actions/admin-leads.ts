"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types/database";

export async function markLeadContactedAction(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Not authorized. Please sign in again." };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid lead." };

  const { error } = await admin.supabase.from("leads").update({ status: "contacted" }).eq("id", id);
  if (error) return { ok: false, error: "Could not update the lead." };
  revalidatePath("/admin/leads");
  return { ok: true, data: undefined };
}
