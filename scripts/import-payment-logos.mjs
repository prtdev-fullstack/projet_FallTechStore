import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ==========================================================================
   Import des logos de moyens de paiement depuis public/photo-paiement/, pour
   le pied de page (voir src/components/layout/Footer.tsx).

   Convention : un fichier par moyen de paiement, nommé d'après lui (accents,
   espaces, majuscules, extension — tout est normalisé avant comparaison) :

     Orange Money.png       wave.jpg       MASTERCARD.webp

   Chaque logo trouvé est redimensionné (dans un cadre 320×160, sans
   recadrage ni agrandissement) et converti en WebP sans perte — mêmes
   raisons que pour les logos de marque (voir import-brand-logos.mjs) — dans
   public/payments/<slug>.webp.

   Usage : node scripts/import-payment-logos.mjs
   ========================================================================== */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LOGOS_DIR = path.join(ROOT, 'public', 'photo-paiement');
const PAYMENTS_DIR = path.join(ROOT, 'public', 'payments');

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];

// La même liste, dans le même ordre, que PAYMENT_METHODS dans Footer.tsx.
const PAYMENT_NAMES = ['Orange Money', 'Wave', 'Visa', 'Mastercard'];

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
    console.error(`Dossier introuvable : public/photo-paiement/ — créez-le et déposez-y vos logos.`);
    process.exit(1);
  }

  const files = fs.readdirSync(LOGOS_DIR).filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));
  fs.mkdirSync(PAYMENTS_DIR, { recursive: true });

  const matched = [];
  const unmatched = [];

  for (const name of PAYMENT_NAMES) {
    const slug = slugify(name);
    const file = files.find((f) => slugify(path.parse(f).name) === slug);
    if (!file) {
      unmatched.push(name);
      continue;
    }

    const outPath = path.join(PAYMENTS_DIR, `${slug}.webp`);
    try {
      const buffer = fs.readFileSync(path.join(LOGOS_DIR, file));
      await sharp(buffer)
        .resize({ width: 320, height: 160, fit: 'inside', withoutEnlargement: true })
        .webp({ lossless: true })
        .toFile(outPath);
      matched.push({ name, file });
    } catch (error) {
      console.error(`  ${name} <- ${file} ... ECHEC (${error.message})`);
    }
  }

  console.log('');
  for (const { name, file } of matched) {
    console.log(`${name} <- ${file} ... ok`);
  }
  console.log('');
  console.log(`${matched.length}/${PAYMENT_NAMES.length} logos importés.`);

  if (unmatched.length > 0) {
    console.log('');
    console.log(`${unmatched.length} moyen(s) de paiement sans logo trouvé (repli en texte) :`);
    for (const name of unmatched) console.log(`  - ${name}`);
  }

  const usedFiles = new Set(matched.map((m) => m.file));
  const unusedFiles = files.filter((f) => !usedFiles.has(f));
  if (unusedFiles.length > 0) {
    console.log('');
    console.log(`${unusedFiles.length} fichier(s) dans photo-paiement/ non reconnu(s) (nom sans correspondance) :`);
    for (const f of unusedFiles) console.log(`  - ${f}`);
  }
}

await main();
