import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { IntakeWorkspace } from "@/components/admin/IntakeWorkspace";
import { getAdmin } from "@/lib/auth";
import type { VehicleWithMedia } from "@/types/database";

export default function IntakePage({ searchParams }: PageProps<"/admin/intake">) {
  return (
    <Suspense fallback={<p className="p-10 text-chrome-dim">Loading…</p>}>
      <Intake searchParams={searchParams} />
    </Suspense>
  );
}

async function Intake({ searchParams }: { searchParams: PageProps<"/admin/intake">["searchParams"] }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const id = Array.isArray(params.vehicle) ? params.vehicle[0] : params.vehicle;
  let initial: VehicleWithMedia | null = null;

  if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    const { data } = await admin.supabase
      .from("vehicles")
      .select("*, vehicle_media(*), transparency_hotspots(*)")
      .eq("id", id)
      .maybeSingle();
    initial = (data as unknown as VehicleWithMedia | null) ?? null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-light">Admin</p>
          <h1 className="chrome-text text-3xl font-black">Inventory Intake</h1>
          <p className="text-sm text-chrome-dim">Signed in as {admin.user.email}</p>
        </div>
        <form action={signOutAction} className="flex gap-2">
          <Link href="/admin/inventory" className="btn-neon !px-4 !py-2 text-sm">Inventory</Link>
          <Link href="/admin/leads" className="btn-neon !px-4 !py-2 text-sm">Leads</Link>
          <button type="submit" className="btn-neon !px-4 !py-2 text-sm">
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        </form>
      </header>
      <IntakeWorkspace key={initial?.id ?? "new"} initial={initial} />
    </main>
  );
}
