"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { QUICK_FILTERS, type QuickFilter } from "@/lib/filters";

interface Props {
  initialQuery: string;
  activeFilter: QuickFilter | null;
}

export function Hero({ initialQuery, activeFilter }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const go = (q: string, filter: QuickFilter | null) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (filter) params.set("filter", filter);
    const qs = params.toString();
    router.push(`/${qs ? `?${qs}` : ""}#inventory`, { scroll: false });
    document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go(query, activeFilter);
  };

  return (
    <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden pb-10 pt-24 sm:pt-28">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_100%,#0b2a66_0%,#090a0f_65%)]" />
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/hero-poster.jpg"
        aria-hidden
      >
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-carbon/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-carbon/80 via-carbon/10 to-carbon" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-neon to-transparent shadow-neon" />

      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <h1 className="chrome-text text-[clamp(1.5rem,8.5vw,2.75rem)] font-black leading-[1.1] drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
          Driven By Performance.<br />Built On Trust.
        </h1>
        <h2 className="mt-4 text-xl font-bold text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] sm:mt-5 sm:text-3xl">Drive Without Doubt.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-[15px] leading-relaxed text-chrome drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)] sm:mt-3 sm:text-lg">
          Interactive transparency inspections, live monthly payment customization, and instant 24-hour holds—all from your screen.
        </p>

        <form
          onSubmit={onSubmit}
          role="search"
          className="neon-frame glass mx-auto mt-8 flex max-w-2xl items-center gap-2 p-2 sm:mt-10"
        >
          <Search className="ml-3 shrink-0 text-chrome-dark" size={20} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model, or year…"
            aria-label="Search inventory"
            className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-chrome placeholder:text-chrome-dark focus:outline-none"
          />
          <button type="submit" aria-label="Search" className="btn-hot min-h-11 shrink-0 !px-4 sm:!px-5">
            <Search size={18} className="sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Quick filters">
          {QUICK_FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => go(query, active ? null : f.id)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-neon bg-neon text-white shadow-neon"
                    : "border-white/15 bg-white/5 text-chrome-dim hover:border-neon/60 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
