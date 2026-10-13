"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ScanLine, Trash2 } from "lucide-react";
import { createVehicleAction, decodeVinAction, deleteVehicleAction, updateVehicleAction } from "@/app/actions/admin";
import { HotspotStudio } from "@/components/admin/HotspotStudio";
import { MediaManager } from "@/components/admin/MediaManager";
import { MediaUploader } from "@/components/admin/MediaUploader";
import type { TransparencyHotspot, VehicleMedia, VehicleWithMedia } from "@/types/database";

const EMPTY = {
  stock_number: "",
  vin: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  engine: "",
  drivetrain: "",
  condition: "good",
  status: "available",
  price: "",
  mileage: "",
  exterior_color: "",
  features: "",
  clean_carfax: false,
};
type Form = typeof EMPTY;

function toForm(v: VehicleWithMedia): Form {
  return {
    stock_number: v.stock_number,
    vin: v.vin,
    year: String(v.year),
    make: v.make,
    model: v.model,
    trim: v.trim ?? "",
    engine: v.engine ?? "",
    drivetrain: v.drivetrain ?? "",
    condition: v.condition,
    status: v.status,
    price: String(v.price),
    mileage: String(v.mileage),
    exterior_color: v.exterior_color ?? "",
    features: v.features.join(", "),
    clean_carfax: v.clean_carfax,
  };
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-xs uppercase tracking-wider text-chrome-dark ${className}`}>
      {label}
      <div className="mt-1 normal-case tracking-normal">{children}</div>
    </label>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-carbon-50 p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-white">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-neon bg-neon/10 text-sm text-neon-light">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function IntakeWorkspace({ initial }: { initial: VehicleWithMedia | null }) {
  const [form, setForm] = useState<Form>(initial ? toForm(initial) : EMPTY);
  const [vehicle, setVehicle] = useState<{ id: string; stock_number: string; label: string } | null>(
    initial ? { id: initial.id, stock_number: initial.stock_number, label: `${initial.year} ${initial.make} ${initial.model}` } : null,
  );
  const [media, setMedia] = useState<VehicleMedia[]>(initial?.vehicle_media ?? []);
  const [hotspots, setHotspots] = useState<TransparencyHotspot[]>(initial?.transparency_hotspots ?? []);

  const [decoding, setDecoding] = useState(false);
  const [decodeMsg, setDecodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function decode() {
    setDecoding(true);
    setDecodeMsg(null);
    const res = await decodeVinAction(form.vin);
    setDecoding(false);
    if (!res.ok) return setDecodeMsg({ ok: false, text: res.error });
    const d = res.data;
    setForm((f) => ({
      ...f,
      vin: f.vin.trim().toUpperCase(),
      year: d.year ? String(d.year) : f.year,
      make: d.make || f.make,
      model: d.model || f.model,
      trim: d.trim || f.trim,
      engine: d.engine || f.engine,
      drivetrain: d.drivetrain || f.drivetrain,
    }));
    setDecodeMsg({ ok: true, text: `Decoded: ${d.year ?? ""} ${d.make} ${d.model}. Review and fill in the rest.` });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const res = vehicle ? await updateVehicleAction(vehicle.id, form) : await createVehicleAction(form);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    const v = res.data;
    setVehicle({ id: v.id, stock_number: v.stock_number, label: `${v.year} ${v.make} ${v.model}` });
    setSaved(true);
    window.history.replaceState(null, "", `/admin/intake?vehicle=${v.id}`);
  }

  async function remove() {
    if (!vehicle) return;
    if (!window.confirm(`Permanently delete ${vehicle.label} (Stock # ${vehicle.stock_number}) with all its photos and hotspots?`)) return;
    setDeleting(true);
    setError("");
    const res = await deleteVehicleAction(vehicle.id);
    if (!res.ok) {
      setDeleting(false);
      return setError(res.error);
    }
    router.push("/admin/inventory");
  }

  function startOver() {
    setForm(EMPTY);
    setVehicle(null);
    setMedia([]);
    setHotspots([]);
    setDecodeMsg(null);
    setSaved(false);
    window.history.replaceState(null, "", "/admin/intake");
  }

  return (
    <div className="space-y-8">
      <Step n={1} title="Vehicle details">
        <form onSubmit={submit} className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="VIN (17 characters)" className="flex-1">
                <input
                  value={form.vin}
                  onChange={(e) => set("vin", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17))}
                  maxLength={17}
                  required
                  spellCheck={false}
                  className="input-dark font-mono tracking-widest"
                  placeholder="1C6SRFFT5NN123456"
                />
              </Field>
              <button type="button" onClick={decode} disabled={decoding || form.vin.length !== 17} className="btn-neon">
                {decoding ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ScanLine size={16} aria-hidden />}
                Decode VIN
              </button>
            </div>
            {decodeMsg && (
              <p role={decodeMsg.ok ? "status" : "alert"} className={`text-sm ${decodeMsg.ok ? "text-emerald-400" : "text-hot"}`}>
                {decodeMsg.text}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Stock #"><input required value={form.stock_number} onChange={(e) => set("stock_number", e.target.value)} className="input-dark" placeholder="S1-1007" /></Field>
              <Field label="Year"><input required type="number" min={1980} max={2100} value={form.year} onChange={(e) => set("year", e.target.value)} className="input-dark" /></Field>
              <Field label="Make"><input required value={form.make} onChange={(e) => set("make", e.target.value)} className="input-dark" /></Field>
              <Field label="Model"><input required value={form.model} onChange={(e) => set("model", e.target.value)} className="input-dark" /></Field>
              <Field label="Trim"><input value={form.trim} onChange={(e) => set("trim", e.target.value)} className="input-dark" /></Field>
              <Field label="Engine"><input value={form.engine} onChange={(e) => set("engine", e.target.value)} className="input-dark" /></Field>
              <Field label="Drivetrain"><input value={form.drivetrain} onChange={(e) => set("drivetrain", e.target.value)} className="input-dark" placeholder="4WD, AWD, FWD, RWD" /></Field>
              <Field label="Exterior color"><input value={form.exterior_color} onChange={(e) => set("exterior_color", e.target.value)} className="input-dark" /></Field>
              <Field label="Price ($)"><input required type="number" min={0} step={1} value={form.price} onChange={(e) => set("price", e.target.value)} className="input-dark" /></Field>
              <Field label="Mileage"><input required type="number" min={0} step={1} value={form.mileage} onChange={(e) => set("mileage", e.target.value)} className="input-dark" /></Field>
              <Field label="Condition">
                <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="input-dark">
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className="input-dark">
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </Field>
            </div>

            <Field label="Features (comma-separated)">
              <input value={form.features} onChange={(e) => set("features", e.target.value)} className="input-dark" placeholder="Heated Seats, Tow Package, Apple CarPlay" />
            </Field>

            <label className="flex items-center gap-2 text-sm text-chrome">
              <input type="checkbox" checked={form.clean_carfax} onChange={(e) => set("clean_carfax", e.target.checked)} className="h-4 w-4 accent-[#0066FF]" />
              Clean CARFAX
            </label>

            {error && <p role="alert" className="rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">{error}</p>}
            {saved && <p role="status" className="text-sm text-emerald-400">Changes saved.</p>}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving || deleting} className="btn-hot">
                {saving ? "Saving…" : vehicle ? "Save changes" : "Save vehicle & continue"}
              </button>
              {vehicle && (
                <button type="button" onClick={remove} disabled={saving || deleting} className="btn-neon !border-hot/60 !bg-hot/10 text-hot">
                  <Trash2 size={16} aria-hidden /> {deleting ? "Deleting…" : "Delete vehicle"}
                </button>
              )}
            </div>
          </form>
        </Step>

      {vehicle && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="flex items-center gap-2 text-sm text-chrome">
              <CheckCircle2 size={18} className="text-emerald-400" aria-hidden />
              <strong>{vehicle.label}</strong> · Stock # {vehicle.stock_number}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/inventory" className="btn-neon !px-4 !py-2 text-sm">All inventory</Link>
              <Link href="/" className="btn-neon !px-4 !py-2 text-sm">View storefront</Link>
              <button type="button" onClick={startOver} className="btn-hot !px-4 !py-2 text-sm">Add another vehicle</button>
            </div>
          </div>

          <Step n={2} title="Photos & walkaround video">
            <MediaUploader
              vehicleId={vehicle.id}
              stockNumber={vehicle.stock_number}
              onUploaded={(m) => setMedia((all) => [...all, m])}
            />
            <MediaManager
              vehicleId={vehicle.id}
              media={media}
              onPrimary={(id) => setMedia((all) => all.map((m) => (m.media_type === "image" ? { ...m, is_primary: m.id === id } : m)))}
              onDeleted={(id, newPrimaryId) => {
                setMedia((all) =>
                  all.filter((m) => m.id !== id).map((m) => (newPrimaryId ? { ...m, is_primary: m.id === newPrimaryId } : m)),
                );
                setHotspots((all) => all.filter((h) => h.media_id !== id));
              }}
            />
          </Step>

          <Step n={3} title="Transparency hotspot studio">
            <HotspotStudio
              vehicleId={vehicle.id}
              media={media}
              hotspots={hotspots}
              onSaved={(h) => setHotspots((all) => [...all, h])}
              onDeleted={(id) => setHotspots((all) => all.filter((h) => h.id !== id))}
            />
          </Step>
        </>
      )}
    </div>
  );
}
