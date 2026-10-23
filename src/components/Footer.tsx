import { MapPin, Phone, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { PoweredBy } from "@/components/PoweredBy";

export function Footer() {
  return (
    <footer className="border-t border-neon/30 bg-carbon-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-3">
        <div>
          <p className="chrome-text text-xl font-extrabold tracking-wide">SOURCE 1 AUTO GROUP</p>
          <p className="mt-3 max-w-xs text-sm text-chrome-dim">
            Pre-owned vehicles with nothing hidden. Every flaw, upgrade, and repair is disclosed on the photos.
          </p>
        </div>
        <div className="space-y-3 text-sm text-chrome-dim">
          <p className="font-semibold uppercase tracking-widest text-chrome">Contact</p>
          <a href={BRAND.phoneHref} className="flex min-h-11 items-center gap-2 hover:text-white sm:min-h-0">
            <Phone size={16} className="text-hot" aria-hidden /> {BRAND.phoneDisplay}
          </a>
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-neon" aria-hidden /> Arizona
          </p>
        </div>
        <div className="space-y-3 text-sm text-chrome-dim">
          <p className="font-semibold uppercase tracking-widest text-chrome">Our Promise</p>
          <p className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-neon" aria-hidden /> Full-disclosure inspections
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-neon" aria-hidden /> 24-hour holds, no pressure
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-chrome-dark">
        © 2026 {BRAND.name}. Payment estimates are illustrative and subject to credit approval.
        <PoweredBy className="mt-2" />
      </div>
    </footer>
  );
}
