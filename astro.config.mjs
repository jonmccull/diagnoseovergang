// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { SITE_ORIGIN } from "./schema/site.ts";

export default defineConfig({
  // Canonical origin for canonical links, Open Graph URLs, the sitemap and
  // robots.txt. The domain lives in schema/site.ts, shared with the worker.
  site: SITE_ORIGIN,
  // Pages serves every page as a directory; links without the slash 308.
  trailingSlash: "always",
  i18n: {
    // "nn" and "en" slot in here later without refactor (brief §5 / locked decision 4)
    defaultLocale: "nb",
    locales: ["nb"],
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
