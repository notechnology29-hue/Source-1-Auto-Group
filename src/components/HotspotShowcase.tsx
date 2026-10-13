"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { HOTSPOT_STYLES } from "@/lib/constants";
import type { VehicleWithMedia } from "@/types/database";

export function HotspotShowcase({ vehicle }: { vehicle: VehicleWithMedia }) {
  const images = vehicle.vehicle_media.filter((m) => m.media_type === "image");
  const [mediaId, setMediaId] = useState(images.find((m) => m.is_primary)?.id ?? images[0]?.id);
  const [openId, setOpenId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const media = images.find((m) => m.id === mediaId);
  const spots = vehicle.transparency_hotspots.filter((h) => h.media_id === mediaId);
  const open = spots.find((h) => h.id === openId);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-hotspot-ui]")) setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openId]);

  if (!media) return null;
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div ref={stageRef} className="neon-frame relative aspect-[16/10] overflow-hidden bg-carbon-100">
          <VehicleImage src={media.url} alt={`${title} inspection photo`} sizes="(min-width: 1024px) 66vw, 100vw" />

          {spots.map((h, i) => {
            const style = HOTSPOT_STYLES[h.severity];
            const active = h.id === openId;
            return (
              <button
                key={h.id}
                type="button"
                data-hotspot-ui
                aria-label={`${style.label}: ${h.title}`}
                aria-expanded={active}
                onClick={() => setOpenId(active ? null : h.id)}
                style={{ left: `${h.x_coordinate}%`, top: `${h.y_coordinate}%`, backgroundColor: style.color }}
                className={`absolute z-10 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-lg transition-transform after:absolute after:-inset-2 after:content-[''] hover:scale-125 focus-visible:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  active ? "scale-125" : "animate-pin-pulse"
                }`}
              >
                {i + 1}
              </button>
            );
          })}

          <AnimatePresence>
            {open && (
              <div
                key={open.id}
                style={
                  {
                    "--x": `${Math.min(Math.max(open.x_coordinate, 22), 78)}%`,
                    "--y": `${open.y_coordinate}%`,
                    "--ty": open.y_coordinate > 50 ? "calc(-100% - 26px)" : "26px",
                  } as React.CSSProperties
                }
                className={`absolute inset-x-2 z-20 sm:inset-x-auto sm:bottom-auto sm:left-(--x) sm:top-(--y) sm:w-64 sm:transform-[translate(-50%,var(--ty))] ${
                  open.y_coordinate > 50 ? "top-2" : "bottom-2"
                }`}
              >
                <motion.div
                  data-hotspot-ui
                  role="dialog"
                  aria-label={open.title}
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="glass relative rounded-xl p-4 shadow-neon"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    aria-label="Close disclosure"
                    className="absolute right-1 top-1 grid h-9 w-9 place-items-center text-chrome-dark hover:text-white"
                  >
                    <X size={16} />
                  </button>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: HOTSPOT_STYLES[open.severity].color }}
                  >
                    {HOTSPOT_STYLES[open.severity].label}
                  </span>
                  <p className="mt-2 pr-4 font-semibold text-white">{open.title}</p>
                  <p className="mt-1 text-sm text-chrome-dim">{open.description}</p>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {images.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMediaId(m.id);
                  setOpenId(null);
                }}
                aria-label="View photo"
                aria-pressed={m.id === mediaId}
                className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 transition ${
                  m.id === mediaId ? "border-neon shadow-neon" : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <VehicleImage src={m.url} alt="" sizes="96px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <aside>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-chrome-dim">{vehicle.trim} · Stock # {vehicle.stock_number}</p>

        <ul className="mt-5 space-y-2" aria-label="Disclosures on this photo">
          {spots.length === 0 && <li className="text-sm text-chrome-dark">No disclosures pinned on this photo.</li>}
          {spots.map((h, i) => (
            <li key={h.id}>
              <button
                type="button"
                data-hotspot-ui
                onClick={() => setOpenId(h.id === openId ? null : h.id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition ${
                  h.id === openId ? "border-neon bg-neon/10" : "border-white/10 hover:border-neon/50"
                }`}
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: HOTSPOT_STYLES[h.severity].color }}
                >
                  {i + 1}
                </span>
                <span className="text-chrome">{h.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-1.5 text-xs text-chrome-dim" aria-label="Legend">
          {Object.values(HOTSPOT_STYLES).map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
