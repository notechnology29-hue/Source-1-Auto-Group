"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Film, ImagePlus, Loader2, XCircle } from "lucide-react";
import {
  createMuxUploadAction,
  resolveMuxUploadAction,
  saveMediaAction,
  signCloudinaryUploadAction,
} from "@/app/actions/admin";
import { xhrUpload } from "@/lib/upload";
import type { VehicleMedia } from "@/types/database";

interface Props {
  vehicleId: string;
  stockNumber: string;
  onUploaded: (media: VehicleMedia) => void;
}

interface Job {
  id: number;
  name: string;
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function MediaUploader({ vehicleId, stockNumber, onUploaded }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const nextId = useRef(0);

  const patch = (id: number, p: Partial<Job>) => setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...p } : j)));

  async function uploadImage(file: File, id: number) {
    if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is larger than 20 MB");
    const signed = await signCloudinaryUploadAction(stockNumber);
    if (!signed.ok) throw new Error(signed.error);
    const { cloudName, apiKey, timestamp, folder, signature } = signed.data;

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", apiKey);
    body.append("timestamp", String(timestamp));
    body.append("folder", folder);
    body.append("signature", signature);

    const res = await xhrUpload(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, "POST", body, (progress) =>
      patch(id, { progress }),
    );
    const { secure_url } = JSON.parse(res) as { secure_url: string };
    return secure_url;
  }

  async function uploadVideo(file: File, id: number) {
    const created = await createMuxUploadAction();
    if (!created.ok) throw new Error(created.error);
    await xhrUpload(created.data.url, "PUT", file, (progress) => patch(id, { progress }));

    patch(id, { status: "processing", progress: 100 });
    for (let i = 0; i < 40; i++) {
      const r = await resolveMuxUploadAction(created.data.uploadId);
      if (!r.ok) throw new Error(r.error);
      if (r.data.ready && r.data.url) return r.data.url;
      await sleep(2500);
    }
    throw new Error("Video is still processing. Re-check Mux in a minute.");
  }

  async function handleFile(file: File) {
    const id = nextId.current++;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    setJobs((j) => [...j, { id, name: file.name, progress: 0, status: "uploading" }]);

    try {
      if (!isVideo && !isImage) throw new Error("Only images and videos are supported");
      const url = isVideo ? await uploadVideo(file, id) : await uploadImage(file, id);
      const saved = await saveMediaAction({ vehicle_id: vehicleId, url, media_type: isVideo ? "video" : "image" });
      if (!saved.ok) throw new Error(saved.error);
      onUploaded(saved.data);
      patch(id, { status: "done", progress: 100 });
    } catch (e) {
      patch(id, { status: "error", error: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    // Sequential so the first image reliably becomes the primary photo.
    void (async () => {
      for (const f of Array.from(files)) await handleFile(f);
    })();
  };

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging ? "border-neon bg-neon/10" : "border-white/15 hover:border-neon/60"
        }`}
      >
        <span className="flex gap-3 text-neon-light">
          <ImagePlus aria-hidden /> <Film aria-hidden />
        </span>
        <span className="font-semibold text-chrome">Drop photos &amp; walkaround videos here</span>
        <span className="text-xs text-chrome-dark">
          Photos → Cloudinary (max 20 MB) · Videos → Mux adaptive streaming. Shoot photos in 16:10 for exact pin placement.
        </span>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {jobs.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-lg border border-white/10 bg-carbon-100 p-3 text-sm">
              <div className="flex items-center gap-2">
                {j.status === "done" && <CheckCircle2 size={16} className="text-emerald-400" aria-hidden />}
                {j.status === "error" && <XCircle size={16} className="text-hot" aria-hidden />}
                {(j.status === "uploading" || j.status === "processing") && (
                  <Loader2 size={16} className="animate-spin text-neon-light" aria-hidden />
                )}
                <span className="truncate text-chrome">{j.name}</span>
                <span className="ml-auto text-xs text-chrome-dark">
                  {j.status === "processing" ? "Processing…" : j.status === "done" ? "Saved" : j.status === "error" ? "" : `${j.progress}%`}
                </span>
              </div>
              {j.status === "uploading" && (
                <div className="mt-2 h-1 overflow-hidden rounded bg-white/10">
                  <div className="h-full bg-neon transition-all" style={{ width: `${j.progress}%` }} />
                </div>
              )}
              {j.error && <p className="mt-1 text-xs text-hot">{j.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
