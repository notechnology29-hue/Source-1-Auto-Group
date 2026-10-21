"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { SORTS, type SortId } from "@/lib/inventory";

interface Props {
  sort: SortId;
  view: "grid" | "list";
}

export function InventoryControls({ sort, view }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const viewBtn = (id: "grid" | "list", label: string, Icon: typeof List) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={view === id}
      onClick={() => set("view", id)}
      className={`flex h-10 w-10 items-center justify-center transition ${view === id ? "bg-blue-600 text-white" : "bg-zinc-50 text-zinc-600 hover:text-white"}`}
    >
      <Icon size={18} aria-hidden />
    </button>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex overflow-hidden rounded-md border border-zinc-300">
        {viewBtn("grid", "Grid view", LayoutGrid)}
        {viewBtn("list", "List view", List)}
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <span className="hidden sm:inline">Sort By</span>
        <select
          value={sort}
          onChange={(e) => set("sort", e.target.value)}
          className="h-10 rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
