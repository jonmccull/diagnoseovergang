// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Canonical origin for canonical links, Open Graph URLs, the sitemap and
  // robots.txt. Change it here (and only here) when a custom domain lands.
  site: "https://diagnoseovergang.no",
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
