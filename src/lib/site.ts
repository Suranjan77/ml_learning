export const siteConfig = {
  name: "ML Learn",
  title: "ML Learn | The Digital Observatory",
  description:
    "Understand AI through interactive machine learning visualizations, mathematical intuition, and production-ready learning experiences.",
  shortDescription: "Understand AI, Mathematically & Intuitively",
  locale: "en_US",
  keywords: [
    "machine learning",
    "deep learning",
    "neural networks",
    "artificial intelligence",
    "data science",
    "interactive learning",
    "algorithm visualizations",
    "ML education",
  ],
} as const;

export function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "http://localhost:3000";

  return value.replace(/\/+$/, "");
}

export function getAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
