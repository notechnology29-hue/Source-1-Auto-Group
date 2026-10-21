"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { ListFacetData, RangeFacetData } from "@/lib/inventory";

interface Props {
  lists: ListFacetData[];
  ranges: RangeFacetData[];
  applied: number;
}

const nf = new Intl.NumberFormat("en-US");

function useUrlUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
}

function Section({ title, active, children }: { title: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(active);
  return (
    <div className="border-b border-zinc-200">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full items-center justify-between px-4 text-left text-sm font-bold uppercase tracking-wide text-zinc-900 hover:text-blue-500"
      >
        <span className="flex items-center gap-2">
          {title}
          {active && <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="filter applied" />}
        </span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RangeSection({ facet }: { facet: RangeFacetData }) {
  const update = useUrlUpdater();
  const active = facet.min !== undefined || facet.max !== undefined;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update((p) => {
      for (const side of ["min", "max"] as const) {
        const raw = String(fd.get(side) ?? "").trim();
        if (raw && Number.isFinite(Number(raw))) p.set(`${facet.key}_${side}`, raw);
        else p.delete(`${facet.key}_${side}`);
      }
    });
  }

  return (
    <Section title={facet.label} active={active}>
      <form onSubmit={onSubmit} key={`${facet.min}-${facet.max}`} className="space-y-2">
        <div className="flex items-center gap-2">
          <input name="min" type="number" inputMode="numeric" defaultValue={facet.min} placeholder={nf.format(facet.low)} aria-label={`${facet.label} minimum`} className="h-10 w-full min-w-0 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none" />
          <span className="text-zinc-500">-</span>
          <input name="max" type="number" inputMode="numeric" defaultValue={facet.max} placeholder={nf.format(facet.high)} aria-label={`${facet.label} maximum`} className="h-10 w-full min-w-0 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none" />
        </div>
        <button type="submit" className="h-9 w-full rounded bg-blue-600 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700">Apply</button>
      </form>
    </Section>
  );
}

function ListSection({ facet }: { facet: ListFacetData }) {
  const update = useUrlUpdater();
  const toggle = (value: string) =>
    update((p) => {
      const cur = p.getAll(facet.key);
      p.delete(facet.key);
      (cur.includes(value) ? cur.filter((c) => c !== value) : [...cur, value]).forEach((c) => p.append(facet.key, c));
    });

  return (
    <Section title={facet.label} active={facet.selected.length > 0}>
      {facet.options.length === 0 ? (
        <p className="text-xs text-zinc-500">No options</p>
      ) : (
        <ul className="max-h-56 space-y-0.5 overflow-y-auto">
          {facet.options.map((o) => (
            <li key={o.value}>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900">
                <input
                  type="checkbox"
                  checked={facet.selected.includes(o.value)}
                  onChange={() => toggle(o.value)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="flex-1">{o.value}</span>
                <span className="text-xs text-zinc-500">({o.count})</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function FilterSidebar({ lists, ranges, applied }: Props) {
  const update = useUrlUpdater();
  const [mobileOpen, setMobileOpen] = useState(false);
  const byKey = Object.fromEntries([...lists, ...ranges].map((f) => [f.key, f]));
  // Matches the order requested for the dealership layout.
  const order = ["price", "mileage", "mpg", "year", "make", "model", "trim", "exterior", "interior", "body", "drivetrain", "transmission", "fuel", "type"];

  const clear = () =>
    update((p) => {
      for (const k of [...p.keys()]) if (k !== "q" && k !== "sort" && k !== "view") p.delete(k);
    });

  return (
    <aside aria-label="Filters" className="rounded-lg border border-zinc-200 bg-zinc-50 lg:sticky lg:top-36 lg:self-start">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-900">
          <SlidersHorizontal size={16} className="text-blue-500" aria-hidden /> Filters
        </h2>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span>{applied} applied</span>
          {applied > 0 && <button type="button" onClick={clear} className="font-semibold text-red-500 hover:text-red-400">[Clear]</button>}
          <button type="button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)} className="rounded bg-zinc-800 px-3 py-1.5 font-semibold text-white lg:hidden">
            {mobileOpen ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div className={`${mobileOpen ? "block" : "hidden"} lg:block`}>
        {order.map((key) => {
          const f = byKey[key];
          if (!f) return null;
          return "options" in f ? <ListSection key={key} facet={f} /> : <RangeSection key={key} facet={f} />;
        })}
      </div>
    </aside>
  );
}
