import Link from "next/link";
import { Phone } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="glass fixed inset-x-0 top-0 z-40 border-x-0 border-t-0">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap" aria-label={`${BRAND.name} home`}>
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-neon bg-neon/10 text-lg font-black text-white shadow-neon">
            S1
          </span>
          <span className="leading-tight">
            <span className="chrome-text block text-base font-extrabold tracking-wide">SOURCE 1</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.3em] text-chrome-dark">Auto Group</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-chrome-dim md:flex">
          <Link href="/#inventory" className="transition hover:text-white">Inventory</Link>
          <Link href="/#transparency" className="transition hover:text-white">Transparency</Link>
          <Link href="/#contact" className="transition hover:text-white">Contact</Link>
        </div>

        <a href={BRAND.phoneHref} className="btn-hot min-h-11 !px-4 !py-2 text-sm">
          <Phone size={16} aria-hidden />
          <span className="hidden sm:inline">{BRAND.phoneDisplay}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </nav>
    </header>
  );
}
