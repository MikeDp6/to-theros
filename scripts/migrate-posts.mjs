/**
 * Μεταφέρει τα παλιά src/data/posts.js και src/data/history.js
 * σε αρχεία markdown στο src/content/arthra/.
 *
 *   node scripts/migrate-posts.mjs
 *
 * Τρέχει μία φορά. Δεν σβήνει τίποτα και δεν ξαναγράφει αρχείο που υπάρχει ήδη,
 * οπότε είναι ασφαλές να ξανατρέξει.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "content", "arthra");

const GR = {
  α: "a", ά: "a", β: "v", γ: "g", δ: "d", ε: "e", έ: "e", ζ: "z",
  η: "i", ή: "i", θ: "th", ι: "i", ί: "i", ϊ: "i", ΐ: "i", κ: "k",
  λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", ό: "o", π: "p", ρ: "r",
  σ: "s", ς: "s", τ: "t", υ: "y", ύ: "y", ϋ: "y", ΰ: "y", φ: "f",
  χ: "ch", ψ: "ps", ω: "o", ώ: "o",
};

const slugify = (text) =>
  text.toLowerCase().split("").map((c) => GR[c] ?? c).join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const exists = async (p) => access(p).then(() => true).catch(() => false);

const yamlString = (s) => `"${String(s).replace(/"/g, '\\"')}"`;

async function loadDefault(relPath) {
  const full = join(root, relPath);
  if (!(await exists(full))) {
    console.warn(`  ⚠ δεν βρέθηκε ${relPath} — παραλείπεται`);
    return [];
  }
  const mod = await import(pathToFileURL(full).href);
  return mod.default ?? [];
}

async function write(entry, index, total) {
  const slug = slugify(entry.title) || `keimeno-${index + 1}`;
  const file = join(outDir, `${slug}.md`);

  if (await exists(file)) {
    console.log(`  · ${slug}.md υπάρχει ήδη, δεν το πειράζω`);
    return;
  }

  // Ψεύτικες ημερομηνίες με φθίνουσα σειρά, ώστε να υπάρχει κάποια σειρά
  // από την πρώτη στιγμή. ΑΛΛΑΞΕ ΤΕΣ με τις πραγματικές του Instagram.
  const date = new Date();
  date.setDate(date.getDate() - (total - index) * 4);
  const iso = date.toISOString().slice(0, 10);

  const isRemote = /^https?:\/\//.test(entry.image ?? "");

  const front = [
    "---",
    `title: ${yamlString(entry.title)}`,
    `category: ${yamlString(entry.category)}`,
    `date: ${iso}`,
    `excerpt: ${yamlString(entry.excerpt)}`,
    entry.image
      ? `cover: ${yamlString(entry.image)}${isRemote ? "   # TODO: αντικατάσταση με δική σου εικόνα δίπλα σε αυτό το αρχείο" : ""}`
      : "# cover: \"./eikona.jpg\"",
    `coverAlt: ""   # TODO: περιγραφή της εικόνας — μετράει για SEO και προσβασιμότητα`,
    "tags: []",
    "# instagram: \"https://www.instagram.com/p/XXXX/\"",
    `featured: ${index < 6}`,
    "draft: false",
    "---",
    "",
    "<!-- TODO: το πραγματικό κείμενο. Το παρακάτω είναι η περίληψη, ως αφετηρία. -->",
    "",
    entry.excerpt,
    "",
  ].join("\n");

  await writeFile(file, front, "utf8");
  console.log(`  ✓ ${slug}.md`);
}

const posts = await loadDefault("src/data/posts.js");
const history = await loadDefault("src/data/history.js");

const entries = [
  ...posts.map((p) => ({
    title: p.title,
    excerpt: p.content ?? "",
    image: p.image,
    category: "poiisi",
  })),
  ...history.map((h) => ({
    title: h.title,
    excerpt: h.description ?? "",
    image: h.image,
    category: "istoria",
  })),
];

await mkdir(outDir, { recursive: true });

console.log(`\nΜεταφορά ${entries.length} εγγραφών σε ${outDir}\n`);
for (const [i, entry] of entries.entries()) {
  await write(entry, i, entries.length);
}
console.log(`\nΈτοιμο. Τώρα: npm run dev\n`);
