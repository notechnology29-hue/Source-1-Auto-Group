"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { submitCreditApplicationAction } from "@/app/actions/creditApplication";

const input = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";
const label = "block text-sm font-medium text-zinc-700";
const legend = "border-b border-zinc-200 pb-2 text-lg font-extrabold uppercase tracking-wide text-zinc-900";

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

function Field({ text, required, children }: { text: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className={label}>
      {text}
      {required && <span className="text-red-600">*</span>}
      {children}
    </label>
  );
}

function Text({ name, text, required, ...rest }: { name: string; text: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field text={text} required={required}>
      <input name={name} required={required} className={input} {...rest} />
    </Field>
  );
}

function Years({ name, text, required }: { name: string; text: string; required?: boolean }) {
  return (
    <Field text={`${text} - Years`} required={required}>
      <select name={name} required={required} defaultValue="0" className={input}>
        {range(0, 10).map((n) => <option key={n} value={n}>{n === 10 ? "10+" : n}</option>)}
      </select>
    </Field>
  );
}

function Months({ name, text, required }: { name: string; text: string; required?: boolean }) {
  return (
    <Field text={`${text} - Months`} required={required}>
      <select name={name} required={required} defaultValue="0" className={input}>
        {range(0, 12).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </Field>
  );
}

export function CreditApplicationForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const s = (k: string) => String(fd.get(k) ?? "");
    setPending(true);
    setError("");
    const res = await submitCreditApplicationAction({
      first_name: s("first_name"), last_name: s("last_name"), phone: s("phone"), email: s("email"),
      ssn: s("ssn"), dob: s("dob"), dl_number: s("dl_number"), dl_status: s("dl_status"),
      street: s("street"), city: s("city"), state: s("state"), zip: s("zip"),
      res_years: s("res_years"), res_months: s("res_months"),
      prev_years: s("prev_years"), prev_months: s("prev_months"),
      prev_street: s("prev_street"), prev_city: s("prev_city"), prev_state: s("prev_state"), prev_zip: s("prev_zip"),
      housing_type: s("housing_type"), housing_payment: s("housing_payment"),
      employer: s("employer"), employer_phone: s("employer_phone"), job_title: s("job_title"), monthly_income: s("monthly_income"),
      emp_years: s("emp_years"), emp_months: s("emp_months"),
      prev_employer: s("prev_employer"), prev_job_title: s("prev_job_title"),
      prev_emp_years: s("prev_emp_years"), prev_emp_months: s("prev_emp_months"),
      veh_year: s("veh_year"), veh_make: s("veh_make"), veh_model: s("veh_model"), veh_trim: s("veh_trim"),
      loan_amount: s("loan_amount"),
      contact_methods: fd.getAll("contact_methods").map(String),
      consent: fd.get("consent") === "on",
      website: s("website"),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    form.reset();
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-10 text-center">
        <CheckCircle2 className="text-blue-600" size={44} aria-hidden />
        <p className="text-xl font-extrabold text-zinc-900">Application received</p>
        <p className="max-w-md text-zinc-600">Thank you. A Source 1 Auto finance specialist will contact you using your preferred method.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <p className="text-sm text-zinc-600">Fields marked with an asterisk (<span className="text-red-600">*</span>) are required.</p>

      <fieldset className="space-y-4">
        <legend className={`${legend} w-full`}>Contact Info</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="first_name" text="First Name" required maxLength={50} autoComplete="given-name" />
          <Text name="last_name" text="Last Name" required maxLength={50} autoComplete="family-name" />
          <Text name="phone" text="Phone #" required type="tel" maxLength={20} autoComplete="tel" />
          <Text name="email" text="Email Address" required type="email" maxLength={200} autoComplete="email" />
          <Text name="ssn" text="Social Security Number" required inputMode="numeric" maxLength={11} placeholder="###-##-####" autoComplete="off" />
          <Text name="dob" text="Date of Birth" required type="date" autoComplete="bday" />
          <Text name="dl_number" text="Driver's License" required maxLength={30} autoComplete="off" />
          <Field text="Driver's License Status" required>
            <select name="dl_status" required defaultValue="current" className={input}>
              <option value="current">Current Driver&apos;s License</option>
              <option value="none">No Driver&apos;s License</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={`${legend} w-full`}>Residence</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="street" text="Street Address" required maxLength={150} autoComplete="address-line1" />
          <Text name="city" text="City" required maxLength={80} autoComplete="address-level2" />
          <Text name="state" text="State" required maxLength={2} placeholder="AZ" autoComplete="address-level1" />
          <Text name="zip" text="Zip Code" required maxLength={10} inputMode="numeric" autoComplete="postal-code" />
          <Years name="res_years" text="Time At Current Residence" required />
          <Months name="res_months" text="Time At Current Residence" required />
        </div>
        <p className="text-sm text-zinc-600">If you&apos;ve lived at your current address less than 2 years, a previous address is required.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Years name="prev_years" text="Time At Previous Residence" />
          <Months name="prev_months" text="Time At Previous Residence" />
          <Text name="prev_street" text="Previous Street Address" maxLength={150} />
          <Text name="prev_city" text="City" maxLength={80} />
          <Text name="prev_state" text="State" maxLength={2} />
          <Text name="prev_zip" text="Zip Code" maxLength={10} inputMode="numeric" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field text="Monthly Rent/Mortgage" required>
            <select name="housing_type" required defaultValue="rent" className={input}>
              <option value="rent">Rent</option>
              <option value="mortgage">Mortgage</option>
            </select>
          </Field>
          <Text name="housing_payment" text="Monthly Payment ($)" required type="number" min={0} step="1" inputMode="decimal" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={`${legend} w-full`}>Employment Info</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="employer" text="Employer Name" required maxLength={100} />
          <Text name="employer_phone" text="Employer Phone Number" required type="tel" maxLength={20} />
          <Text name="job_title" text="Position or Job Title" required maxLength={100} />
          <Text name="monthly_income" text="Gross Monthly Income ($)" required type="number" min={1} step="1" inputMode="decimal" />
          <Years name="emp_years" text="Time at Current Employer" required />
          <Months name="emp_months" text="Time at Current Employer" required />
        </div>
        <p className="text-sm text-zinc-600">If you&apos;ve been at your current employer less than 2 years, previous employer details are required.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="prev_employer" text="Previous Employer" maxLength={100} />
          <Text name="prev_job_title" text="Previous Employer Position" maxLength={100} />
          <Years name="prev_emp_years" text="Time at Previous Employer" />
          <Months name="prev_emp_months" text="Time at Previous Employer" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={`${legend} w-full`}>Tell us about the vehicle you want</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="veh_year" text="Year" maxLength={4} inputMode="numeric" />
          <Text name="veh_make" text="Make" maxLength={100} />
          <Text name="veh_model" text="Model" maxLength={100} />
          <Text name="veh_trim" text="Trim" maxLength={100} />
          <Text name="loan_amount" text="Total Loan Amount ($)" required type="number" min={1} step="1" inputMode="decimal" />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={`${legend} w-full`}>How would you like us to contact you?<span className="text-red-600">*</span></legend>
        <div className="flex flex-wrap gap-6">
          {[["call", "Call"], ["text", "Text"], ["email", "Email"]].map(([v, t]) => (
            <label key={v} className="flex items-center gap-2 text-zinc-700">
              <input type="checkbox" name="contact_methods" value={v} defaultChecked={v === "call"} className="h-4 w-4 accent-blue-600" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
        <label className="flex items-start gap-3 font-medium text-zinc-800">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />
          <span>
            I agree to give permission for the above applicant(s) Consumer Credit Report(s) to be obtained, at no cost to me, in order to help determine the types and extent of financing which are available<span className="text-red-600">*</span>
          </span>
        </label>
        <p>In connection with your transaction, Source 1 Auto may acquire information about you as described in this notice, which we handle as stated in this notice.</p>
        <p>We may collect personally identifiable information such as name, postal address, telephone number, e-mail address, social security number, date of birth, etc. This personal information is collected and used by Source 1 Auto Group staff for the purpose of facilitating a relationship or business transaction.</p>
        <p className="flex items-start gap-2">
          <Lock size={16} className="mt-0.5 shrink-0 text-blue-600" aria-hidden />
          <span>Your information is transmitted over SSL, and your Social Security Number and driver&apos;s license are encrypted before they are stored. See our <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
        </p>
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="text-center">
        <button type="submit" disabled={pending} className="inline-flex min-h-12 min-w-56 items-center justify-center rounded-md bg-red-600 px-8 font-bold uppercase tracking-wider text-white transition hover:bg-red-700 disabled:opacity-50">
          {pending ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
