import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, FileText, Inbox, LogOut, Plus } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import { PoweredBy } from "@/components/PoweredBy";
import { getAdmin } from "@/lib/auth";
import { INQUIRY_LABELS } from "@/lib/handoff";
import type { InquiryType, Lead } from "@/types/database";

export const metadata: Metadata = { title: "Chrisslaymedia Dashboard" };

type LeadWithVehicle = Lead & {
  vehicles: { stock_number: string; year: number; make: string; model: string } | null;
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-10 text-chrome-dim">Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const { supabase } = admin;

  const count = (table: "vehicles" | "leads", col: string, val: string) =>
    supabase.from(table).select("id", { count: "exact", head: true }).eq(col, val);

  const [available, pending, sold, newLeads, totalLeads, newApps, newByType, recent] = await Promise.all([
    count("vehicles", "status", "available"),
    count("vehicles", "status", "pending"),
    count("vehicles", "status", "sold"),
    count("leads", "status", "new"),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("credit_applications").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("inquiry_type").eq("status", "new").limit(1000),
    supabase
      .from("leads")
      .select("*, vehicles(stock_number, year, make, model)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const bySource = new Map<InquiryType, number>();
  for (const r of (newByType.data ?? []) as { inquiry_type: InquiryType }[]) {
    bySource.set(r.inquiry_type, (bySource.get(r.inquiry_type) ?? 0) + 1);
  }

  const leads: LeadRow[] = ((recent.data ?? []) as unknown as LeadWithVehicle[])
    .map((l) => ({
      id: l.id,
      customer_name: l.customer_name,
      customer_email: l.customer_email,
      customer_phone: l.customer_phone ?? "",
      message: l.message ?? undefined,
      inquiry_type: l.inquiry_type,
      status: l.status,
      created_at: l.created_at,
      vehicle: l.vehicles ? `${l.vehicles.year} ${l.vehicles.make} ${l.vehicles.model}` : l.inquiry_type === "contact" ? "General inquiry" : "Unknown vehicle",
      stock_number: l.vehicles?.stock_number ?? "—",
    }))
    .sort((a, b) => Number(b.status === "new") - Number(a.status === "new"));

  const stats = [
    { label: "New leads", value: newLeads.count ?? 0, hot: (newLeads.count ?? 0) > 0 },
    { label: "Credit apps (new)", value: newApps.count ?? 0, hot: (newApps.count ?? 0) > 0 },
    { label: "Available", value: available.count ?? 0 },
    { label: "Pending", value: pending.count ?? 0 },
    { label: "Sold", value: sold.count ?? 0 },
    { label: "All-time leads", value: totalLeads.count ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-light">Source 1 Auto Group</p>
          <h1 className="chrome-text text-3xl font-black sm:text-4xl">Chrisslaymedia</h1>
          <p className="text-sm text-chrome-dim">Dashboard · {admin.user.email}</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="btn-neon !px-4 !py-2 text-sm">
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        </form>
      </header>

      <section aria-label="Quick actions" className="mb-8 grid gap-3 sm:grid-cols-3">
        <Link href="/admin/intake" className="btn-hot justify-center">
          <Plus size={18} aria-hidden /> Add vehicle &amp; media
        </Link>
        <Link href="/admin/inventory" className="btn-neon justify-center">
          <Car size={18} aria-hidden /> Manage inventory
        </Link>
        <Link href="/admin/leads" className="btn-neon justify-center">
          <Inbox size={18} aria-hidden /> All leads
        </Link>
      </section>

      <section aria-label="Stats" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.hot ? "border-hot/50 bg-hot/10" : "border-white/10 bg-carbon-50"}`}>
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-chrome-dim">{s.label}</p>
          </div>
        ))}
      </section>

      {bySource.size > 0 && (
        <section aria-label="New leads by form" className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          <FileText size={16} className="text-neon-light" aria-hidden />
          <span className="text-chrome-dim">New by form:</span>
          {[...bySource].map(([type, n]) => (
            <span key={type} className="rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-chrome">
              {INQUIRY_LABELS[type]} · {n}
            </span>
          ))}
        </section>
      )}

      <section aria-label="Recent leads">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-white">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm text-neon-light hover:underline">View all</Link>
        </div>
        <p className="mb-3 text-xs text-chrome-dark">
          Every form lands here: Hold My Ride, test drives, contact messages, and credit applications.
        </p>
        <LeadsTable leads={leads} />
      </section>
      <PoweredBy className="mt-12 text-center" />
    </main>
  );
}
