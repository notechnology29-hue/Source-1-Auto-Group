import type { MetadataRoute } from "next";
import { getPublicVehicles } from "@/lib/public-data";
import { SITE_URL } from "@/lib/site";

const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/inventory", priority: 0.9 },
  { path: "/specials", priority: 0.7 },
  { path: "/finance", priority: 0.7 },
  { path: "/services", priority: 0.7 },
  { path: "/about", priority: 0.5 },
  { path: "/privacy", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getPublicVehicles();
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p.path}`, changeFrequency: "weekly" as const, priority: p.priority })),
    ...vehicles.map((v) => ({
      url: `${SITE_URL}/inventory/${v.id}`,
      lastModified: v.updated_at ? new Date(v.updated_at) : undefined,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
