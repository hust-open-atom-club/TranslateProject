import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";

import remarkBadImage from "./plugin/RemarkBadImage";
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";
import type { RehypePlugins } from "astro";


// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
      remarkBadImage,
    ],
    rehypePlugins: [rehypeAstroRelativeMarkdownLinks] as RehypePlugins,
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@config": "/src/config.ts",
        "@utils": "/src/utils",
      },
    }
  },
  scopedStyleStrategy: "where",
});

