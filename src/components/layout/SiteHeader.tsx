import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BRAND } from "@/lib/constants";
import { getVehicles } from "@/lib/data";
import { bodyCounts } from "@/lib/inventory";

async function NavbarWithCounts() {
  return <Navbar counts={bodyCounts(await getVehicles())} />;
}

function HeaderShell() {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-900/50 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${BRAND.name} home`}>
          <Image src={BRAND.logo} alt="" width={56} height={56} priority className="h-12 w-12 rounded-full object-cover shadow-neon sm:h-14 sm:w-14" />
        </Link>
      </div>
      <div className="hidden h-12 border-t border-zinc-800 bg-zinc-900 md:block" />
    </header>
  );
}

/** Live body-style counts and the active-tab state are runtime data, so the header streams in behind a static shell. */
export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderShell />}>
      <NavbarWithCounts />
    </Suspense>
  );
}
