"use client";

import { useCallback, useState } from "react";
import { CalendarCheck, Clock } from "lucide-react";
import { HoldMyRideModal } from "@/components/HoldMyRideModal";
import type { InquiryType, VehicleWithMedia } from "@/types/database";

export function VehicleActions({ vehicle }: { vehicle: VehicleWithMedia }) {
  const [inquiry, setInquiry] = useState<InquiryType | null>(null);
  const close = useCallback(() => setInquiry(null), []);
  const pending = vehicle.status === "pending";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
        <button
          type="button"
          disabled={pending}
          onClick={() => setInquiry("hold_ride")}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-6 font-bold uppercase tracking-wider text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          <Clock size={18} aria-hidden /> {pending ? "Sale Pending" : "Hold My Ride"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setInquiry("test_drive")}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 font-bold uppercase tracking-wider text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <CalendarCheck size={18} aria-hidden /> Schedule Test Drive
        </button>
      </div>
      <HoldMyRideModal vehicle={inquiry ? vehicle : null} initialInquiry={inquiry ?? "hold_ride"} onClose={close} />
    </>
  );
}
