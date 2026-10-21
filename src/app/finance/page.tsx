import type { Metadata } from "next";
import Link from "next/link";
import { CreditApplicationForm } from "@/components/finance/CreditApplicationForm";
import { InfoCard, PageShell } from "@/components/layout/PageShell";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Finance | Source 1 Auto Group" };

const cta = "inline-flex min-h-11 items-center rounded-md bg-blue-600 px-6 font-bold uppercase tracking-wider text-white transition hover:bg-blue-700";

export default function FinancePage() {
  return (
    <PageShell title="Get Online Pre-Approval for Financing." intro="Flexible options for every credit situation. Get approved before you visit.">
      <section id="apply" className="scroll-mt-40 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <CreditApplicationForm />
      </section>
      <span id="aprobacion" className="scroll-mt-40 block" />
      <span id="pre-qualified" className="scroll-mt-40 block" />
      <InfoCard id="espanol" title="Aprobación de crédito">
        <p>Hablamos español. Complete la solicitud arriba o llámenos al {BRAND.phoneDisplay} y le ayudaremos con su aprobación de crédito.</p>
      </InfoCard>
      <InfoCard id="trade" title="Value Your Trade">
        <p>Tell us about your current vehicle and we&apos;ll put together a fair, transparent offer.</p>
      </InfoCard>
      <InfoCard id="test-drive" title="Schedule Test Drive">
        <p>Pick a vehicle from our inventory and choose &ldquo;Schedule Test Drive&rdquo; on its detail page.</p>
        <Link href="/inventory" className={cta}>Browse Inventory</Link>
      </InfoCard>
    </PageShell>
  );
}
