import Image from "next/image";
import { MapPin } from "lucide-react";
import { ContactForm } from "@/components/home/ContactForm";
import { BRAND } from "@/lib/constants";

const socialBtn = "flex h-11 w-11 items-center justify-center rounded-md bg-zinc-800 text-white transition hover:bg-blue-600";

function Facebook() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.9s-1.4-.3-2.6-.3c-2.7 0-4.4 1.6-4.4 4.5v2.4H7.2v3.3H10V22h3.5z" /></svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  );
}
function YouTube() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
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
          <div className="mt-3 flex gap-3">
            <a href={BRAND.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialBtn}><Facebook /></a>
            <a href={BRAND.socials.x} target="_blank" rel="noopener noreferrer" aria-label="X" className={socialBtn}><XIcon /></a>
            <a href={BRAND.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={socialBtn}><YouTube /></a>
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
