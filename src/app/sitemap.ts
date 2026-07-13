import type { MetadataRoute } from "next";
import { exhibits } from "@/features/exhibits/registry";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: getAbsoluteUrl("/"), priority: 1, changeFrequency: "monthly" },
    { url: getAbsoluteUrl("/visualisations"), priority: 0.9, changeFrequency: "weekly" },
    { url: getAbsoluteUrl("/methodology"), priority: 0.5, changeFrequency: "yearly" },
    ...exhibits.map(({ slug }) => ({ url: getAbsoluteUrl(`/visualisations/${slug}`), priority: 0.8, changeFrequency: "monthly" as const })),
  ];
}
