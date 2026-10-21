interface Props {
  size?: "card" | "hero";
}

/** "COMING SOON" banner laid across a vehicle photo. Non-interactive so pins, dots and buttons underneath keep working. */
export function ComingSoonOverlay({ size = "card" }: Props) {
  const hero = size === "hero";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-zinc-950/35">
      <span
        className={`-skew-x-6 bg-blue-600/95 font-black uppercase text-white shadow-neon ${
          hero ? "px-5 py-2 text-xl tracking-[0.15em] sm:px-8 sm:py-3 sm:text-4xl sm:tracking-[0.2em]" : "px-3 py-1 text-xs tracking-[0.15em] sm:px-4 sm:py-1.5 sm:text-sm sm:tracking-[0.2em]"
        }`}
      >
        Coming Soon
      </span>
    </div>
  );
}
