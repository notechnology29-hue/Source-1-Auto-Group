"use server";

import { z } from "zod";
import { after } from "next/server";
import { isSupabaseConfigured } from "@/lib/auth";
import { encryptJson, getEncryptionKey } from "@/lib/crypto";
import { notifyNewLead } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";
import type { ActionResult } from "@/types/database";

const req = (label: string, max = 100) => z.string().trim().min(1, `${label} is required`).max(max);
const opt = (max = 100) => z.string().trim().max(max).optional().default("");
const num = z.coerce.number().int().min(0).max(100);
const phone = z.string().trim().regex(/^[0-9+()\-.\s]{7,20}$/, "Enter a valid phone number");

const schema = z
  .object({
    first_name: req("First name", 50),
    last_name: req("Last name", 50),
    phone,
    email: z.string().trim().email("Enter a valid email address").max(200),
    ssn: z.string().trim().regex(/^(\d{3}-?\d{2}-?\d{4})$/, "Enter a valid Social Security Number"),
    dob: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth"),
    dl_number: req("Driver's license", 30),
    dl_status: z.enum(["current", "none"]),
    street: req("Street address", 150),
    city: req("City", 80),
    state: z.string().trim().regex(/^[A-Za-z]{2}$/, "Enter a 2-letter state"),
    zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
    res_years: num,
    res_months: num.max(12),
    prev_years: z.coerce.number().int().min(0).max(100).optional().default(0),
    prev_months: z.coerce.number().int().min(0).max(12).optional().default(0),
    prev_street: opt(150),
    prev_city: opt(80),
    prev_state: opt(2),
    prev_zip: opt(10),
    housing_type: z.enum(["rent", "mortgage"]),
    housing_payment: z.coerce.number().min(0).max(1_000_000),
    employer: req("Employer name"),
    employer_phone: phone,
    job_title: req("Position or job title"),
    monthly_income: z.coerce.number().positive("Enter your gross monthly income").max(10_000_000),
    emp_years: num,
    emp_months: num.max(12),
    prev_employer: opt(),
    prev_job_title: opt(),
    prev_emp_years: z.coerce.number().int().min(0).max(100).optional().default(0),
    prev_emp_months: z.coerce.number().int().min(0).max(12).optional().default(0),
    veh_year: opt(4),
    veh_make: opt(),
    veh_model: opt(),
    veh_trim: opt(),
    loan_amount: z.coerce.number().positive("Enter the total loan amount").max(10_000_000),
    contact_methods: z.array(z.enum(["call", "text", "email"])).min(1, "Choose how we should contact you"),
    consent: z.literal(true, { error: "You must authorize the credit report to continue" }),
    website: z.string().max(0).optional(),
  })
  .superRefine((d, ctx) => {
    const need = (path: string, msg: string) => ctx.addIssue({ code: "custom", path: [path], message: msg });
    if (d.res_years * 12 + d.res_months < 24) {
      if (!d.prev_street || !d.prev_city || !d.prev_state || !d.prev_zip) {
        need("prev_street", "Previous address is required if you've lived at your current address less than 2 years");
      }
    }
    if (d.emp_years * 12 + d.emp_months < 24 && (!d.prev_employer || !d.prev_job_title)) {
      need("prev_employer", "Previous employer and position are required if you've been at your current job less than 2 years");
    }
  });

export async function submitCreditApplicationAction(input: unknown): Promise<ActionResult<{ saved: boolean }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { ssn, dl_number, dob, dl_status, consent, website, ...rest } = parsed.data;
  void consent;
  void website;

  // Demo mode (no database yet): nothing is stored and sensitive fields are discarded.
  if (!isSupabaseConfigured()) return { ok: true, data: { saved: false } };

  const key = getEncryptionKey();
  if (!key) {
    console.error("CREDIT_APP_ENCRYPTION_KEY is missing or not 32 bytes (base64); credit application rejected.");
    return { ok: false, error: `Online applications are temporarily unavailable. Please call us at ${BRAND.phoneDisplay}.` };
  }

  const sensitive = encryptJson({ ssn, dob, dl_number, dl_status }, key);
  const name = `${rest.first_name} ${rest.last_name}`;
  const supabase = await createClient();
  const { error } = await supabase.from("credit_applications").insert({
    customer_name: name,
    customer_email: rest.email,
    customer_phone: rest.phone,
    applicant: rest,
    sensitive_enc: sensitive,
  });
  if (error) return { ok: false, error: "We couldn't submit your application. Please call us instead." };

  after(() =>
    notifyNewLead({
      inquiry: "contact",
      vehicleTitle: "Credit application (pre-approval)",
      stockNumber: "—",
      name,
      phone: rest.phone,
      email: rest.email,
      message: `Loan amount: $${rest.loan_amount.toLocaleString("en-US")}. Contact by: ${rest.contact_methods.join(", ")}. Full application is in the credit_applications table.`,
    }),
  );
  return { ok: true, data: { saved: true } };
}
