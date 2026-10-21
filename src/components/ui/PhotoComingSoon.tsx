import Image from "next/image";
import { BRAND } from "@/lib/constants";

interface Props {
  /** `hero` is the large VDP banner; `card` is the compact grid tile. */
  variant?: "card" | "hero";
}

/** Branded stand-in for vehicles that have no uploaded photos yet, so layouts never look broken. */
export function PhotoComingSoon({ variant = "card" }: Props) {
  const hero = variant === "hero";
  return (
    <div
      role="img"
      aria-label={hero ? "Coming soon: vehicle currently in detail and inspection" : "Photo coming soon"}
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,#0b2a66_0%,#090a0f_70%)]"
    >
      <div className="absolute inset-2 rounded-md border border-blue-500/60 shadow-[0_0_24px_rgba(0,102,255,0.45),inset_0_0_24px_rgba(0,102,255,0.25)]" />
      <Image
        src={BRAND.logo}
        alt=""
        width={400}
        height={400}
        className={`absolute object-contain opacity-20 grayscale ${hero ? "h-4/5 w-auto" : "h-3/4 w-auto"}`}
      />
      <div className="relative z-10 px-4 text-center">
        <span className={`inline-block -skew-x-6 bg-blue-600 font-black uppercase tracking-[0.2em] text-white shadow-neon ${hero ? "px-8 py-3 text-2xl sm:text-4xl" : "px-4 py-1.5 text-sm"}`}>
          {hero ? "Coming Soon" : "Photo Coming Soon"}
        </span>
        {hero && <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-zinc-300 sm:text-base">Vehicle Currently in Detail / Inspection</p>}
      </div>
    </div>
  );
}
