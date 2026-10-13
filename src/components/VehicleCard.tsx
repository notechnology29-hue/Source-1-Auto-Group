"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { BadgeCheck, Gauge, Cog, Palette, Play } from "lucide-react";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { DEFAULT_APR, LOAN_TERM_MONTHS } from "@/lib/constants";
import { miles, usd } from "@/lib/format";
import { monthlyPayment } from "@/lib/payment";
import type { VehicleWithMedia } from "@/types/database";

// Loaded only when someone presses play, so the player never weighs down the grid.
const WalkaroundModal = dynamic(() => import("@/components/WalkaroundModal").then((m) => m.WalkaroundModal), { ssr: false });

const MUX_URL = /^https:\/\/stream\.mux\.com\/([A-Za-z0-9]+)\.m3u8$/;

interface Props {
  vehicle: VehicleWithMedia;
  onHold?: (vehicle: VehicleWithMedia) => void;
}

export function VehicleCard({ vehicle, onHold }: Props) {
  const maxDown = Math.floor((vehicle.price * 0.5) / 500) * 500;
  const [down, setDown] = useState(Math.min(Math.round((vehicle.price * 0.1) / 500) * 500, maxDown));
  const [apr, setApr] = useState(DEFAULT_APR);

  const payment = useMemo(() => monthlyPayment(vehicle.price, down, apr), [vehicle.price, down, apr]);

  const primary = vehicle.vehicle_media.find((m) => m.is_primary && m.media_type === "image")
    ?? vehicle.vehicle_media.find((m) => m.media_type === "image");
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const playbackId = vehicle.vehicle_media
    .filter((m) => m.media_type === "video")
    .map((m) => MUX_URL.exec(m.url)?.[1])
    .find(Boolean);
  const [watching, setWatching] = useState(false);
  const pending = vehicle.status === "pending";
  const sliderId = `down-${vehicle.id}`;
  const aprId = `apr-${vehicle.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-carbon-50 transition hover:border-neon/60 hover:shadow-neon">
      <div className="relative aspect-[16/10] overflow-hidden bg-carbon-100">
        {primary && (
          <VehicleImage
            src={primary.url}
            alt={title}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {pending && (
            <span className="rounded-full bg-hot px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Sale Pending</span>
          )}
          {vehicle.clean_carfax && (
            <span className="glass flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-chrome">
              <BadgeCheck size={14} className="text-neon-light" aria-hidden /> Clean CARFAX
            </span>
          )}
        </div>
        {playbackId && (
          <button
            type="button"
            onClick={() => setWatching(true)}
            aria-label={`Watch ${title} walkaround video`}
            className="glass absolute bottom-3 right-3 flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white hover:border-neon"
          >
            <Play size={16} fill="currentColor" aria-hidden /> Walkaround
          </button>
        )}
        {vehicle.transparency_hotspots.length > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full border border-neon/60 bg-carbon/80 px-3 py-1 text-xs font-medium text-neon-light backdrop-blur">
            {vehicle.transparency_hotspots.length} disclosures pinned
          </span>
        )}
      </div>
      {watching && playbackId && <WalkaroundModal playbackId={playbackId} title={title} onClose={() => setWatching(false)} />}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <header>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-tight text-white">{title}</h3>
            <p className="shrink-0 text-xl font-extrabold text-white">{usd(vehicle.price)}</p>
          </div>
          <p className="mt-0.5 text-sm text-chrome-dim">{vehicle.trim}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-chrome-dark">Stock # {vehicle.stock_number}</p>
        </header>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-chrome-dim">
          <li className="flex items-center gap-1.5 whitespace-nowrap"><Gauge size={14} className="text-neon" aria-hidden />{miles(vehicle.mileage)}</li>
          <li className="flex items-center gap-1.5 whitespace-nowrap"><Cog size={14} className="text-neon" aria-hidden />{vehicle.drivetrain}</li>
          <li className="flex items-center gap-1.5 whitespace-nowrap"><Palette size={14} className="text-neon" aria-hidden />{vehicle.exterior_color}</li>
        </ul>

        <div className="rounded-xl border border-neon/30 bg-carbon p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-chrome-dark">Est. monthly</span>
            <span aria-live="polite" className="whitespace-nowrap text-2xl font-black text-neon-light">
              {usd(Math.round(payment))}
              <span className="text-sm font-medium text-chrome-dark">/mo</span>
            </span>
          </div>

          <label htmlFor={sliderId} className="mt-3 flex justify-between text-xs text-chrome-dim">
            <span>Down payment</span>
            <span className="font-semibold text-chrome">{usd(down)}</span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={maxDown}
            step={500}
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
            className="mt-1 h-8 w-full cursor-pointer accent-[#0066FF]"
          />

          <div className="mt-1 flex items-center justify-between text-xs text-chrome-dim">
            <label htmlFor={aprId}>APR %</label>
            <input
              id={aprId}
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={0.1}
              value={apr}
              onChange={(e) => setApr(Math.min(30, Math.max(0, Number(e.target.value) || 0)))}
              className="h-11 w-24 rounded-md border border-white/10 bg-carbon-100 px-3 text-right text-base text-chrome focus:border-neon focus:outline-none"
            />
          </div>
          <p className="mt-2 text-[10px] text-chrome-dark">
            {LOAN_TERM_MONTHS}-month term. Estimate only; excludes tax, title &amp; fees. OAC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onHold?.(vehicle)}
          disabled={pending}
          className="btn-hot mt-auto min-h-12 w-full"
        >
          {pending ? "Sale Pending" : "Hold My Ride"}
        </button>
      </div>
    </article>
  );
}
