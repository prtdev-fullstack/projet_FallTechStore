import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/* ==========================================================================
   Base de données — SQLite embarqué (module natif `node:sqlite`, Node 22+).

   Pas de serveur de base de données à installer ni de driver natif à
   compiler (contrairement à better-sqlite3, qui exige node-gyp) : un seul
   fichier, falltech.sqlite, à côté de ce module. C'est exactement le niveau
   d'infrastructure qu'un « petit backend » de démonstration justifie.
   ========================================================================== */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'falltech.sqlite');

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brandId TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    originalPrice INTEGER,
    tagline TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    highlights TEXT NOT NULL DEFAULT '[]',
    specs TEXT NOT NULL DEFAULT '[]',
    variantGroups TEXT NOT NULL DEFAULT '[]',
    stock INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    reviewCount INTEGER NOT NULL DEFAULT 0,
    releasedAt TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    images TEXT NOT NULL DEFAULT '[]',
    hasPhotos INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'en-preparation',
    total INTEGER NOT NULL,
    lines TEXT NOT NULL,
    customer TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    hours TEXT NOT NULL,
    freeShippingThreshold INTEGER NOT NULL,
    warrantyMonths INTEGER NOT NULL,
    returnDays INTEGER NOT NULL
  );
`);

/* ── Migration : imageUrl (une photo) → images (jusqu'à plusieurs) ────────
   `CREATE TABLE IF NOT EXISTS` ne touche pas une table déjà créée avec
   l'ancien schéma — sans ce bloc, une base existante garderait `imageUrl`
   et n'aurait jamais `images`. Idempotent : ne fait rien si déjà migré. */
const columns = db.prepare('PRAGMA table_info(products)').all().map((c) => c.name);
if (!columns.includes('images')) {
  db.exec("ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]'");
}
if (columns.includes('imageUrl')) {
  // Reprend l'ancienne photo unique, si elle existe, comme première image.
  db.exec(`
    UPDATE products
    SET images = json_array(imageUrl)
    WHERE imageUrl IS NOT NULL AND images = '[]'
  `);
  db.exec('ALTER TABLE products DROP COLUMN imageUrl');
}
