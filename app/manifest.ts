import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Foo Bar Departures",
    short_name: "Departures",
    description: "Realtime transit departure information",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/buss.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/buss.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/buss.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
