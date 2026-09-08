import rss from "@astrojs/rss";
import { getAllPosts } from "../lib/posts.js";
import { categoryLabel } from "../config/categories.js";

/**
 * Το feed είναι διπλά χρήσιμο: για όποιον διαβάζει με RSS reader,
 * και ως τροφοδοσία του newsletter (Buttondown/MailerLite στέλνουν
 * αυτόματα email σε κάθε νέο item).
 */
export async function GET(context) {
  const posts = await getAllPosts();

  return rss({
    title: "Το Θέρος",
    description: "Ποίηση, ιστορία, τέχνες και μουσική.",
    site: context.site,
    customData: "<language>el</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: `/arthra/${post.id}/`,
      categories: [categoryLabel(post.data.category), ...post.data.tags],
    })),
  });
}
