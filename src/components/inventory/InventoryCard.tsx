"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";
import { PhotoComingSoon } from "@/components/ui/PhotoComingSoon";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { miles, usd } from "@/lib/format";
import {
  colorHex,
  drivetrainOf,
  exteriorOf,
  imagesOf,
  interiorOf,
  locationOf,
  mpgText,
  transmissionOf,
  vehicleTitle,
} from "@/lib/inventory";
import type { VehicleWithMedia } from "@/types/database";

interface Props {
  vehicle: VehicleWithMedia;
  layout?: "grid" | "list";
}

const SLIDE_MS = 3500;

function Swatch({ label, name }: { label: string; name: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-zinc-600" title={`${label}: ${name}`}>
      <span className="h-5 w-5 rounded-sm border border-zinc-600" style={{ backgroundColor: colorHex(name) }} aria-hidden />
      <span>{label}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function InventoryCard({ vehicle, layout = "grid" }: Props) {
  const images = imagesOf(vehicle);
  const title = vehicleTitle(vehicle);
  const href = `/inventory/${vehicle.id}`;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const multi = images.length > 1;

  useEffect(() => {
    if (!multi || !playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [multi, playing, images.length]);

  const pending = vehicle.status === "pending";
  const list = layout === "list";
  const specs: [string, string][] = [
    ["Mileage:", miles(vehicle.mileage)],
    ["Engine:", vehicle.engine ?? "N/A"],
    ["Transmission Description:", transmissionOf(vehicle)],
    ["Fuel Economy:", mpgText(vehicle)],
  ];
  const showStarting = vehicle.starting_price && vehicle.starting_price > vehicle.price;

  return (
    <article className={`group flex overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 transition hover:border-blue-600 hover:shadow-neon ${list ? "flex-col sm:flex-row" : "flex-col"}`}>
      <div className={`relative aspect-[4/3] shrink-0 overflow-hidden bg-white ${list ? "sm:w-80" : ""}`}>
        {images.length === 0 ? (
          <PhotoComingSoon />
        ) : (
          <>
            {images.map((m, i) => (
              <div key={m.id} className={`absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`} aria-hidden={i !== index}>
                <VehicleImage
                  src={m.url}
                  alt={i === index ? title : ""}
                  priority={false}
                  sizes="(min-width: 1360px) 20vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
            <ComingSoonOverlay />
            {multi && (
              <>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                  className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/70 text-white backdrop-blur hover:bg-blue-600"
                >
                  {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
                </button>
                <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
                  {images.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show photo ${i + 1} of ${images.length}`}
                      aria-current={i === index}
                      className="flex h-6 w-4 items-center justify-center"
                    >
                      <span className={`h-2 w-2 rounded-full ${i === index ? "bg-blue-500" : "bg-white/60"}`} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {pending && <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">Sale Pending</span>}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <header>
          <h3 className="text-base font-bold leading-snug text-zinc-900">
            <Link href={href} className="hover:text-blue-500 focus-visible:text-blue-500">{title}</Link>
          </h3>
          <p className="mt-0.5 text-xs text-zinc-600">{locationOf(vehicle)}</p>
        </header>

        <dl className="space-y-1 text-xs">
          {specs.map(([k, v]) => (
            <div key={k} className="flex flex-wrap gap-x-1.5">
              <dt className="font-semibold text-zinc-900">{k}</dt>
              <dd className="text-zinc-600">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-4">
          <Swatch label="Exterior" name={exteriorOf(vehicle)} />
          <Swatch label="Interior" name={interiorOf(vehicle)} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-zinc-200 pt-3">
          <p className="text-xs text-zinc-500">{drivetrainOf(vehicle)}</p>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Sale Price</p>
            <p className="text-2xl font-black text-blue-500">{usd(vehicle.price)}</p>
            {showStarting && <p className="text-xs text-zinc-500 line-through">Starting Price {usd(vehicle.starting_price!)}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}
