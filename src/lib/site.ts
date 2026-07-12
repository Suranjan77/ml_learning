export const siteConfig = {
  name: "Machine Learning Visualisations",
  title: "Interactive Machine Learning Visualisations",
  description:
    "Interactive visualisations for understanding machine learning and deep learning concepts through direct manipulation.",
  shortDescription: "Interactive machine learning visualisations",
  locale: "en_GB",
  keywords: [
    "machine learning",
    "deep learning",
    "neural networks",
    "artificial intelligence",
    "data science",
    "interactive learning",
    "algorithm visualisations",
    "ML education",
    "deep learning visualisations",
  ],
} as const;

export function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://suranjan77.github.io";

  return value.replace(/\/+$/, "");
}

export function getAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
