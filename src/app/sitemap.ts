import type { MetadataRoute } from "next";
import { algorithmsList } from "@/data/algorithms_content";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...[
      "/labs",
      "/labs/sampling",
      "/labs/gradient-descent",
      "/labs/overfitting",
      "/labs/attention",
      "/labs/tokenizer",
      "/playground",
      "/map",
      "/tracks",
    ].map((path) => ({
      url: getAbsoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];

  const algorithmRoutes: MetadataRoute.Sitemap = algorithmsList.map(
    (algorithm) => ({
      url: getAbsoluteUrl(`/algorithms/${algorithm.id}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...algorithmRoutes];
}
