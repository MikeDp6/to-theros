import { getCollection } from "astro:content";

const isPublished = (entry) => import.meta.env.DEV || entry.data.draft !== true;

/** Όλα τα δημοσιευμένα άρθρα, νεότερα πρώτα. */
export async function getAllPosts() {
  const posts = await getCollection("arthra", isPublished);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Άρθρα μιας κατηγορίας, νεότερα πρώτα. */
export async function getPostsByCategory(slug) {
  const posts = await getAllPosts();
  return posts.filter((p) => p.data.category === slug);
}

/** Τα featured για το carousel της αρχικής — με fallback στα πιο πρόσφατα. */
export async function getFeaturedPosts(limit = 8) {
  const posts = await getAllPosts();
  const featured = posts.filter((p) => p.data.featured);
  return (featured.length >= 3 ? featured : posts).slice(0, limit);
}

/** Όλα τα tags με το πλήθος τους, από το συχνότερο. */
export async function getAllTags() {
  const posts = await getAllPosts();
  const counts = new Map();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count, slug: slugifyTag(tag) }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "el"));
}

/** Σχετικά άρθρα: πρώτα κοινά tags, μετά ίδια κατηγορία. */
export async function getRelatedPosts(post, limit = 3) {
  const posts = await getAllPosts();
  const others = posts.filter((p) => p.id !== post.id);
  const tags = new Set(post.data.tags);

  const scored = others.map((p) => {
    const shared = p.data.tags.filter((t) => tags.has(t)).length;
    const sameCategory = p.data.category === post.data.category ? 1 : 0;
    return { post: p, score: shared * 2 + sameCategory };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

/** Ελληνικά -> λατινικά slug για URL ετικέτας. */
export function slugifyTag(tag) {
  const map = {
    α: "a", ά: "a", β: "v", γ: "g", δ: "d", ε: "e", έ: "e", ζ: "z",
    η: "i", ή: "i", θ: "th", ι: "i", ί: "i", ϊ: "i", ΐ: "i", κ: "k",
    λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", ό: "o", π: "p", ρ: "r",
    σ: "s", ς: "s", τ: "t", υ: "y", ύ: "y", ϋ: "y", ΰ: "y", φ: "f",
    χ: "ch", ψ: "ps", ω: "o", ώ: "o",
  };
  return tag
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ημερομηνία σε ελληνική μορφή: 12 Απριλίου 2026 */
export function formatDate(date) {
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
