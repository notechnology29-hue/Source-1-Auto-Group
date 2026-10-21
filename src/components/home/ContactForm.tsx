"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitContactAction } from "@/app/actions/leads";

const field = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    setError("");
    const res = await submitContactAction({
      first_name: fd.get("first_name"),
      last_name: fd.get("last_name"),
      email: fd.get("email"),
      phone: fd.get("phone") ?? "",
      comments: fd.get("comments") ?? "",
      website: fd.get("website") ?? "",
    });
    setPending(false);
    if (!res.ok) return setError(res.error);
    form.reset();
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-blue-900/50 bg-white p-8 text-center">
        <CheckCircle2 className="text-blue-500" size={40} aria-hidden />
        <p className="text-lg font-bold text-zinc-900">Message sent!</p>
        <p className="text-sm text-zinc-600">Thanks for reaching out. A Source 1 team member will contact you shortly.</p>
        <button type="button" onClick={() => setSent(false)} className="text-sm text-blue-500 underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs text-zinc-600">
          First Name*
          <input name="first_name" required maxLength={50} autoComplete="given-name" className={`${field} mt-1`} />
        </label>
        <label className="block text-xs text-zinc-600">
          Last Name*
          <input name="last_name" required maxLength={50} autoComplete="family-name" className={`${field} mt-1`} />
        </label>
      </div>
      <label className="block text-xs text-zinc-600">
        Email Address*
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={`${field} mt-1`} />
      </label>
      <label className="block text-xs text-zinc-600">
        Phone Number
        <input name="phone" type="tel" maxLength={20} autoComplete="tel" className={`${field} mt-1`} />
      </label>
      <label className="block text-xs text-zinc-600">
        Comments
        <textarea name="comments" rows={4} maxLength={2000} className={`${field} mt-1 resize-y`} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <div className="text-center">
        <button type="submit" disabled={pending} className="inline-flex min-h-12 min-w-40 items-center justify-center rounded-md bg-red-600 px-8 font-bold uppercase tracking-wider text-white transition hover:bg-red-700 disabled:opacity-50">
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
