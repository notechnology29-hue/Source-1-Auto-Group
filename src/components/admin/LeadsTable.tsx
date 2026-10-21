"use client";

import { useState, useTransition } from "react";
import { Check, Mail, Phone } from "lucide-react";
import { markLeadContactedAction } from "@/app/actions/admin-leads";
import { INQUIRY_LABELS } from "@/lib/handoff";
import type { InquiryType, LeadStatus } from "@/types/database";

export interface LeadRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message?: string;
  inquiry_type: InquiryType;
  status: LeadStatus;
  created_at: string;
  vehicle: string;
  stock_number: string;
}

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [rows, setRows] = useState(leads);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function markContacted(id: string) {
    setBusyId(id);
    setError("");
    startTransition(async () => {
      const res = await markLeadContactedAction(id);
      setBusyId(null);
      if (!res.ok) return setError(res.error);
      setRows((all) => all.map((l) => (l.id === id ? { ...l, status: "contacted" } : l)));
    });
  }

  if (!rows.length) {
    return <p className="rounded-2xl border border-white/10 bg-carbon-50 p-10 text-center text-chrome-dim">No leads yet.</p>;
  }

  return (
    <div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">{error}</p>}
      <ul className="space-y-3">
        {rows.map((l) => {
          const isNew = l.status === "new";
          return (
            <li key={l.id} className={`rounded-xl border p-4 ${isNew ? "border-neon/50 bg-neon/5" : "border-white/10 bg-carbon-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-white">
                    {l.customer_name}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isNew ? "bg-hot text-white" : "bg-white/10 text-chrome-dim"}`}>
                      {l.status}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-chrome-dim">
                    {INQUIRY_LABELS[l.inquiry_type]} · {l.vehicle} · Stock # {l.stock_number}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    {l.customer_phone && (
                      <a href={`tel:${l.customer_phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-1.5 text-chrome hover:text-neon-light">
                        <Phone size={14} aria-hidden /> {l.customer_phone}
                      </a>
                    )}
                    <a href={`mailto:${l.customer_email}`} className="flex items-center gap-1.5 text-chrome hover:text-neon-light">
                      <Mail size={14} aria-hidden /> {l.customer_email}
                    </a>
                  </p>
                  {l.message && <p className="mt-2 whitespace-pre-line text-sm text-chrome-dim">{l.message}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <time dateTime={l.created_at} className="text-xs text-chrome-dark">
                    {new Date(l.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Phoenix" })}
                  </time>
                  {isNew && (
                    <button type="button" onClick={() => markContacted(l.id)} disabled={busyId === l.id} className="btn-neon !px-3 !py-1.5 text-sm">
                      <Check size={14} aria-hidden /> {busyId === l.id ? "Saving…" : "Mark contacted"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
