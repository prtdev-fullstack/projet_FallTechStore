/**
 * Rapatrie les visuels produits en local et les normalise.
 *
 * Le catalogue d'origine chargeait ses images depuis huit domaines tiers : liens
 * cassables, poids non maîtrisé, hotlinking non autorisé. Ce script télécharge
 * une fois pour toutes, recadre en carré sur fond neutre et exporte en WebP.
 *
 *   node scripts/fetch-images.mjs
 *
 * À relancer uniquement si le catalogue change : les fichiers produits sont
 * versionnés, le site n'a aucune dépendance réseau à l'exécution.
 */
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../public/products');
mkdirSync(OUT, { recursive: true });

const pexels = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

/* Sources par produit. Les URL « historiques » sont celles du catalogue
   d'origine : ce sont les photos exactes des produits concernés. Les autres
   viennent de Pexels (licence libre, usage commercial autorisé). */
const SOURCES = {
  /* ── Photos d'origine, spécifiques au produit ── */
  'samsung-galaxy-s24':
    'https://static1.anpoimages.com/wordpress/wp-content/uploads/2024/01/galaxy-s24-ultra-titanium-violet.png',
  'airpods-pro':
    'https://www.epic.com.mt/wp-content/uploads/2023/03/AirPods_Pro_2nd-Gen-1.png',
  'iphone-13-pro':
    'https://c2.lestechnophiles.com/images.frandroid.com/wp-content/uploads/2021/09/apple-iphone-13-pro-max-frandroid-2021.png?resize=350',
  'coque-iphone-15-pro':
    'https://cdn.shopify.com/s/files/1/0845/2617/0445/files/Coque-en-bois-iPhone-wood-merisier.jpg',
  'iphone-14':
    'https://candid.technology/wp-content/uploads/2022/09/iphone-14-max-1.jpg',
  'chargeur-sans-fil':
    'https://www.chargeur-induction.fr/wp-content/uploads/2019/06/eozy-qi-chargeur-sans-fil-rapide-chargeur-a-induct.jpg',
  'samsung-galaxy-a54':
    'https://media-cdn.bnn.in.th/283749/Samsung-Smartphone-Galaxy-A54-1-square_medium.jpg',
  'airpods-3': pexels(8534088),
  'google-pixel-8': pexels(699122),
  'iphone-15-pro': pexels(18525574),

  /* ── Compléments Pexels ── */
  'iphone-15-pro-max': pexels(13802140),
  'iphone-13': pexels(12741170),
  'samsung-galaxy-s24-ultra': pexels(13844013),
  'samsung-galaxy-a55': pexels(3945672),
  'google-pixel-8-pro': pexels(12741171),
  'xiaomi-redmi-note-13-pro': pexels(3850561),
  'tecno-camon-30': pexels(1581634),
  'infinix-hot-40i': pexels(47261),
  'oppo-reno-11': pexels(215581),
  'realme-c67': pexels(3945691),

  'airpods-pro-2': pexels(10104407),
  'galaxy-buds3-pro': pexels(11599421),
  'sony-wh-1000xm5': pexels(185030),
  'jbl-tune-770nc': pexels(13417532),
  'jbl-flip-6': pexels(12657546),
  'anker-soundcore-life-q30': pexels(11945638),
  'ecouteurs-filaires-usb-c': pexels(14741306),

  'chargeur-gan-65w': pexels(3921630),
  'batterie-externe-20000': pexels(3921700),
  'verre-trempe-9h': pexels(3921704),
  'cable-usb-c-tresse-2m': pexels(3921710),
  'support-voiture-magsafe': pexels(19089099),
  'adaptateur-usb-c-jack': pexels(3921706),

  'apple-watch-series-9': pexels(1697570),
  'galaxy-watch6': pexels(267391),
  'xiaomi-smart-band-8': pexels(13007642),
  'galaxy-tab-a9': pexels(1034650),
  'enceinte-jbl-go-4': pexels(128611),
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

async function download(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Normalise : carré 900 px, fond neutre clair, marge autour du produit.
 * Le fond blanc cassé est celui des marketplaces — il fait ressortir le produit
 * aussi bien en thème clair qu'en thème sombre.
 */
async function normalize(buffer, slug) {
  const base = sharp(buffer).resize(820, 820, {
    fit: 'contain',
    background: { r: 244, g: 245, b: 247, alpha: 1 },
  });

  await base
    .clone()
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 244, g: 245, b: 247, alpha: 1 } })
    .flatten({ background: { r: 244, g: 245, b: 247 } })
    .webp({ quality: 82 })
    .toFile(resolve(OUT, `${slug}.webp`));

  // Vignette pour les listes denses et le panier : 4× plus légère.
  await sharp(buffer)
    .resize(320, 320, { fit: 'contain', background: { r: 244, g: 245, b: 247, alpha: 1 } })
    .flatten({ background: { r: 244, g: 245, b: 247 } })
    .webp({ quality: 78 })
    .toFile(resolve(OUT, `${slug}-thumb.webp`));
}

const results = { ok: [], failed: [] };

for (const [slug, url] of Object.entries(SOURCES)) {
  if (existsSync(resolve(OUT, `${slug}.webp`))) {
    results.ok.push(`${slug} (déjà présent)`);
    continue;
  }
  try {
    const buffer = await download(url);
    await normalize(buffer, slug);
    results.ok.push(slug);
    process.stdout.write(`✓ ${slug}\n`);
  } catch (error) {
    results.failed.push(`${slug} — ${error.message}`);
    process.stdout.write(`✗ ${slug} — ${error.message}\n`);
  }
}

writeFileSync(
  resolve(OUT, 'MANIFEST.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), ...results }, null, 2),
);

console.log(`\n${results.ok.length} visuels prêts, ${results.failed.length} en échec.`);
