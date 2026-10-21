"use server";

import type { ActionResult } from "@/types/database";

export interface CarfaxReport {
  vin: string;
  titleClean: boolean;
  titleText: string;
  accidentCount: number;
  accidentText: string;
  ownerCount: number;
  ownerText: string;
  serviceRecords: number;
  serviceText: string;
  lastOdometer: number | null;
  reportUrl: string;
  /** True when CARFAX_API_URL / CARFAX_API_KEY are not configured and sample data is shown. */
  isMock: boolean;
}

const VIN = /^[A-HJ-NPR-Z0-9]{17}$/;
const TIMEOUT_MS = 8000;

const fallbackUrl = (vin: string) => `https://www.carfax.com/VehicleHistory/p/Report.cfx?vin=${encodeURIComponent(vin)}`;

function summarize(vin: string, f: {
  titleClean: boolean;
  titleBrand?: string;
  accidentCount: number;
  ownerCount: number;
  serviceRecords: number;
  lastOdometer: number | null;
  reportUrl?: string;
  isMock: boolean;
}): CarfaxReport {
  const { accidentCount: a, ownerCount: o, serviceRecords: s } = f;
  return {
    vin,
    titleClean: f.titleClean,
    titleText: f.titleClean ? "Clean Title - No Salvage/Junk/Rebuilt" : `Title Brand Reported${f.titleBrand ? `: ${f.titleBrand}` : ""}`,
    accidentCount: a,
    accidentText: a === 0 ? "No Accidents or Damage Reported" : `${a} Accident${a === 1 ? "" : "s"} / Damage Reported`,
    ownerCount: o,
    ownerText: o === 1 ? "CARFAX 1-Owner" : `${o} Previous Owners`,
    serviceRecords: s,
    serviceText: `${s} Service History Record${s === 1 ? "" : "s"}`,
    lastOdometer: f.lastOdometer,
    reportUrl: f.reportUrl || fallbackUrl(vin),
    isMock: f.isMock,
  };
}

/** Deterministic sample so each VIN renders consistently in development. */
function mockReport(vin: string): CarfaxReport {
  let h = 0;
  for (const ch of vin) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return summarize(vin, {
    titleClean: true,
    accidentCount: 0,
    ownerCount: (h % 3) + 1,
    serviceRecords: 6 + (h % 14),
    lastOdometer: 20000 + (h % 45000),
    isMock: true,
  });
}

const asNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
const asStr = (v: unknown) => (typeof v === "string" && v ? v : undefined);

/** Normalizes the history payload; field names are accepted in a few common spellings. */
function fromApi(vin: string, raw: unknown): CarfaxReport | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const d = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  const pick = (...keys: string[]) => keys.map((k) => d[k]).find((v) => v !== undefined && v !== null);

  const accidents = asNum(pick("accident_count", "accidentCount", "accidents"));
  const owners = asNum(pick("owner_count", "ownerCount", "owners"));
  if (accidents === null && owners === null) return null;

  const brands = pick("title_brands", "titleBrands");
  const brandList = Array.isArray(brands) ? brands.filter((b): b is string => typeof b === "string") : [];
  const titleStatus = asStr(pick("title_status", "titleStatus"));
  const clean = brandList.length === 0 && (!titleStatus || /clean/i.test(titleStatus));

  return summarize(vin, {
    titleClean: clean,
    titleBrand: brandList[0] ?? (clean ? undefined : titleStatus),
    accidentCount: accidents ?? 0,
    ownerCount: owners ?? 1,
    serviceRecords: asNum(pick("service_record_count", "serviceRecordCount", "service_records")) ?? 0,
    lastOdometer: asNum(pick("last_odometer", "lastOdometer", "last_reported_odometer")),
    reportUrl: asStr(pick("carfax_url", "report_url", "reportUrl")),
    isMock: false,
  });
}

export async function getCarfaxReport(vin: string): Promise<ActionResult<CarfaxReport>> {
  const clean = String(vin ?? "").trim().toUpperCase();
  if (!VIN.test(clean)) return { ok: false, error: "Invalid VIN." };

  const url = process.env.CARFAX_API_URL;
  const key = process.env.CARFAX_API_KEY;
  if (!url || !key) return { ok: true, data: mockReport(clean) };

  try {
    const endpoint = new URL(url);
    endpoint.searchParams.set("vin", clean);
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}`, "x-api-key": key, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`CARFAX responded ${res.status}`);
    const report = fromApi(clean, await res.json());
    if (!report) throw new Error("Unrecognized CARFAX response");
    return { ok: true, data: report };
  } catch (e) {
    console.error("getCarfaxReport failed:", e instanceof Error ? e.message : e);
    return { ok: false, error: "Vehicle history is temporarily unavailable." };
  }
}
