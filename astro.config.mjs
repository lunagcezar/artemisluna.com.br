// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import { env } from "node:process";

import react from "@astrojs/react";
import remarkWikiLinks from "./src/lib/remark-wiki-links.ts";

// https://astro.build/config
export default defineConfig({
  site: env.SITE_URL || "https://artemisluna.com.br",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],

  markdown: {
    processor: unified({
      remarkPlugins: [remarkWikiLinks],
    }),
  },
});
