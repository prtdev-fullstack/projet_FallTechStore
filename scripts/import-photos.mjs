import sharp from 'sharp';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ==========================================================================
   Import des vraies photos produit depuis public/photo/ (ou public/photos/).

   Convention : jusqu'à 3 fichiers par produit, nommés d'après son
   identifiant (slug) ou son nom, avec un numéro en suffixe pour la 2e et la
   3e photo — toutes ces formes sont reconnues, tirets ou pas :

     iphone-15-pro.jpg           iPhone 15 Pro.jpg
     iphone-15-pro-1.jpg         iphone13 1.jpg
     iphone-15-pro-2.jpg         iPhone 15 Pro (2).png
     iphone-15-pro-3.jpg         iPhone 15 Pro_3.webp

   La normalisation (minuscules, accents retires, espaces/tirets/parentheses
   uniformises, puis tirets neutralises pour la comparaison) applique une
   regle proche de celle du formulaire admin pour generer un identifiant,
   donc n'importe laquelle de ces variantes matche le bon produit.

   Chaque photo trouvee est redimensionnee et convertie en WebP dans
   public/products/<slug>-<n>.webp (900 px). La base est mise a jour
   directement : `images` recoit la liste ordonnee des URL, sans passer par
   l'API — plus simple pour un import en masse de 38 produits, et sans
   session admin a fournir en ligne de commande.

   Usage : node scripts/import-photos.mjs
   ========================================================================== */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PRODUCTS_DIR = path.join(ROOT, 'public', 'products');
const DB_PATH = path.join(ROOT, 'server', 'falltech.sqlite');

// Le nom exact du dossier a varie en cours de route (photo vs photos) — on
// accepte les deux plutot que d'imposer un renommage.
const PHOTOS_DIR = ['photo', 'photos']
  .map((name) => path.join(ROOT, 'public', name))
  .find((dir) => fs.existsSync(dir));

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const MAX_PHOTOS = 3;

// Diacritiques combinants (U+0300-U+036F), une fois le texte decompose par
// normalize('NFD') — defini via String.fromCharCode plutot qu'un litteral
// regex direct, pour eviter tout risque d'encodage en manipulant ce fichier.
const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** « iphone-13 » → « iphone13 » : compare deux identifiants independamment
 *  de la presence ou non de tirets, pour matcher aussi bien
 *  « iphone-13-1.jpg » que « iphone13 1.jpg ». */
function collapse(value) {
  return value.replace(/-/g, '');
}

// Marques du catalogue : un fichier « Apple-iPhone-15-Pro-3.jpg » doit
// matcher « iphone-15-pro » meme avec ce prefixe devant.
const BRAND_PREFIXES = ['apple', 'samsung', 'google', 'xiaomi', 'tecno', 'infinix', 'sony', 'jbl', 'anker'];

function stripBrandPrefix(looseValue) {
  const brand = BRAND_PREFIXES.find((b) => looseValue.startsWith(b) && looseValue.length > b.length);
  return brand ? looseValue.slice(brand.length) : looseValue;
}

/** Forme(s) exacte(s) d'un produit : son slug et son nom, tels quels et
 *  sans prefixe de marque. Toujours fiables pour CE produit — un slug est
 *  unique par construction, donc jamais soumises a la verification
 *  d'ambiguite ci-dessous, meme si une forme DERIVEE d'un autre produit
 *  (voir fuzzyIdsFor) finit par leur ressembler. */
function exactIdsFor(product) {
  const ids = new Set();
  for (const source of [product.slug, slugify(product.name)]) {
    const full = collapse(source);
    ids.add(full);
    ids.add(stripBrandPrefix(full));
  }
  ids.delete('');
  return ids;
}

/** Formes obtenues en sautant un seul mot du slug ou du nom (un a la fois)
 *  — reconnait un fichier qui a saute un mot de liaison ("galaxy", "hot")
 *  sans avoir a lister ces mots a la main : n'importe quel token peut
 *  etre celui qu'on a saute. Contrairement a exactIdsFor, ces formes ne
 *  sont pas garanties uniques : "iphone-15-pro-max" sans "max" redonne
 *  "iphone15pro", qui est aussi la forme EXACTE de "iphone-15-pro". */
function fuzzyIdsFor(product) {
  const ids = new Set();
  for (const source of [product.slug, slugify(product.name)]) {
    const tokens = source.split('-').filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const without = [...tokens.slice(0, i), ...tokens.slice(i + 1)];
      if (without.length > 0) ids.add(collapse(without.join('-')));
    }
  }
  ids.delete('');
  return ids;
}

/** Associe chaque identifiant (exact OU derive, tous produits confondus) au
 *  ou aux produits qui le revendiquent. Sert uniquement a verifier qu'une
 *  forme DERIVEE est sans ambiguite : si elle coincide avec l'identite
 *  (exacte ou derivee) d'un autre produit, elle devient inutilisable —
 *  mieux vaut rater un fichier que l'attribuer au mauvais produit. */
function buildOwnersIndex(products) {
  const owners = new Map();
  const register = (id, productSlug) => {
    if (!owners.has(id)) owners.set(id, new Set());
    owners.get(id).add(productSlug);
  };
  for (const product of products) {
    for (const id of exactIdsFor(product)) register(id, product.slug);
    for (const id of fuzzyIdsFor(product)) register(id, product.slug);
  }
  return owners;
}

/** Reconnait « <identifiant> » (photo 1) ou « <identifiant> suivi d'un
 *  chiffre » (photo n, 1-9), une fois le nom de fichier normalise —
 *  renvoie l'index, ou null si aucun match sans ambiguite.
 *
 *  Deux niveaux : l'identite exacte du produit gagne toujours (une seule
 *  passe, sans verification globale) ; a defaut, une forme derivee ne
 *  compte que si aucun AUTRE produit — via sa forme exacte ou derivee —
 *  ne revendique la meme chaine. */
function matchIndex(normalizedBase, product, owners) {
  const collapsedBase = collapse(normalizedBase);
  const baseForms = [collapsedBase, stripBrandPrefix(collapsedBase)];
  const exactIds = exactIdsFor(product);
  const fuzzyIds = fuzzyIdsFor(product);

  const isUniqueGlobalOwner = (id) => {
    const claimants = owners.get(id);
    return Boolean(claimants && claimants.size === 1 && claimants.has(product.slug));
  };

  for (const base of baseForms) {
    if (exactIds.has(base)) return 1;
    const match = base.match(/^(.*?)([1-9])$/);
    if (match && exactIds.has(match[1])) return Number(match[2]);
  }

  for (const base of baseForms) {
    if (fuzzyIds.has(base) && isUniqueGlobalOwner(base)) return 1;
    const match = base.match(/^(.*?)([1-9])$/);
    if (match && fuzzyIds.has(match[1]) && isUniqueGlobalOwner(match[1])) return Number(match[2]);
  }
  return null;
}

async function main() {
  if (!PHOTOS_DIR) {
    console.error(`Dossier introuvable : public/photo/ (ou public/photos/)`);
    process.exit(1);
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Base introuvable : ${DB_PATH} — lancez d'abord "npm run seed".`);
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);
  const products = db.prepare('SELECT slug, name FROM products').all();
  const updateImages = db.prepare('UPDATE products SET images = ? WHERE slug = ?');

  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));
  const owners = buildOwnersIndex(products);

  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

  let matchedProducts = 0;
  let processedPhotos = 0;
  const unmatched = [];
  const usedFiles = new Set();

  for (const product of products) {
    // Chaque fichier reconnu pour ce produit, avec son index de photo (1-3).
    const found = [];
    for (const file of files) {
      const base = slugify(path.parse(file).name);
      const index = matchIndex(base, product, owners);
      if (index !== null) found.push({ file, index });
    }

    if (found.length === 0) {
      unmatched.push(product);
      continue;
    }

    found.sort((a, b) => a.index - b.index);
    matchedProducts += 1;
    console.log(`\n${product.slug} (${found.length} photo${found.length > 1 ? 's' : ''}) :`);

    const images = [];
    for (const { file, index } of found.slice(0, MAX_PHOTOS)) {
      const outName = `${product.slug}-${images.length + 1}.webp`;
      process.stdout.write(`  photo ${index} <- ${file} ... `);
      try {
        const buffer = fs.readFileSync(path.join(PHOTOS_DIR, file));
        await sharp(buffer)
          .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(PRODUCTS_DIR, outName));
        images.push(`/products/${outName}`);
        usedFiles.add(file);
        processedPhotos += 1;
        console.log('ok');
      } catch (error) {
        console.log('ECHEC -', error.message);
      }
    }

    if (images.length > 0) {
      updateImages.run(JSON.stringify(images), product.slug);
      // Compat : les chemins par defaut de ProductImage (<slug>.webp et
      // <slug>-thumb.webp) reprennent la premiere photo, pour tout code qui
      // ignorerait encore `images`.
      const firstBuffer = fs.readFileSync(path.join(PHOTOS_DIR, found[0].file));
      await sharp(firstBuffer)
        .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(PRODUCTS_DIR, `${product.slug}.webp`));
      await sharp(firstBuffer)
        .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(PRODUCTS_DIR, `${product.slug}-thumb.webp`));
    }
  }

  console.log(`\n${matchedProducts}/${products.length} produits associes (${processedPhotos} photos traitees).`);

  if (unmatched.length > 0) {
    console.log(`\n${unmatched.length} produits sans photo trouvee :`);
    for (const product of unmatched) console.log(`  - ${product.slug}  (${product.name})`);
  }

  const unusedFiles = files.filter((f) => !usedFiles.has(f));
  if (unusedFiles.length > 0) {
    console.log(`\n${unusedFiles.length} fichiers dans ${path.basename(PHOTOS_DIR)}/ non reconnus (nom sans correspondance) :`);
    for (const file of unusedFiles) console.log(`  - ${file}`);
  }
}

await main();
