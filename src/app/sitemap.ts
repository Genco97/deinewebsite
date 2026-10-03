import type { MetadataRoute } from "next";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/demo?paket=basis`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE}/demo?paket=business`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE}/demo?paket=premium`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/agb`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
