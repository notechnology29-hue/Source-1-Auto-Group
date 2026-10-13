"use client";

import { useState } from "react";
import { Film, Star, Trash2 } from "lucide-react";
import { deleteMediaAction, setPrimaryMediaAction } from "@/app/actions/admin";
import { VehicleImage } from "@/components/ui/VehicleImage";
import type { VehicleMedia } from "@/types/database";

interface Props {
  vehicleId: string;
  media: VehicleMedia[];
  onPrimary: (id: string) => void;
  onDeleted: (id: string, newPrimaryId: string | null) => void;
}

export function MediaManager({ vehicleId, media, onPrimary, onDeleted }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (media.length === 0) return null;

  async function makePrimary(id: string) {
    setBusy(id);
    setError("");
    const res = await setPrimaryMediaAction(vehicleId, id);
    setBusy(null);
    if (!res.ok) return setError(res.error);
    onPrimary(id);
  }

  async function remove(m: VehicleMedia) {
    const warn = m.media_type === "image" ? "Delete this photo and any hotspots pinned on it?" : "Remove this video from the vehicle?";
    if (!window.confirm(warn)) return;
    setBusy(m.id);
    setError("");
    const res = await deleteMediaAction(vehicleId, m.id);
    setBusy(null);
    if (!res.ok) return setError(res.error);
    onDeleted(m.id, res.data.newPrimaryId);
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-chrome-dark">Gallery</h3>
      {error && <p role="alert" className="mb-3 rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">{error}</p>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-xl border border-white/10 bg-carbon">
            <div className="relative aspect-[16/10] bg-carbon-100">
              {m.media_type === "image" ? (
                <VehicleImage src={m.url} alt="Vehicle photo" sizes="(min-width: 1024px) 20vw, 50vw" />
              ) : (
                <div className="grid h-full place-items-center text-chrome-dim">
                  <Film size={28} aria-hidden />
                  <span className="sr-only">Walkaround video</span>
                </div>
              )}
              {m.is_primary && (
                <span className="absolute left-2 top-2 rounded-full bg-neon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Cover
                </span>
              )}
            </div>
            <div className="flex gap-1 p-2">
              {m.media_type === "image" && !m.is_primary && (
                <button
                  type="button"
                  onClick={() => makePrimary(m.id)}
                  disabled={busy === m.id}
                  className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 text-xs text-chrome hover:border-neon disabled:opacity-50"
                >
                  <Star size={14} aria-hidden /> Make cover
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(m)}
                disabled={busy === m.id}
                aria-label={m.media_type === "image" ? "Delete photo" : "Delete video"}
                className="ml-auto grid min-h-11 w-11 place-items-center rounded-lg border border-white/10 text-hot hover:border-hot disabled:opacity-50"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
