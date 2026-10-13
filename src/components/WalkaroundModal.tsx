"use client";

import { useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { X } from "lucide-react";

interface Props {
  playbackId: string;
  title: string;
  onClose: () => void;
}

export function WalkaroundModal({ playbackId, title, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} walkaround video`}
      className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-3 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="neon-frame relative w-full max-w-4xl overflow-hidden bg-carbon">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-carbon/80 text-chrome hover:text-white"
        >
          <X size={22} aria-hidden />
        </button>
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay="muted"
          accentColor="#0066FF"
          metadata={{ video_title: `${title} walkaround` }}
          style={{ aspectRatio: "16 / 9", width: "100%" }}
        />
      </div>
    </div>
  );
}
