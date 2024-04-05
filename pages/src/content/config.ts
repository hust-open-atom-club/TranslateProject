import { SITE } from "@config";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    author: z.string().default(SITE.author),
    status: z.string().default("collected"),
    title: z.string().default("未命名文章"),
    collector: z.string().default(SITE.author),
    collected_date: z.union(
      [z.date(), z.string(), z.number()]
    ).default(""),
    translator: z.string().default(SITE.author),
    translated_date: z.union(
      [z.date(), z.string(), z.number()]
    ).default(""),
    link: z.string().url().default(""),
    proofreader: z.string().default(SITE.author),
    proofread_date: z.union(
      [z.date(), z.string(), z.number()]
    ).default(""),
  }),
});

export const collections = { posts: blog };
