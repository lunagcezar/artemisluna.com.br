// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";
import remarkWikiLinks from "./src/lib/remark-wiki-links.ts";
import { env } from "node:process";

// https://astro.build/config
export default defineConfig({
  site: env.SITE_URL || "https://artemisluna.com.br",
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap()],

  markdown: {
    processor: unified({
      remarkPlugins: [remarkWikiLinks],
    }),
  },
});
