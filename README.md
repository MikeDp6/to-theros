# Το Θέρος

Ιστοσελίδα για το [@to_theros](https://www.instagram.com/to_theros). Astro + React islands, περιεχόμενο σε markdown.

## Εντολές

```bash
npm install       # μία φορά
npm run dev       # τοπικά στο localhost:4321
npm run build     # στατικό site στο dist/
npm run preview   # δες το build πριν ανέβει
```

## Πώς ανεβάζω νέο κείμενο

1. Φτιάξε αρχείο `src/content/arthra/onoma-tou-keimenou.md`.
   Το όνομα του αρχείου γίνεται το URL: `/arthra/onoma-tou-keimenou/`.
   Λατινικά, χωρίς τόνους, με παύλες. **Δεν αλλάζει μετά τη δημοσίευση** — σπάει links.

2. Βάλε την εικόνα δίπλα στο `.md`, στον ίδιο φάκελο.

3. Γράψε το frontmatter:

```yaml
---
title: "Άρωμα αέρα"
category: "poiisi"          # δες src/config/categories.js
date: 2026-04-12
excerpt: "Λίγες σκέψεις για τη μνήμη και τον χρόνο"
cover: "./aroma-aera.jpg"
coverAlt: "Ανοιχτό παράθυρο σε καλοκαιρινό μεσημέρι"
tags: ["μνήμη", "χρόνος"]
instagram: "https://www.instagram.com/p/XXXX/"
featured: false             # true = μπαίνει στο carousel της αρχικής
draft: false                # true = δεν χτίζεται καθόλου
---

Εδώ το κείμενο σε markdown.
```

4. `git add . && git commit -m "..." && git push` — το Netlify χτίζει μόνο του.

Αν ξεχάσεις πεδίο ή γράψεις λάθος κατηγορία, το `npm run build` σταματάει και σου λέει ποιο αρχείο φταίει.

## Πώς προσθέτω κατηγορία

Μία γραμμή στο `src/config/categories.js`. Εμφανίζεται αυτόματα στο navbar, ως σελίδα `/<slug>/`, στα φίλτρα του αρχείου και στο sitemap.

## Δομή

```
src/
  content/arthra/     τα κείμενα (.md) και οι εικόνες τους
  content.config.js   το σχήμα του frontmatter — ο έλεγχος στο build
  config/categories.js  η μοναδική πηγή αλήθειας για τις κατηγορίες
  lib/posts.js        ερωτήματα πάνω στα κείμενα (φίλτρα, σχετικά, tags)
  components/         Navbar, Footer, Seo, PostCard + τα React islands
  layouts/Base.astro  head, navbar, footer
  pages/              τα routes
  styles/
    legacy.css        το αρχικό index.css, αυτούσιο
    site.css          ό,τι προστέθηκε μετά
public/               logo, favicon, bg, og-default.jpg, robots.txt
```

## Routes

| Διαδρομή | Τι δείχνει |
|---|---|
| `/` | hero, carousel, τελευταία ανά κατηγορία |
| `/arthra/<slug>/` | το άρθρο |
| `/<category>/` | όλα της κατηγορίας |
| `/tags/<tag>/` | όλα με μια ετικέτα |
| `/arxeio/` | πλήρες αρχείο με αναζήτηση |
| `/peri/` | περί |
| `/rss.xml` | feed — και τροφοδοσία του newsletter |
| `/sitemap-index.xml` | για το Google Search Console |

## Εκκρεμότητες

- [ ] `site` στο `astro.config.mjs` → το πραγματικό domain
- [ ] Ίδιο domain στο `public/robots.txt`
- [ ] `public/og-default.jpg` — 1200×630, η προεπισκόπηση όταν λείπει cover
- [ ] Πραγματικές εικόνες αντί για τα picsum placeholders
- [ ] Πραγματικές ημερομηνίες από το Instagram
- [ ] Κείμενο στη σελίδα `/peri/`
- [ ] Embed του newsletter στο `src/components/Footer.astro`
