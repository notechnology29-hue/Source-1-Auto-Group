import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Specials | Source 1 Auto Group" };

const cta = "inline-flex min-h-11 items-center rounded-md bg-red-600 px-6 font-bold uppercase tracking-wider text-white transition hover:bg-red-700";

export default function SpecialsPage() {
  return (
    <PageShell title="Specials" intro="Hand-picked deals on quality pre-owned vehicles.">
      <InfoCard id="used" title="Used Car Specials">
        <p>Our best values under $25,000.</p>
        <Link href="/inventory?price_max=25000&sort=price-asc" className={cta}>Shop Under $25k</Link>
      </InfoCard>
      <InfoCard id="manager" title="Manager Specials">
        <p>Vehicles priced to move this week. Call for details.</p>
        <Link href="/inventory?sort=price-asc" className={cta}>See Lowest Prices</Link>
      </InfoCard>
      <InfoCard id="weekly" title="Weekly Ads">
        <p>New promotions are posted here every week. Check back soon.</p>
      </InfoCard>
    </PageShell>
  );
}
