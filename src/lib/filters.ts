import type { Vehicle } from "@/types/database";

export type QuickFilter = "performance" | "trucks" | "under25k";

export const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "performance", label: "Performance" },
  { id: "trucks", label: "4x4 & Trucks" },
  { id: "under25k", label: "Under $25k" },
];

const TRUCK_MODELS = /\b(1500|2500|3500|f-?150|f-?250|silverado|sierra|tundra|tacoma|colorado|ranger|frontier|gladiator)\b/i;

type Filterable = Pick<Vehicle, "year" | "make" | "model" | "trim" | "price" | "drivetrain" | "engine" | "features">;

export function matchesFilter(v: Filterable, filter: QuickFilter): boolean {
  switch (filter) {
    case "under25k":
      return v.price < 25000;
    case "trucks":
      return TRUCK_MODELS.test(v.model) || /4wd|4x4/i.test(v.drivetrain ?? "");
    case "performance":
      return (
        /v8|turbo|supercharg|v10|v12/i.test(v.engine ?? "") ||
        v.features.some((f) => /performance/i.test(f))
      );
  }
}

export function matchesQuery(v: Filterable, q: string): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = `${v.year} ${v.make} ${v.model} ${v.trim ?? ""}`.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export function parseFilter(raw: string | string[] | undefined): QuickFilter | null {
  const val = Array.isArray(raw) ? raw[0] : raw;
  return QUICK_FILTERS.some((f) => f.id === val) ? (val as QuickFilter) : null;
}
