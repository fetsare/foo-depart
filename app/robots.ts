import type { MetadataRoute } from "next";
import { PUBLIC_BASE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/stop-lookup"],
    },
    sitemap: `${PUBLIC_BASE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
