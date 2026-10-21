import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Info, KeyRound, MessageSquare, Star, Users, type LucideIcon } from "lucide-react";
import { PreFooter } from "@/components/home/PreFooter";
import { SearchBar } from "@/components/inventory/SearchBar";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";

const ACTION_CARDS = [
  { label: "Browse Inventory", href: "/inventory", bar: "bg-blue-600", pos: "object-[20%_50%]" },
  { label: "Online Financing", href: "/finance", bar: "bg-red-600", pos: "object-[60%_50%]" },
  { label: "Contact Dealership", href: "#contact", bar: "bg-blue-600", pos: "object-[100%_50%]" },
] as const;

const ACTION_BUTTONS: { label: string; href: string; icon: LucideIcon; tone: string }[] = [
  { label: "Specials", href: "/specials", icon: KeyRound, tone: "bg-red-600 hover:bg-red-700" },
  { label: "Contact Us", href: "#contact", icon: MessageSquare, tone: "bg-zinc-800 hover:bg-zinc-700" },
  { label: "Our Team", href: "/about#team", icon: Users, tone: "bg-blue-600 hover:bg-blue-700" },
  { label: "Reviews", href: "/about#testimonials", icon: Star, tone: "bg-red-600 hover:bg-red-700" },
  { label: "About Us", href: "/about", icon: Info, tone: "bg-zinc-800 hover:bg-zinc-700" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="relative isolate flex min-h-[48svh] items-center justify-center overflow-hidden sm:min-h-[62svh]">
          <Image src="/media/hero-poster.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80 motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/hero-poster.jpg"
            aria-hidden
          >
            <source src="/media/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/70 via-zinc-950/20 to-zinc-950/90" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-neon" />
          <h1 className="chrome-text px-4 text-center text-[clamp(1.75rem,7vw,4.5rem)] font-black leading-[1.1] drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)]">
            Driven By Performance.<br />Built On Trust.
          </h1>
        </section>

        <section aria-label="Vehicle search" className="border-b border-blue-900/50 bg-zinc-50 px-4 py-6 sm:px-6">
          <Suspense fallback={<div className="mx-auto h-12 max-w-3xl rounded-lg bg-zinc-800" />}>
            <SearchBar />
          </Suspense>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {ACTION_CARDS.map((c) => (
            <Link key={c.label} href={c.href} className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 transition hover:border-blue-600 hover:shadow-neon">
              <div className="relative aspect-[16/9] overflow-hidden bg-white sm:aspect-square">
                <Image
                  src="/media/hero-poster.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className={`object-cover ${c.pos} opacity-80 grayscale contrast-125 transition duration-500 group-hover:scale-105 group-hover:opacity-100`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent" />
              </div>
              <span className={`${c.bar} px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wider text-white`}>{c.label}</span>
            </Link>
          ))}
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            {ACTION_BUTTONS.map(({ label, href, icon: Icon, tone }) => (
              <Link key={label} href={href} className={`${tone} flex min-h-12 flex-1 items-center gap-3 rounded-md px-4 text-sm font-bold uppercase tracking-wider text-white transition`}>
                <Icon size={20} aria-hidden /> {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 sm:px-6 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-blue-900/50 bg-zinc-50 p-2 shadow-neon">
            <div className="relative h-full w-full overflow-hidden rounded">
              <Image src="/media/hero-poster.jpg" alt="Featured pre-owned vehicle at Source 1 Auto Group" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 sm:text-4xl">Welcome to Source 1 Auto Group</h2>
            <p className="mt-1 text-lg font-semibold text-blue-500">Pre-Owned Car Dealership</p>
            <div className="mt-4 space-y-4 text-zinc-600">
              <p>
                Every vehicle on our lot is hand-picked. We look for clean histories, strong mechanicals, and the kind of
                character that makes a car worth owning, so you never have to sift through a sea of average inventory.
              </p>
              <p>
                Before a car is listed it goes through a multi-point inspection, and we share what we find. Cosmetic wear,
                aftermarket upgrades, and past repairs are pinned right on the photos, because transparency is how we earn trust.
              </p>
              <p>
                You get aggressive, no-games pricing and flexible financing options for a wide range of credit situations.
                Hold a vehicle online, schedule a test drive, or stop by and see why Arizona drivers choose Source 1.
              </p>
            </div>
            <Link href="/inventory" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-red-600 px-8 font-bold uppercase tracking-wider text-white transition hover:bg-red-700">
              View Inventory
            </Link>
          </div>
        </section>

        <PreFooter />
      </main>
      <Footer />
    </>
  );
}
