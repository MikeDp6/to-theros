import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { categorySlugs } from "./config/categories.js";

/**
 * Ένα μοντέλο για ΟΛΕΣ τις κατηγορίες.
 *
 * Ο έλεγχος γίνεται στο build: αν ξεχάσεις πεδίο ή γράψεις λάθος κατηγορία,
 * το `npm run build` σταματάει και σου λέει ποιο αρχείο και ποια γραμμή.
 * Καλύτερα να σπάσει εδώ παρά να ανέβει μισό άρθρο.
 */
const arthra = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/arthra" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),

      category: z.string().refine((c) => categorySlugs.includes(c), {
        message: `Άγνωστη κατηγορία. Επιτρεπτές: ${categorySlugs.join(", ")} (δες src/config/categories.js)`,
      }),

      // Χωρίς ημερομηνία δεν υπάρχει σειρά, "τελευταία άρθρα", ούτε RSS.
      date: z.coerce.date(),

      // Μία-δύο προτάσεις. Γίνεται meta description ΚΑΙ κείμενο στην κάρτα.
      excerpt: z.string().min(1).max(200),

      // Τοπικό αρχείο δίπλα στο .md (βελτιστοποιείται αυτόματα)
      // ή απόλυτο URL (για προσωρινά placeholders).
      cover: z.union([image(), z.string().url()]).optional(),
      coverAlt: z.string().default(""),

      tags: z.array(z.string()).default([]),

      // Link πίσω στο αρχικό post — κρατά συνδεδεμένο το αρχείο με την πηγή του.
      instagram: z.string().url().optional(),

      // Μπαίνει στο carousel της αρχικής.
      featured: z.boolean().default(false),

      // true = δεν χτίζεται καθόλου. Για κείμενα υπό επεξεργασία.
      draft: z.boolean().default(false),

      author: z.string().default("Το Θέρος"),
    }),
});

export const collections = { arthra };
