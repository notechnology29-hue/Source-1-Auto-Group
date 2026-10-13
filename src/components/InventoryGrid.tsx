"use client";

import { useCallback, useState } from "react";
import { HoldMyRideModal } from "@/components/HoldMyRideModal";
import { VehicleCard } from "@/components/VehicleCard";
import type { VehicleWithMedia } from "@/types/database";

export function InventoryGrid({ vehicles }: { vehicles: VehicleWithMedia[] }) {
  const [holdTarget, setHoldTarget] = useState<VehicleWithMedia | null>(null);
  const close = useCallback(() => setHoldTarget(null), []);

  if (!vehicles.length) {
    return (
      <p className="rounded-2xl border border-white/10 bg-carbon-50 p-10 text-center text-chrome-dim">
        No vehicles match your search. Try clearing a filter.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} onHold={setHoldTarget} />
        ))}
      </div>
      <HoldMyRideModal vehicle={holdTarget} onClose={close} />
    </>
  );
}
