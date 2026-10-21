"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Clock, MessageCircle, MessageSquare, X } from "lucide-react";
import { submitLeadAction, type LeadHandoff } from "@/app/actions/leads";
import { BRAND } from "@/lib/constants";
import { usd } from "@/lib/format";
import type { InquiryType, VehicleWithMedia } from "@/types/database";

interface Props {
  vehicle: VehicleWithMedia | null;
  onClose: () => void;
  initialInquiry?: InquiryType;
}

const OPTIONS: { id: InquiryType; label: string; blurb: string; icon: typeof Clock }[] = [
  { id: "hold_ride", label: "Hold for 24 hrs", blurb: "Lock it down while you decide", icon: Clock },
  { id: "test_drive", label: "VIP test drive", blurb: "We'll have it ready at the door", icon: CalendarCheck },
];

export function HoldMyRideModal({ vehicle, onClose, initialInquiry = "hold_ride" }: Props) {
  return (
    <AnimatePresence>
      {vehicle && <ModalBody key={`${vehicle.id}-${initialInquiry}`} vehicle={vehicle} initialInquiry={initialInquiry} onClose={onClose} />}
    </AnimatePresence>
  );
}

function ModalBody({ vehicle, initialInquiry, onClose }: { vehicle: VehicleWithMedia; initialInquiry: InquiryType; onClose: () => void }) {
  const [inquiry, setInquiry] = useState<InquiryType>(initialInquiry);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LeadHandoff | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input:not([tabindex='-1'])")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]):not([tabindex='-1'])",
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    const res = await submitLeadAction({
      vehicle_id: vehicle.id,
      customer_name: fd.get("name"),
      customer_email: fd.get("email"),
      customer_phone: fd.get("phone"),
      inquiry_type: inquiry,
      website: fd.get("website"),
    });
    setPending(false);
    if (!res.ok) return setError(res.error);
    setResult(res.data);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-end overflow-y-auto bg-black/80 backdrop-blur-sm sm:place-items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hold-title"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="neon-frame relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-b-none bg-carbon-50 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-b-2xl sm:p-6"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-2 top-2 grid h-11 w-11 place-items-center text-chrome-dark hover:text-white">
          <X size={20} />
        </button>

        {result ? (
          <div className="text-center" role="status">
            <CheckCircle2 size={44} className="mx-auto text-emerald-400" aria-hidden />
            <h2 id="hold-title" className="mt-3 text-2xl font-black text-white">
              {inquiry === "hold_ride" ? "Request received!" : "Test drive requested!"}
            </h2>
            <p className="mt-2 text-sm text-chrome-dim">
              One last step: send your details to our sales floor so we can lock in the <strong className="text-white">{title}</strong> (Stock # {result.stockNumber}) right away.
            </p>
            <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-hot mt-6 w-full">
              <MessageCircle size={18} aria-hidden /> Confirm on WhatsApp
            </a>
            <a href={result.smsUrl} className="btn-neon mt-3 w-full">
              <MessageSquare size={18} aria-hidden /> Or send by text message
            </a>
            <a href={BRAND.phoneHref} className="mt-4 block text-sm text-chrome-dim hover:text-white">
              Prefer to talk? Call {BRAND.phoneDisplay}
            </a>
            {!result.saved && (
              <p className="mt-3 text-xs text-chrome-dark">Demo mode: your request was not stored because the database is not connected.</p>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <header>
              <h2 id="hold-title" className="text-2xl font-black text-white">Hold My Ride</h2>
              <p className="mt-1 text-sm text-chrome-dim">
                {title} · {usd(vehicle.price)} · Stock # {vehicle.stock_number}
              </p>
            </header>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="sr-only">What would you like?</legend>
              {OPTIONS.map((o) => {
                const active = inquiry === o.id;
                return (
                  <label
                    key={o.id}
                    className={`cursor-pointer rounded-xl border p-3 text-sm transition ${
                      active ? "border-neon bg-neon/15 shadow-neon" : "border-white/10 hover:border-neon/50"
                    }`}
                  >
                    <input type="radio" name="inquiry" value={o.id} checked={active} onChange={() => setInquiry(o.id)} className="sr-only" />
                    <o.icon size={18} className={active ? "text-neon-light" : "text-chrome-dark"} aria-hidden />
                    <span className="mt-1 block font-semibold text-white">{o.label}</span>
                    <span className="block text-xs text-chrome-dim">{o.blurb}</span>
                  </label>
                );
              })}
            </fieldset>

            <label className="block text-xs uppercase tracking-wider text-chrome-dark">
              Full name
              <input name="name" required minLength={2} maxLength={100} autoComplete="name" className="input-dark mt-1 normal-case tracking-normal" />
            </label>
            <label className="block text-xs uppercase tracking-wider text-chrome-dark">
              Mobile phone
              <input name="phone" type="tel" required maxLength={20} autoComplete="tel" className="input-dark mt-1 normal-case tracking-normal" placeholder="(480) 555-0123" />
            </label>
            <label className="block text-xs uppercase tracking-wider text-chrome-dark">
              Email
              <input name="email" type="email" required maxLength={200} autoComplete="email" className="input-dark mt-1 normal-case tracking-normal" />
            </label>

            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

            {error && (
              <p role="alert" className="rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">
                {error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-hot w-full">
              {pending ? "Sending…" : inquiry === "hold_ride" ? "Lock it down" : "Book my test drive"}
            </button>
            <p className="text-center text-[11px] text-chrome-dark">No obligation. We&apos;ll only use your info to follow up on this vehicle.</p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
