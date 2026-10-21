"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, Car, CarFront, ChevronDown, LayoutGrid, MapPin, Menu, Phone, Truck, X, Zap, type LucideIcon } from "lucide-react";
import { BRAND } from "@/lib/constants";
import type { BodyCounts } from "@/lib/inventory";

interface NavLink { label: string; href: string }

const PRICE_BRACKETS: NavLink[] = [
  { label: "$5,000 - $10,000", href: "/inventory?price_min=5000&price_max=10000" },
  { label: "$10,000 - $15,000", href: "/inventory?price_min=10000&price_max=15000" },
  { label: "$15,000 - $20,000", href: "/inventory?price_min=15000&price_max=20000" },
  { label: "$20,000 - $25,000", href: "/inventory?price_min=20000&price_max=25000" },
  { label: "Over $25,000", href: "/inventory?price_min=25000" },
];

const FEATURE_LINKS: NavLink[] = [
  { label: "Car Finder", href: "/inventory" },
  { label: "Over 30 MPG", href: "/inventory?feature=mpg30" },
  { label: "Convertible", href: "/inventory?feature=convertible" },
  { label: "Moonroof", href: "/inventory?feature=moonroof" },
  { label: "Leather seats", href: "/inventory?feature=leather" },
  { label: "Heated seats", href: "/inventory?feature=heated" },
  { label: "Keyless ignition/entry", href: "/inventory?feature=keyless" },
];

const SIMPLE_MENUS: Record<string, NavLink[]> = {
  SPECIALS: [
    { label: "Used Car Specials", href: "/specials" },
    { label: "Manager Specials", href: "/specials#manager" },
    { label: "Weekly Ads", href: "/specials#weekly" },
  ],
  FINANCE: [
    { label: "Online Credit Approval", href: "/finance#apply" },
    { label: "Aprobación de crédito", href: "/finance#aprobacion" },
    { label: "Get Pre-Qualified", href: "/finance#pre-qualified" },
    { label: "Value Your Trade", href: "/finance#trade" },
    { label: "Schedule Test Drive", href: "/finance#test-drive" },
    { label: "Car Finder", href: "/inventory" },
  ],
  "ABOUT US": [
    { label: "Our Dealership", href: "/about" },
    { label: "Testimonials", href: "/about#testimonials" },
    { label: "Contact Us", href: "/#contact" },
    { label: "Our Team", href: "/about#team" },
    { label: "Careers", href: "/about#careers" },
  ],
};

const TABS = [
  { label: "HOME", href: "/" },
  { label: "PRE-OWNED", href: "/inventory" },
  { label: "SPECIALS", href: "/specials" },
  { label: "FINANCE", href: "/finance" },
  { label: "ABOUT US", href: "/about" },
] as const;

const panelBase =
  "invisible absolute z-50 border border-t-2 border-zinc-800 border-t-blue-600 bg-zinc-950 opacity-0 shadow-[0_24px_48px_rgba(0,0,0,0.6)] transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100";
const linkCls = "block px-3 py-2 text-sm text-zinc-300 transition hover:bg-blue-600 hover:text-white focus-visible:bg-blue-600 focus-visible:text-white focus-visible:outline-none";

export function Navbar({ counts }: { counts: BodyCounts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const bodyStyles: { label: string; href: string; count: number; icon: LucideIcon }[] = [
    { label: "View all", href: "/inventory", count: counts.all, icon: LayoutGrid },
    { label: "Cars", href: "/inventory?body=Cars", count: counts.Cars ?? 0, icon: Car },
    { label: "Trucks", href: "/inventory?body=Trucks", count: counts.Trucks ?? 0, icon: Truck },
    { label: "SUVs & Crossovers", href: "/inventory?body=SUVs+%26+Crossovers", count: counts["SUVs & Crossovers"] ?? 0, icon: CarFront },
    { label: "Vans", href: "/inventory?body=Vans", count: counts.Vans ?? 0, icon: Bus },
    { label: "Hybrid & Electric", href: "/inventory?fuel=Hybrid&fuel=Electric", count: counts.hybrid, icon: Zap },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-blue-900/50 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${BRAND.name} home`}>
          <Image src={BRAND.logo} alt="" width={56} height={56} priority className="h-12 w-12 rounded-full object-cover shadow-neon sm:h-14 sm:w-14" />
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-wide text-zinc-100 sm:text-lg">SOURCE 1</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-400">Auto Group</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <a href={BRAND.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
            <MapPin size={18} className="text-red-600" aria-hidden />
            <span>{BRAND.addressLine1}, {BRAND.addressLine2}</span>
          </a>
          <a href={BRAND.phoneHref} className="flex items-center gap-2 font-semibold text-zinc-100 hover:text-white">
            <Phone size={18} className="text-blue-500" aria-hidden /> {BRAND.phoneDisplay}
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a href={BRAND.phoneHref} aria-label="Call us" className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white">
            <Phone size={18} aria-hidden />
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100"
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      <nav aria-label="Main" className="relative hidden border-t border-zinc-800 bg-zinc-900 md:block">
        <ul className="mx-auto flex max-w-7xl">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            const simple = SIMPLE_MENUS[tab.label];
            return (
              <li key={tab.label} className={`group flex-1 ${simple ? "relative" : ""}`}>
                <Link
                  href={tab.href}
                  className={`flex h-12 items-center justify-center gap-1.5 border-x border-zinc-950/60 text-sm font-extrabold uppercase tracking-wider transition focus-visible:outline-none ${
                    active
                      ? "bg-red-600 text-white"
                      : "text-zinc-300 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white group-focus-within:bg-blue-600 group-focus-within:text-white"
                  }`}
                >
                  {tab.label}
                  {(simple || tab.label === "PRE-OWNED") && <ChevronDown size={14} aria-hidden />}
                </Link>

                {simple && (
                  <ul className={`${panelBase} ${tab.label === "ABOUT US" ? "right-0" : "left-0"} top-full w-64 py-1`}>
                    {simple.map((l) => (
                      <li key={l.label}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
                    ))}
                  </ul>
                )}

                {tab.label === "PRE-OWNED" && (
                  <div className={`${panelBase} inset-x-0 top-full`}>
                    <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-6 py-6">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">Body Styles</p>
                        <ul>
                          {bodyStyles.map(({ label, href, count, icon: Icon }) => (
                            <li key={label}>
                              <Link href={href} className={`${linkCls} flex items-center gap-3`}>
                                <Icon size={22} aria-hidden className="shrink-0" />
                                <span className="flex-1">{label}</span>
                                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-100">{count}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">Shop by Price</p>
                        <ul>
                          {PRICE_BRACKETS.map((l) => (
                            <li key={l.label}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">Features</p>
                        <ul>
                          {FEATURE_LINKS.map((l) => (
                            <li key={l.label}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[75svh] overflow-y-auto border-t border-zinc-800 bg-zinc-900 md:hidden">
          <ul>
            {TABS.map((tab) => {
              const links =
                tab.label === "PRE-OWNED"
                  ? [...bodyStyles.map((b) => ({ label: `${b.label} (${b.count})`, href: b.href })), ...PRICE_BRACKETS, ...FEATURE_LINKS]
                  : SIMPLE_MENUS[tab.label];
              return (
                <li key={tab.label} className="border-b border-zinc-800">
                  <Link
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 text-sm font-extrabold uppercase tracking-wider ${isActive(tab.href) ? "bg-red-600 text-white" : "text-zinc-100"}`}
                  >
                    {tab.label}
                  </Link>
                  {links && (
                    <ul className="bg-zinc-950 py-1">
                      {links.map((l) => (
                        <li key={l.label}>
                          <Link href={l.href} onClick={() => setOpen(false)} className="block px-8 py-2.5 text-sm text-zinc-400 hover:text-white">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
