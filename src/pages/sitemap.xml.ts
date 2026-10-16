import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { sitePaths } from "../lib/seo";

export const GET: APIRoute = async ({ site }) => {
  const entries = await getCollection("pd");
  const urls = sitePaths(entries)
    .map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
