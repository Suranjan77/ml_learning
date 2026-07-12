import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Machine Learning Visualisations",
    short_name: "ML Visualisations",
    description: "Interactive visualisations for machine learning concepts.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F2EC",
    theme_color: "#F5F2EC",
    icons: [{ src: "/logo-favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
