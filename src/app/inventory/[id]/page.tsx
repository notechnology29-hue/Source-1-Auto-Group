import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { HotspotShowcase } from "@/components/HotspotShowcase";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PhotoComingSoon } from "@/components/ui/PhotoComingSoon";
import { CarfaxReportSection } from "@/components/vehicle/CarfaxReportSection";
import { VehicleActions } from "@/components/vehicle/VehicleActions";
import { DEFAULT_APR, LOAN_TERM_MONTHS, BRAND } from "@/lib/constants";
import { getVehicles } from "@/lib/data";
import { getPublicVehicles } from "@/lib/public-data";
import { SITE_URL } from "@/lib/site";
import { miles, usd } from "@/lib/format";
import { monthlyPayment } from "@/lib/payment";
import {
  bodyCategory,
  drivetrainOf,
  exteriorOf,
  fuelType,
  imagesOf,
  interiorOf,
  mpgText,
  transmissionOf,
  vehicleTitle,
} from "@/lib/inventory";

export async function generateMetadata({ params }: PageProps<"/inventory/[id]">): Promise<Metadata> {
  const { id } = await params;
  const vehicle = (await getPublicVehicles()).find((v) => v.id === id);
  if (!vehicle) return { title: "Vehicle not found | Source 1 Auto Group", robots: { index: false } };

  const title = vehicleTitle(vehicle);
  const description = `${title} for sale at ${BRAND.name}: ${usd(vehicle.price)}, ${miles(vehicle.mileage)}. Stock # ${vehicle.stock_number}. Full-disclosure photos and a live payment estimate.`;
  const image = imagesOf(vehicle)[0]?.url;
  return {
    title: `${title} for Sale | ${BRAND.name}`,
    description,
    alternates: { canonical: `/inventory/${vehicle.id}` },
    openGraph: {
      type: "website",
      title: `${title} | ${usd(vehicle.price)}`,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default function VehicleDetailPage({ params }: PageProps<"/inventory/[id]">) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <Suspense fallback={<div className="min-h-[70svh]" aria-busy />}>
          <Detail params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function Detail({ params }: { params: PageProps<"/inventory/[id]">["params"] }) {
  const { id } = await params;
  const vehicle = (await getVehicles()).find((v) => v.id === id);
  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const hasPhotos = imagesOf(vehicle).length > 0;
  const down = Math.round((vehicle.price * 0.1) / 500) * 500;
  const payment = Math.round(monthlyPayment(vehicle.price, down, DEFAULT_APR));

  const specs: [string, string][] = [
    ["Engine", vehicle.engine ?? "N/A"],
    ["Transmission", transmissionOf(vehicle)],
    ["Drivetrain", drivetrainOf(vehicle)],
    ["Fuel Economy", mpgText(vehicle)],
    ["Fuel Type", fuelType(vehicle)],
    ["Body Style", bodyCategory(vehicle)],
    ["Exterior Color", exteriorOf(vehicle)],
    ["Interior Color", interiorOf(vehicle)],
    ["Mileage", miles(vehicle.mileage)],
    ["VIN", vehicle.vin],
    ["Stock #", vehicle.stock_number],
    ["Condition", vehicle.condition[0].toUpperCase() + vehicle.condition.slice(1)],
  ];
  const showStarting = vehicle.starting_price && vehicle.starting_price > vehicle.price;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    vehicleIdentificationNumber: vehicle.vin,
    sku: vehicle.stock_number,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "SMI" },
    color: vehicle.exterior_color ?? undefined,
    image: imagesOf(vehicle).map((m) => m.url),
    url: `${SITE_URL}/inventory/${vehicle.id}`,
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "USD",
      itemCondition: "https://schema.org/UsedCondition",
      availability: vehicle.status === "available" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      seller: { "@type": "AutoDealer", name: BRAND.name, telephone: BRAND.phoneDisplay },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/inventory" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-600">
          <ArrowLeft size={16} aria-hidden /> Back to Inventory
        </Link>
      </nav>

      <header className="grid gap-6 border-b border-zinc-200 pb-6 lg:grid-cols-[1fr_20rem] lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-zinc-600">
            Stock # {vehicle.stock_number} <span className="mx-2 text-zinc-700">|</span> VIN {vehicle.vin}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Sale Price</p>
              <p className="text-4xl font-black text-blue-500">{usd(vehicle.price)}</p>
              {showStarting && <p className="text-sm text-zinc-500 line-through">Starting Price {usd(vehicle.starting_price!)}</p>}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Est. Payment</p>
              <p className="text-2xl font-extrabold text-zinc-900">{usd(payment)}<span className="text-sm font-medium text-zinc-500">/mo</span></p>
              <p className="text-[11px] text-zinc-500">{usd(down)} down, {LOAN_TERM_MONTHS} mo @ {DEFAULT_APR}% APR. Estimate only; excludes tax, title &amp; fees. OAC.</p>
            </div>
          </div>
        </div>
        <VehicleActions vehicle={vehicle} />
      </header>

      <section aria-label="Photos" className="mt-8">
        {hasPhotos ? (
          <HotspotShowcase vehicle={vehicle} />
        ) : (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-blue-900/50 bg-zinc-50">
            <PhotoComingSoon variant="hero" />
          </div>
        )}
      </section>

      <section aria-labelledby="specs-heading" className="mt-10">
        <h2 id="specs-heading" className="mb-4 text-xl font-black uppercase tracking-wide text-zinc-900">Vehicle Specifications</h2>
        <dl className="grid overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map(([k, v]) => (
            <div key={k} className="border-b border-zinc-200 p-4">
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{k}</dt>
              <dd className="mt-1 break-words font-semibold text-zinc-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="desc-heading" className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 id="desc-heading" className="mb-3 text-xl font-black uppercase tracking-wide text-zinc-900">Vehicle Description</h2>
          <div className="space-y-3 whitespace-pre-line text-zinc-600">
            {vehicle.description ||
              `This ${title} has been hand-picked and put through our multi-point inspection. Every disclosure is shown on the photos, so you know exactly what you're getting. Schedule a test drive today.`}
          </div>
        </div>
        {vehicle.features.length > 0 && (
          <div>
            <h2 className="mb-3 text-xl font-black uppercase tracking-wide text-zinc-900">Features</h2>
            <ul className="grid gap-1.5 text-sm text-zinc-700">
              {vehicle.features.map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />{f}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="mt-12">
        <CarfaxReportSection vin={vehicle.vin} carfaxUrl={vehicle.carfax_url} />
      </div>
    </div>
  );
}
