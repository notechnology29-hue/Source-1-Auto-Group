"use server";

import { z } from "zod";
import { after } from "next/server";
import { SEED_VEHICLES } from "@/data/seed";
import { isSupabaseConfigured } from "@/lib/auth";
import { buildSmsUrl, buildWhatsAppUrl, type HandoffInput } from "@/lib/handoff";
import { notifyNewLead } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/database";

const leadSchema = z.object({
  vehicle_id: z.string().min(1).max(64),
  customer_name: z.string().trim().min(2, "Please enter your name").max(100),
  customer_email: z.string().trim().email("Enter a valid email address").max(200),
  customer_phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-.\s]{7,20}$/, "Enter a valid phone number"),
  inquiry_type: z.enum(["hold_ride", "test_drive"]),
  // Honeypot: real users never see or fill this.
  website: z.string().max(0).optional(),
});

export interface LeadHandoff {
  whatsappUrl: string;
  smsUrl: string;
  stockNumber: string;
  saved: boolean;
}

export async function submitLeadAction(input: unknown): Promise<ActionResult<LeadHandoff>> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const lead = parsed.data;

  const configured = isSupabaseConfigured();
  let vehicle: { stock_number: string; year: number; make: string; model: string; trim: string | null } | null = null;
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  if (configured) {
    supabase = await createClient();
    const { data } = await supabase
      .from("vehicles")
      .select("stock_number, year, make, model, trim")
      .eq("id", lead.vehicle_id)
      .eq("status", "available")
      .maybeSingle();
    vehicle = data;
  } else {
    // Demo mode (no database yet): resolve against seed inventory so the handoff still works.
    vehicle = SEED_VEHICLES.find((v) => v.id === lead.vehicle_id && v.status === "available") ?? null;
  }
  if (!vehicle) return { ok: false, error: "Sorry, this vehicle is no longer available." };

  if (supabase) {
    // Anonymous visitors may insert but never read leads, so no .select() here.
    const { error } = await supabase.from("leads").insert({
      vehicle_id: lead.vehicle_id,
      customer_name: lead.customer_name,
      customer_email: lead.customer_email,
      customer_phone: lead.customer_phone,
      inquiry_type: lead.inquiry_type,
    });
    if (error) return { ok: false, error: "We couldn't save your request. Please call us instead." };
  }

  // Only real (saved) leads notify staff; demo mode stays quiet.
  if (supabase) {
    after(() =>
      notifyNewLead({
        inquiry: lead.inquiry_type,
        vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`,
        stockNumber: vehicle.stock_number,
        name: lead.customer_name,
        phone: lead.customer_phone,
        email: lead.customer_email,
      }),
    );
  }

  const handoff: HandoffInput = {
    inquiry: lead.inquiry_type,
    vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`,
    stockNumber: vehicle.stock_number,
    name: lead.customer_name,
    phone: lead.customer_phone,
    email: lead.customer_email,
  };
  return {
    ok: true,
    data: {
      whatsappUrl: buildWhatsAppUrl(handoff),
      smsUrl: buildSmsUrl(handoff),
      stockNumber: vehicle.stock_number,
      saved: configured,
    },
  };
}

const contactSchema = z.object({
  first_name: z.string().trim().min(1, "Enter your first name").max(50),
  last_name: z.string().trim().min(1, "Enter your last name").max(50),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^([0-9+()\-.\s]{7,20})?$/, "Enter a valid phone number"),
  comments: z.string().trim().max(2000, "Comments are too long").optional(),
  website: z.string().max(0).optional(),
});

/** General "Send Us a Message" form: saved to `leads` without a vehicle. */
export async function submitContactAction(input: unknown): Promise<ActionResult<{ saved: boolean }>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const c = parsed.data;
  const configured = isSupabaseConfigured();
  if (!configured) return { ok: true, data: { saved: false } };

  const name = `${c.first_name} ${c.last_name}`;
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    customer_name: name,
    customer_email: c.email,
    customer_phone: c.phone || null,
    message: c.comments || null,
    inquiry_type: "contact",
  });
  if (error) return { ok: false, error: "We couldn't send your message. Please call us instead." };

  after(() =>
    notifyNewLead({
      inquiry: "contact",
      vehicleTitle: "General inquiry",
      stockNumber: "—",
      name,
      phone: c.phone || "Not provided",
      email: c.email,
      message: c.comments || undefined,
    }),
  );
  return { ok: true, data: { saved: true } };
}