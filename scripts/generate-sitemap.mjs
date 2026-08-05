/**
 * Génère public/sitemap.xml à partir du catalogue.
 *
 * Écrit en JavaScript pur plutôt qu'en TypeScript pour rester exécutable par
 * `node` sans étape de compilation, et branché sur le script `build` : le plan
 * du site ne peut donc pas se désynchroniser du catalogue.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const SITE_URL = 'https://falltechstore.sn';

/* On extrait les slugs par lecture du fichier source : aucune dépendance à un
   pipeline TypeScript, et la source de vérité reste src/data/products.ts. */
const source = readFileSync(resolve(root, 'src/data/products.ts'), 'utf8');
const slugs = [...source.matchAll(/^\s{4}slug: '([a-z0-9-]+)',$/gm)].map((match) => match[1]);

const categories = ['smartphones', 'audio', 'accessoires', 'objets-connectes'];
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/boutique', priority: '0.9', changefreq: 'daily' },
  { loc: '/a-propos', priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
  ...categories.map((id) => ({
    loc: `/boutique?categorie=${id}`,
    priority: '0.7',
    changefreq: 'weekly',
  })),
  ...slugs.map((slug) => ({
    loc: `/produit/${slug}`,
    priority: '0.8',
    changefreq: 'weekly',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.loc.replace(/&/g, '&amp;')}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml généré — ${urls.length} URL dont ${slugs.length} fiches produit`);
