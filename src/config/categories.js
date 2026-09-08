/**
 * Η μοναδική πηγή αλήθειας για τις κατηγορίες.
 *
 * Νέα κατηγορία = μία γραμμή εδώ. Εμφανίζεται αυτόματα:
 *   - στο navbar
 *   - ως σελίδα /<slug>/
 *   - στα φίλτρα του αρχείου
 *   - στο sitemap
 *
 * Το slug γίνεται URL, οπότε γράφεται λατινικά χωρίς τόνους και ΔΕΝ αλλάζει
 * αφού δημοσιευτεί (σπάει links). Το label είναι ό,τι βλέπει ο αναγνώστης.
 */
export const categories = [
  {
    slug: "poiisi",
    label: "Ποίηση",
    order: 1,
    description: "Ποιήματα, αποσπάσματα και σημειώσεις πάνω στον λόγο.",
  },
  {
    slug: "istoria",
    label: "Ιστορία",
    order: 2,
    description: "Πρόσωπα, τόποι και στιγμές που άφησαν ίχνος.",
  },
  {
    slug: "texnes",
    label: "Τέχνες",
    order: 3,
    description: "Εικαστικά, κινηματογράφος, θέατρο, φωτογραφία.",
  },
  {
    slug: "mousiki",
    label: "Μουσική",
    order: 4,
    description: "Τραγούδια, συνθέτες και ηχογραφήσεις που αξίζουν.",
  },
];

/** Ταξινομημένες, για navbar και λίστες. */
export const orderedCategories = [...categories].sort((a, b) => a.order - b.order);

/** Μόνο τα slugs — το χρησιμοποιεί το schema του frontmatter. */
export const categorySlugs = categories.map((c) => c.slug);

/** @param {string} slug */
export function getCategory(slug) {
  return categories.find((c) => c.slug === slug);
}

/** Ετικέτα κατηγορίας, με ασφαλές fallback. */
export function categoryLabel(slug) {
  return getCategory(slug)?.label ?? slug;
}
