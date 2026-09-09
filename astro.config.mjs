// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// ΑΛΛΑΞΕ ΑΥΤΟ όταν έρθει το domain (π.χ. https://totheros.gr). Χρησιμοποιείται σε canonical, og:url,
// sitemap.xml και rss.xml — αν είναι λάθος, η Google δείχνει σε λάθος διεύθυνση.
const SITE = "https://to-theros.mixalhsdiplaros-w-p.workers.dev";

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: "github-light", wrap: true },
  },
  image: {
    // τοπικές εικόνες -> webp με σωστά width/height, χωρίς layout shift
    responsiveStyles: true,
  },
});
