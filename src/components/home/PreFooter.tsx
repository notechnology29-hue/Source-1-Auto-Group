import Image from "next/image";
import { MapPin } from "lucide-react";
import { ContactForm } from "@/components/home/ContactForm";
import { BRAND } from "@/lib/constants";

function Instagram() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function PreFooter() {
  return (
    <section id="contact" className="scroll-mt-32 border-t border-blue-900/50 bg-zinc-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">{BRAND.name}</h2>
          <address className="mt-3 not-italic text-zinc-600">
            <p>{BRAND.addressLine1}</p>
            <p>{BRAND.addressLine2}</p>
          </address>
          <a href={BRAND.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-500 hover:text-blue-400">
            <MapPin size={16} aria-hidden /> Get directions
          </a>
          <p className="mt-8 text-sm font-bold uppercase tracking-widest text-zinc-900">Follow Us</p>
          <div className="mt-3">
            <a
              href={BRAND.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow ${BRAND.name} on Instagram`}
              className="inline-flex min-h-11 items-center gap-3 rounded-md bg-zinc-800 px-4 text-white transition hover:bg-blue-600"
            >
              <Instagram />
              <span className="text-sm font-semibold">{BRAND.socials.instagramHandle}</span>
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">Hours</h2>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest text-blue-500">Sales</p>
          <dl className="mt-2 space-y-1 text-zinc-600">
            {BRAND.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b border-zinc-200 py-1.5">
                <dt>{h.days}</dt>
                <dd className="text-zinc-900">{h.time}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 inline-block rounded-lg border border-blue-900/50 bg-zinc-950 p-3 shadow-neon">
            <Image src={BRAND.logo} alt={`${BRAND.name} logo`} width={160} height={160} className="h-40 w-40 rounded object-cover" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">Send Us a Message</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
