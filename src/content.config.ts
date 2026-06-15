import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const art = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/art" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    author: z.string().optional(),
    images: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      }),
    ),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    author: z.string().optional(),
    image: z.string().optional(),
  }),
});

const wiki = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wiki" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date().optional(),
    image: z.string().optional(),
    author: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
    index: z.boolean().optional(),
  }),
});

export const collections = { art, blog, wiki };
