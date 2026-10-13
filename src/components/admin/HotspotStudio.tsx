"use client";

import { useState, type MouseEvent } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { deleteHotspotAction, saveHotspotAction } from "@/app/actions/admin";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { HOTSPOT_STYLES } from "@/lib/constants";
import type { HotspotSeverity, TransparencyHotspot, VehicleMedia } from "@/types/database";

interface Props {
  vehicleId: string;
  media: VehicleMedia[];
  hotspots: TransparencyHotspot[];
  onSaved: (h: TransparencyHotspot) => void;
  onDeleted: (id: string) => void;
}

interface Draft {
  x: number;
  y: number;
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n * 100) / 100));

export function HotspotStudio({ vehicleId, media, hotspots, onSaved, onDeleted }: Props) {
  const images = media.filter((m) => m.media_type === "image");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<HotspotSeverity>("cosmetic");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const current = images.find((m) => m.id === selectedId) ?? images.find((m) => m.is_primary) ?? images[0];
  const spots = hotspots.filter((h) => h.media_id === current?.id);

  if (!current) {
    return <p className="text-sm text-chrome-dark">Upload at least one photo to start dropping transparency pins.</p>;
  }

  const placePin = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDraft({
      x: clamp(((e.clientX - rect.left) / rect.width) * 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100),
    });
    setError("");
  };

  const reset = () => {
    setDraft(null);
    setTitle("");
    setDescription("");
    setSeverity("cosmetic");
    setError("");
  };

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError("");
    const res = await saveHotspotAction({
      vehicle_id: vehicleId,
      media_id: current!.id,
      x_coordinate: draft.x,
      y_coordinate: draft.y,
      title,
      description,
      severity,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    onSaved(res.data);
    reset();
  }

  async function remove(id: string) {
    const res = await deleteHotspotAction(id);
    if (res.ok) onDeleted(id);
    else setError(res.error);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        {/* Same 16:10 frame + object-cover as the public HotspotShowcase so pin coordinates match exactly. */}
        <div
          onClick={placePin}
          className="neon-frame relative aspect-[16/10] cursor-crosshair overflow-hidden bg-carbon-100"
          role="application"
          aria-label="Click the photo to drop a pin"
        >
          <VehicleImage src={current.url} alt="Vehicle photo to annotate" sizes="(min-width: 1024px) 60vw, 100vw" />

          {spots.map((h, i) => (
            <span
              key={h.id}
              title={h.title}
              style={{ left: `${h.x_coordinate}%`, top: `${h.y_coordinate}%`, backgroundColor: HOTSPOT_STYLES[h.severity].color }}
              className="pointer-events-none absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[11px] font-bold text-white"
            >
              {i + 1}
            </span>
          ))}

          {draft && (
            <span
              style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
              className="pointer-events-none absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-pin-pulse place-items-center rounded-full border-2 border-dashed border-white bg-neon/80 text-white"
            >
              <MapPin size={16} aria-hidden />
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-label="Select photo"
                aria-pressed={m.id === current.id}
                onClick={() => {
                  setSelectedId(m.id);
                  reset();
                }}
                className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 ${
                  m.id === current.id ? "border-neon shadow-neon" : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <VehicleImage src={m.url} alt="" sizes="96px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        {draft ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="space-y-3 rounded-xl border border-neon/40 bg-carbon-100 p-4"
          >
            <p className="text-sm font-semibold text-white">New disclosure</p>

            <div className="grid grid-cols-2 gap-2">
              {(["x", "y"] as const).map((axis) => (
                <label key={axis} className="text-xs text-chrome-dark">
                  {axis.toUpperCase()} %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={draft[axis]}
                    onChange={(e) => setDraft({ ...draft, [axis]: clamp(Number(e.target.value) || 0) })}
                    className="input-dark mt-1 !py-2"
                  />
                </label>
              ))}
            </div>

            <fieldset>
              <legend className="mb-1 text-xs text-chrome-dark">Category</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(HOTSPOT_STYLES) as HotspotSeverity[]).map((s) => (
                  <label
                    key={s}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium ${
                      severity === s ? "border-white text-white" : "border-white/15 text-chrome-dim"
                    }`}
                    style={severity === s ? { backgroundColor: HOTSPOT_STYLES[s].color } : undefined}
                  >
                    <input type="radio" name="severity" value={s} checked={severity === s} onChange={() => setSeverity(s)} className="sr-only" />
                    {HOTSPOT_STYLES[s].label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-xs text-chrome-dark">
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required className="input-dark mt-1 !py-2" placeholder="e.g. Curb rash, front right wheel" />
            </label>
            <label className="block text-xs text-chrome-dark">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} className="input-dark mt-1 !py-2" placeholder="What is it, and does it affect the car?" />
            </label>

            {error && <p role="alert" className="text-sm text-hot">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !title.trim()} className="btn-hot flex-1 !py-2">
                {saving ? "Saving…" : "Save pin"}
              </button>
              <button type="button" onClick={reset} className="btn-neon !py-2">Cancel</button>
            </div>
          </form>
        ) : (
          <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-chrome-dim">
            Click anywhere on the photo to drop a pin, then categorize it and describe what customers should know.
          </p>
        )}

        {error && !draft && <p role="alert" className="text-sm text-hot">{error}</p>}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-chrome-dark">Pins on this photo ({spots.length})</p>
          <ul className="space-y-2">
            {spots.map((h, i) => (
              <li key={h.id} className="flex items-center gap-3 rounded-lg border border-white/10 p-2 text-sm">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: HOTSPOT_STYLES[h.severity].color }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-chrome">{h.title}</span>
                <button
                  type="button"
                  onClick={() => void remove(h.id)}
                  aria-label={`Delete pin ${h.title}`}
                  className="text-chrome-dark hover:text-hot"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
