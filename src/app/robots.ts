import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lpl-icgi.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*/dashboard", "/*/asset/", "/*/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
