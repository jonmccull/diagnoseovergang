// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
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
