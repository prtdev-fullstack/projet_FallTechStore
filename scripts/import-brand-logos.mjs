import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ==========================================================================
   Import des logos de marque depuis public/photo-marques/, pour le bandeau
   défilant de la page d'accueil (voir BrandStrip dans src/pages/Home.tsx).

   Convention : un fichier par marque, nommé d'après elle (accents, espaces,
   majuscules, extension — tout est normalisé avant comparaison) :

     Apple.png       samsung.jpg       XIAOMI.webp

   Chaque logo trouvé est redimensionné (dans un cadre 320×160, sans
   recadrage ni agrandissement) et converti en WebP sans perte — un logo est
   surtout du texte et des aplats nets, la compression avec perte y est bien
   plus visible que sur une photo — dans public/brands/<slug>.webp.

   Usage : node scripts/import-brand-logos.mjs
   ========================================================================== */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LOGOS_DIR = path.join(ROOT, 'public', 'photo-marques');
const BRANDS_DIR = path.join(ROOT, 'public', 'brands');

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];

// La même liste, dans le même ordre, que BRANDS dans src/pages/Home.tsx.
const BRAND_NAMES = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Sony', 'JBL', 'Anker', 'Tecno', 'Infinix', 'Oppo'];

const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  if (!fs.existsSync(LOGOS_DIR)) {
    console.error(`Dossier introuvable : public/photo-marques/ — créez-le et déposez-y vos logos.`);
    process.exit(1);
  }

  const files = fs.readdirSync(LOGOS_DIR).filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));
  fs.mkdirSync(BRANDS_DIR, { recursive: true });

  const matched = [];
  const unmatched = [];

  for (const brandName of BRAND_NAMES) {
    const brandSlug = slugify(brandName);
    const file = files.find((f) => slugify(path.parse(f).name) === brandSlug);
    if (!file) {
      unmatched.push(brandName);
      continue;
    }

    const outPath = path.join(BRANDS_DIR, `${brandSlug}.webp`);
    try {
      const buffer = fs.readFileSync(path.join(LOGOS_DIR, file));
      await sharp(buffer)
        .resize({ width: 320, height: 160, fit: 'inside', withoutEnlargement: true })
        .webp({ lossless: true })
        .toFile(outPath);
      matched.push({ brandName, file });
    } catch (error) {
      console.error(`  ${brandName} <- ${file} ... ECHEC (${error.message})`);
    }
  }

  console.log('');
  for (const { brandName, file } of matched) {
    console.log(`${brandName} <- ${file} ... ok`);
  }
  console.log('');
  console.log(`${matched.length}/${BRAND_NAMES.length} logos importés.`);

  if (unmatched.length > 0) {
    console.log('');
    console.log(`${unmatched.length} marque(s) sans logo trouvé :`);
    for (const name of unmatched) console.log(`  - ${name}`);
  }

  const usedFiles = new Set(matched.map((m) => m.file));
  const unusedFiles = files.filter((f) => !usedFiles.has(f));
  if (unusedFiles.length > 0) {
    console.log('');
    console.log(`${unusedFiles.length} fichier(s) dans photo-marques/ non reconnu(s) (nom sans correspondance) :`);
    for (const f of unusedFiles) console.log(`  - ${f}`);
  }
}

await main();
