"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
  initialQuery?: string;
  /** Keep the current filters/sort when searching (inventory page). */
  keepParams?: boolean;
}

export function SearchBar({ initialQuery = "", keepParams = false }: Props) {
  const router = useRouter();
  const current = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const go = (q: string) => {
    const params = new URLSearchParams(keepParams ? current.toString() : "");
    params.delete("q");
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(`/inventory${qs ? `?${qs}` : ""}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go(query);
  };

  return (
    <form onSubmit={onSubmit} role="search" className="mx-auto flex w-full max-w-3xl items-center rounded-lg border border-zinc-300 bg-zinc-50 focus-within:border-blue-500 focus-within:shadow-neon">
      <Search className="ml-4 shrink-0 text-zinc-600" size={20} aria-hidden />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a Vehicle..."
        aria-label="Search for a vehicle"
        className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            if (initialQuery) go("");
          }}
          className="mr-1 flex h-11 w-11 items-center justify-center text-zinc-600 hover:text-zinc-900"
        >
          <X size={18} aria-hidden />
        </button>
      )}
      <button type="submit" className="sr-only">Search</button>
    </form>
  );
}
