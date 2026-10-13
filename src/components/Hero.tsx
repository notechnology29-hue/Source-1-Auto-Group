"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { QUICK_FILTERS, type QuickFilter } from "@/lib/filters";

interface Props {
  initialQuery: string;
  activeFilter: QuickFilter | null;
}

const MUX_ID = process.env.NEXT_PUBLIC_HERO_MUX_PLAYBACK_ID;

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
    <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden pb-10 pt-24 sm:pt-16">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_100%,#0b2a66_0%,#090a0f_65%)]" />
      {MUX_ID && (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src={`https://stream.mux.com/${MUX_ID}/high.mp4`} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-carbon/70 via-transparent to-carbon" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-neon to-transparent shadow-neon" />

      <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-neon-light sm:text-xs sm:tracking-[0.4em]">The Midnight Showroom</p>
        <h1 className="chrome-text text-[2.5rem] font-black leading-[1.08] sm:text-7xl sm:leading-[1.05]">
          Used cars.<br />Zero secrets.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-chrome-dim sm:mt-5 sm:text-lg">
          Every scratch, upgrade, and repair is pinned right on the photos. Find your ride, see your payment, hold it for 24 hours.
        </p>

        <form
          onSubmit={onSubmit}
          role="search"
          className="neon-frame glass mx-auto mt-10 flex max-w-2xl items-center gap-2 p-2"
        >
          <Search className="ml-3 shrink-0 text-chrome-dark" size={20} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model, or year…"
            aria-label="Search inventory"
            className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-chrome placeholder:text-chrome-dark focus:outline-none"
          />
          <button type="submit" className="btn-hot min-h-11 !px-4 sm:!px-5">Search</button>
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
