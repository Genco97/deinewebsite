import type { MetadataRoute } from "next";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Interne Bereiche nicht in Suchmaschinen
      disallow: ["/crm", "/login", "/registrieren", "/passwort-vergessen", "/auth", "/danke"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
