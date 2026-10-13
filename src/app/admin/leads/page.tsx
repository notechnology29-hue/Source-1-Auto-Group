import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import { getAdmin } from "@/lib/auth";
import type { Lead } from "@/types/database";

type LeadWithVehicle = Lead & {
  vehicles: { stock_number: string; year: number; make: string; model: string } | null;
};

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="p-10 text-chrome-dim">Loading…</p>}>
      <Leads />
    </Suspense>
  );
}

async function Leads() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const { data, error } = await admin.supabase
    .from("leads")
    .select("*, vehicles(stock_number, year, make, model)")
    .order("created_at", { ascending: false })
    .limit(200);

  // New leads first, then newest.
  const leads: LeadRow[] = ((data ?? []) as unknown as LeadWithVehicle[])
    .map((l) => ({
      id: l.id,
      customer_name: l.customer_name,
      customer_email: l.customer_email,
      customer_phone: l.customer_phone,
      inquiry_type: l.inquiry_type,
      status: l.status,
      created_at: l.created_at,
      vehicle: l.vehicles ? `${l.vehicles.year} ${l.vehicles.make} ${l.vehicles.model}` : "Unknown vehicle",
      stock_number: l.vehicles?.stock_number ?? "—",
    }))
    .sort((a, b) => Number(b.status === "new") - Number(a.status === "new"));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-light">Admin</p>
          <h1 className="chrome-text text-3xl font-black">Leads</h1>
          <p className="text-sm text-chrome-dim">{leads.filter((l) => l.status === "new").length} new · {leads.length} total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/inventory" className="btn-neon !px-4 !py-2 text-sm">Inventory</Link>
          <Link href="/admin/intake" className="btn-neon !px-4 !py-2 text-sm">Add vehicle</Link>
          <form action={signOutAction}>
            <button type="submit" className="btn-neon !px-4 !py-2 text-sm">
              <LogOut size={16} aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </header>
      {error && <p role="alert" className="mb-4 text-sm text-hot">Could not load leads.</p>}
      <LeadsTable leads={leads} />
    </main>
  );
}
