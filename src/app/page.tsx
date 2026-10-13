import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { HotspotShowcase } from "@/components/HotspotShowcase";
import { Hero } from "@/components/Hero";
import { InventoryGrid } from "@/components/InventoryGrid";
import { Navbar } from "@/components/Navbar";
import { getVehicles } from "@/lib/data";
import { matchesFilter, matchesQuery, parseFilter } from "@/lib/filters";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="min-h-[88svh]" />}>
          <Storefront searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function Storefront({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const filter = parseFilter(params.filter);

  const all = await getVehicles();
  const vehicles = all.filter((v) => matchesQuery(v, q) && (!filter || matchesFilter(v, filter)));
  const featured = all.find((v) => v.transparency_hotspots.length > 0);

  return (
    <>
      <Hero key={`${q}|${filter}`} initialQuery={q} activeFilter={filter} />

      <section id="inventory" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="chrome-text text-3xl font-black sm:text-4xl">Live Inventory</h2>
            <p className="mt-1 text-chrome-dim">Slide the down payment. Watch your monthly move.</p>
          </div>
          <p className="text-sm text-chrome-dark">{vehicles.length} vehicles</p>
        </div>
        <InventoryGrid vehicles={vehicles} />
      </section>

      {featured && (
        <section id="transparency" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-light">Transparency Inspector</p>
            <h2 className="chrome-text mt-2 text-3xl font-black sm:text-4xl">We show you everything.</h2>
            <p className="mt-1 max-w-xl text-chrome-dim">
              Tap a pin to see exactly what we found: cosmetic wear, aftermarket upgrades, and past repairs.
            </p>
          </div>
          <HotspotShowcase vehicle={featured} />
        </section>
      )}
    </>
  );
}
