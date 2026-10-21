import type { Vehicle, VehicleWithMedia } from "@/types/database";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Normalized listing details (DB value first, sensible inference second) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const BODY_CATEGORIES = ["Cars", "Trucks", "SUVs & Crossovers", "Vans"] as const;
export type BodyCategory = (typeof BODY_CATEGORIES)[number];

const TRUCK = /\b(1500|2500|3500|f-?150|f-?250|f-?350|silverado|sierra|tundra|tacoma|colorado|ranger|frontier|gladiator|ridgeline|titan)\b/i;
const VAN = /\b(sienna|odyssey|pacifica|caravan|transit|sprinter|promaster|express|carnival)\b/i;
const SUV = /\b(rav4|cr-?v|escape|explorer|bronco|wrangler|cherokee|tahoe|suburban|yukon|4runner|highlander|pilot|equinox|traverse|x[1-7]|q[3-8]|gx|lx|rx|cx-\d+|rogue|outback|forester|tucson|santa fe|sorento|sportage|durango|expedition|telluride|palisade)\b/i;

export function bodyCategory(v: Vehicle): BodyCategory {
  const raw = v.body_style ?? "";
  if (/truck|pickup/i.test(raw) || (!raw && TRUCK.test(v.model))) return "Trucks";
  if (/van|minivan/i.test(raw) || (!raw && VAN.test(v.model))) return "Vans";
  if (/suv|crossover|utility/i.test(raw) || (!raw && SUV.test(v.model))) return "SUVs & Crossovers";
  return "Cars";
}

export function fuelType(v: Vehicle): string {
  if (v.fuel_type) return v.fuel_type;
  const e = v.engine ?? "";
  if (/electric|\bev\b/i.test(e)) return "Electric";
  if (/hybrid/i.test(e)) return "Hybrid";
  if (/diesel/i.test(e)) return "Diesel";
  return "Gasoline";
}

export const transmissionOf = (v: Vehicle) => v.transmission || "Automatic";
export const interiorOf = (v: Vehicle) => v.interior_color || "Black";
export const exteriorOf = (v: Vehicle) => v.exterior_color || "N/A";
export const drivetrainOf = (v: Vehicle) => v.drivetrain || "N/A";
export const typeOf = () => "Pre-Owned";
export const locationOf = (v: Vehicle) => v.location || "Source 1 Auto Group";

export function vehicleTitle(v: Vehicle) {
  return `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;
}

export function mpgText(v: Vehicle) {
  if (v.mpg_city && v.mpg_highway) return `${v.mpg_city} City / ${v.mpg_highway} Hwy`;
  return "N/A";
}

export function imagesOf(v: VehicleWithMedia) {
  const imgs = v.vehicle_media.filter((m) => m.media_type === "image");
  return [...imgs.filter((m) => m.is_primary), ...imgs.filter((m) => !m.is_primary)];
}

const COLOR_HEX: [RegExp, string][] = [
  [/white|pearl|alpine|ivory|cream/i, "#E8ECF2"],
  [/black|agate|onyx|ebony|midnight/i, "#14161d"],
  [/red|torch|flame|ruby|maroon|burgundy/i, "#C4122B"],
  [/blue|blueprint|navy|cobalt/i, "#0066FF"],
  [/silver|steel|gr[ae]y|granite|charcoal|graphite|gunmetal/i, "#7b8190"],
  [/green|olive/i, "#2f6f4a"],
  [/gold|yellow|tan|beige|sand|brown|bronze|orange/i, "#b08a4a"],
];
export const colorHex = (name: string | null | undefined) =>
  COLOR_HEX.find(([re]) => re.test(name ?? ""))?.[1] ?? "#3f4452";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Query model (lives in the URL so pages stay server-rendered & shareable) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const SORTS = [
  { id: "price-desc", label: "Price - Highest" },
  { id: "price-asc", label: "Price - Lowest" },
  { id: "mileage-asc", label: "Mileage - Lowest" },
  { id: "year-desc", label: "Year - Newest" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export const RANGE_FACETS = [
  { key: "price", label: "Price", get: (v: Vehicle) => v.price, prefix: "$" },
  { key: "mileage", label: "Mileage", get: (v: Vehicle) => v.mileage, prefix: "" },
  { key: "mpg", label: "MPG City", get: (v: Vehicle) => v.mpg_city ?? null, prefix: "" },
  { key: "year", label: "Year", get: (v: Vehicle) => v.year, prefix: "" },
] as const;

export const LIST_FACETS = [
  { key: "make", label: "Make", get: (v: Vehicle) => v.make },
  { key: "model", label: "Model", get: (v: Vehicle) => v.model },
  { key: "trim", label: "Trim", get: (v: Vehicle) => v.trim ?? "" },
  { key: "exterior", label: "Exterior", get: (v: Vehicle) => (v.exterior_color ? exteriorOf(v) : "") },
  { key: "interior", label: "Interior", get: (v: Vehicle) => interiorOf(v) },
  { key: "body", label: "Standardized Body Style", get: (v: Vehicle) => bodyCategory(v) },
  { key: "drivetrain", label: "Drivetrain", get: (v: Vehicle) => (v.drivetrain ? drivetrainOf(v) : "") },
  { key: "transmission", label: "Transmission", get: (v: Vehicle) => transmissionOf(v) },
  { key: "fuel", label: "Fuel Type", get: (v: Vehicle) => fuelType(v) },
  { key: "type", label: "Type", get: () => typeOf() },
] as const;

export type RangeKey = (typeof RANGE_FACETS)[number]["key"];
export type ListKey = (typeof LIST_FACETS)[number]["key"];

/** Feature quick-links from the Pre-Owned mega menu. */
export const FEATURE_FILTERS = {
  mpg30: { label: "Over 30 MPG", test: (v: Vehicle) => (v.mpg_highway ?? 0) >= 30 || (v.mpg_city ?? 0) >= 30 },
  convertible: { label: "Convertible", test: (v: Vehicle) => /convertible|targa|cabrio|roadster/i.test(v.features.join(" ")) },
  moonroof: { label: "Moonroof", test: (v: Vehicle) => /moonroof|sunroof|panoramic/i.test(v.features.join(" ")) },
  leather: { label: "Leather seats", test: (v: Vehicle) => /leather/i.test(v.features.join(" ")) },
  heated: { label: "Heated seats", test: (v: Vehicle) => /heated/i.test(v.features.join(" ")) },
  keyless: { label: "Keyless ignition/entry", test: (v: Vehicle) => /keyless|push.?button/i.test(v.features.join(" ")) },
} as const;
export type FeatureId = keyof typeof FEATURE_FILTERS;

export interface InventoryQuery {
  q: string;
  sort: SortId;
  view: "grid" | "list";
  lists: Record<ListKey, string[]>;
  ranges: Record<RangeKey, { min?: number; max?: number }>;
  features: FeatureId[];
}

type RawParams = Record<string, string | string[] | undefined>;

const all = (raw: RawParams, key: string) => {
  const v = raw[key];
  return (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
};
const num = (raw: RawParams, key: string) => {
  const s = all(raw, key)[0];
  if (!s || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export function parseInventoryQuery(raw: RawParams): InventoryQuery {
  const sort = all(raw, "sort")[0];
  return {
    q: all(raw, "q")[0]?.slice(0, 100) ?? "",
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortId) : "price-desc",
    view: all(raw, "view")[0] === "list" ? "list" : "grid",
    lists: Object.fromEntries(LIST_FACETS.map((f) => [f.key, all(raw, f.key)])) as InventoryQuery["lists"],
    ranges: Object.fromEntries(
      RANGE_FACETS.map((f) => [f.key, { min: num(raw, `${f.key}_min`), max: num(raw, `${f.key}_max`) }]),
    ) as InventoryQuery["ranges"],
    features: all(raw, "feature").filter((f): f is FeatureId => f in FEATURE_FILTERS),
  };
}

export function appliedCount(q: InventoryQuery) {
  return (
    LIST_FACETS.filter((f) => q.lists[f.key].length).length +
    RANGE_FACETS.filter((f) => q.ranges[f.key].min !== undefined || q.ranges[f.key].max !== undefined).length +
    (q.features.length ? 1 : 0)
  );
}

function matchesQueryText(v: Vehicle, q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = `${v.year} ${v.make} ${v.model} ${v.trim ?? ""} ${v.exterior_color ?? ""} ${bodyCategory(v)} ${v.stock_number}`.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

/** `skip` leaves one facet out, so its own option counts reflect "what if I changed only this filter". */
export function filterVehicles(vehicles: VehicleWithMedia[], q: InventoryQuery, skip?: ListKey | RangeKey) {
  return vehicles.filter((v) => {
    if (!matchesQueryText(v, q.q)) return false;
    for (const f of LIST_FACETS) {
      const sel = q.lists[f.key];
      if (f.key !== skip && sel.length && !sel.includes(f.get(v))) return false;
    }
    for (const f of RANGE_FACETS) {
      const { min, max } = q.ranges[f.key];
      if (f.key === skip || (min === undefined && max === undefined)) continue;
      const val = f.get(v);
      if (val === null || (min !== undefined && val < min) || (max !== undefined && val > max)) return false;
    }
    return q.features.every((id) => FEATURE_FILTERS[id].test(v));
  });
}

export function sortVehicles(vehicles: VehicleWithMedia[], sort: SortId) {
  const list = [...vehicles];
  switch (sort) {
    case "price-asc": return list.sort((a, b) => a.price - b.price);
    case "mileage-asc": return list.sort((a, b) => a.mileage - b.mileage);
    case "year-desc": return list.sort((a, b) => b.year - a.year || a.price - b.price);
    default: return list.sort((a, b) => b.price - a.price);
  }
}

export interface FacetOption { value: string; count: number }
export interface ListFacetData { key: ListKey; label: string; options: FacetOption[]; selected: string[] }
export interface RangeFacetData { key: RangeKey; label: string; low: number; high: number; min?: number; max?: number }

export function buildFacets(vehicles: VehicleWithMedia[], q: InventoryQuery) {
  const lists: ListFacetData[] = LIST_FACETS.map((f) => {
    const counts = new Map<string, number>();
    for (const v of filterVehicles(vehicles, q, f.key)) {
      const val = f.get(v);
      if (val) counts.set(val, (counts.get(val) ?? 0) + 1);
    }
    for (const s of q.lists[f.key]) if (!counts.has(s)) counts.set(s, 0);
    const options = [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value));
    return { key: f.key, label: f.label, options, selected: q.lists[f.key] };
  });
  const ranges: RangeFacetData[] = RANGE_FACETS.map((f) => {
    const vals = vehicles.map((v) => f.get(v)).filter((n): n is number => n !== null);
    return {
      key: f.key,
      label: f.label,
      low: vals.length ? Math.min(...vals) : 0,
      high: vals.length ? Math.max(...vals) : 0,
      ...q.ranges[f.key],
    };
  });
  return { lists, ranges };
}

export interface BodyCounts {
  all: number;
  hybrid: number;
  [category: string]: number;
}

export function bodyCounts(vehicles: VehicleWithMedia[]): BodyCounts {
  const counts: BodyCounts = { all: vehicles.length, hybrid: 0 };
  for (const c of BODY_CATEGORIES) counts[c] = 0;
  for (const v of vehicles) {
    counts[bodyCategory(v)]++;
    if (/hybrid|electric/i.test(fuelType(v))) counts.hybrid++;
  }
  return counts;
}
