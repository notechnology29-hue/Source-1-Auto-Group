import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { FilterSidebar } from "@/components/inventory/FilterSidebar";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { InventoryControls } from "@/components/inventory/InventoryControls";
import { SearchBar } from "@/components/inventory/SearchBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getVehicles } from "@/lib/data";
import { appliedCount, buildFacets, filterVehicles, parseInventoryQuery, sortVehicles } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Used Vehicles | Source 1 Auto Group",
  description: "Browse pre-owned vehicles at Source 1 Auto Group. Filter by price, mileage, make, body style and more.",
};

export default function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <Suspense fallback={<div className="min-h-[70svh]" aria-busy />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/inventory">["searchParams"] }) {
  const query = parseInventoryQuery(await searchParams);
  const all = await getVehicles();
  const vehicles = sortVehicles(filterVehicles(all, query), query.sort);
  const facets = buildFacets(all, query);
  const count = vehicles.length;

  return (
    <>
      <section aria-label="Vehicle search" className="border-b border-blue-900/50 bg-zinc-50 px-4 py-5 sm:px-6">
        <SearchBar initialQuery={query.q} keepParams key={query.q} />
      </section>

      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">Used Vehicles at Source 1 Auto</h1>
            <p className="mt-1 text-sm font-semibold text-blue-500" aria-live="polite">
              {count} {count === 1 ? "Result" : "Results"}
            </p>
          </div>
          <InventoryControls sort={query.sort} view={query.view} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <FilterSidebar lists={facets.lists} ranges={facets.ranges} applied={appliedCount(query)} />
          {count === 0 ? (
            <p className="h-fit rounded-lg border border-zinc-200 bg-zinc-50 p-10 text-center text-zinc-600">
              No vehicles match your search. Try clearing a filter.
            </p>
          ) : (
            <div className={query.view === "list" ? "grid gap-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-[1360px]:grid-cols-4"}>
              {vehicles.map((v) => (
                <InventoryCard key={v.id} vehicle={v} layout={query.view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
