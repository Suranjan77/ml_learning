import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ML Learn",
    short_name: "ML Learn",
    description:
      "Learn machine learning through interactive visualizations, mathematical intuition, and hands-on neural playgrounds.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1326",
    theme_color: "#0b1326",
    orientation: "portrait",
    categories: ["education", "developer", "productivity"],
    lang: "en",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
