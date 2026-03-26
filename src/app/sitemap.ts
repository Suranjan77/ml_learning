import type { MetadataRoute } from "next";
import { algorithms } from "@/data/algorithms";
import { getAbsoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getAbsoluteUrl("/algorithms/supervised"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/algorithms/unsupervised"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/algorithms/deep-learning"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const algorithmRoutes: MetadataRoute.Sitemap = algorithms.map(
    (algorithm) => ({
      url: getAbsoluteUrl(`/algorithms/${algorithm.id}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...algorithmRoutes];
}
