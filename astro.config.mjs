// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";

import react from "@astrojs/react";
import remarkWikiLinks from "./src/lib/remark-wiki-links.ts";

// https://astro.build/config
export default defineConfig({
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
