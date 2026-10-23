import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Pencil, Plus } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { getAdmin } from "@/lib/auth";
import { miles, usd } from "@/lib/format";
import type { Vehicle } from "@/types/database";

type Row = Vehicle & { vehicle_media: { id: string }[] };

const STATUS_STYLE: Record<string, string> = {
  available: "border-emerald-500/40 text-emerald-400",
  pending: "border-amber-400/40 text-amber-300",
  sold: "border-white/20 text-chrome-dark",
};

export default function InventoryPage() {
  return (
    <Suspense fallback={<p className="p-10 text-chrome-dim">Loading…</p>}>
      <Inventory />
    </Suspense>
  );
}

async function Inventory() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const { data, error } = await admin.supabase
    .from("vehicles")
    .select("*, vehicle_media(id)")
    .order("created_at", { ascending: false })
    .limit(500);
  const vehicles = (data ?? []) as unknown as Row[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-light">Admin</p>
          <h1 className="chrome-text text-3xl font-black">Inventory</h1>
          <p className="text-sm text-chrome-dim">{vehicles.length} vehicles · sold units stay here but are hidden from the storefront</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/intake" className="btn-hot !px-4 !py-2 text-sm">
            <Plus size={16} aria-hidden /> Add vehicle
          </Link>
          <Link href="/admin" className="btn-neon !px-4 !py-2 text-sm">Dashboard</Link>
          <Link href="/admin/leads" className="btn-neon !px-4 !py-2 text-sm">Leads</Link>
          <form action={signOutAction}>
            <button type="submit" className="btn-neon !px-4 !py-2 text-sm">
              <LogOut size={16} aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </header>

      {error && <p role="alert" className="mb-4 text-sm text-hot">Could not load inventory.</p>}
      {vehicles.length === 0 && !error && <p className="text-chrome-dim">No vehicles yet. Add your first one.</p>}

      <ul className="space-y-3">
        {vehicles.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-carbon-50 p-4">
            <div className="min-w-0 flex-1 basis-56">
              <p className="truncate font-bold text-white">{v.year} {v.make} {v.model} {v.trim}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-chrome-dark">
                Stock # {v.stock_number} · {v.vehicle_media.length} media
              </p>
            </div>
            <p className="text-sm text-chrome-dim">{usd(v.price)} · {miles(v.mileage)}</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STATUS_STYLE[v.status]}`}>{v.status}</span>
            <Link href={`/admin/intake?vehicle=${v.id}`} className="btn-neon !px-4 !py-2 text-sm">
              <Pencil size={14} aria-hidden /> Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
