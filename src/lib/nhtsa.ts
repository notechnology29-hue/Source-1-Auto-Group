import type { DecodedVin } from "@/types/database";

export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

type NhtsaRow = Record<string, string | undefined>;

const clean = (v: string | undefined) => {
  const s = (v ?? "").trim();
  return s && s.toLowerCase() !== "not applicable" ? s : "";
};

function normalizeDrivetrain(raw: string): string {
  if (/4x4|4wd|4-wheel|four/i.test(raw)) return "4WD";
  if (/awd|all-wheel|4x2.*all/i.test(raw)) return "AWD";
  if (/fwd|front/i.test(raw)) return "FWD";
  if (/rwd|rear|4x2/i.test(raw)) return "RWD";
  return raw;
}

function buildEngine(row: NhtsaRow): string {
  const disp = parseFloat(clean(row.DisplacementL));
  const cyl = clean(row.EngineCylinders);
  const parts: string[] = [];
  if (Number.isFinite(disp)) parts.push(`${disp.toFixed(1)}L`);
  if (cyl) parts.push(`${cyl}-Cyl`);
  if (/yes|turbo/i.test(clean(row.Turbo))) parts.push("Turbo");
  const fuel = clean(row.FuelTypePrimary);
  if (/diesel|electric/i.test(fuel)) parts.push(fuel);
  return parts.join(" ");
}

const titleCase = (s: string) =>
  s.length > 3 && s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s;

export function parseNhtsaRow(row: NhtsaRow): DecodedVin | null {
  const make = titleCase(clean(row.Make));
  const model = clean(row.Model);
  if (!make || !model) return null;
  const year = parseInt(clean(row.ModelYear), 10);
  return {
    year: Number.isFinite(year) ? year : null,
    make,
    model,
    trim: clean(row.Trim),
    engine: buildEngine(row),
    drivetrain: normalizeDrivetrain(clean(row.DriveType)),
  };
}

export async function decodeVin(vin: string): Promise<DecodedVin | null> {
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) },
  );
  if (!res.ok) throw new Error(`NHTSA responded ${res.status}`);
  const json = (await res.json()) as { Results?: NhtsaRow[] };
  const row = json.Results?.[0];
  return row ? parseNhtsaRow(row) : null;
}
