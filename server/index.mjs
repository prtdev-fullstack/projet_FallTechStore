import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.mjs';
import { COOKIE_NAME, signAdminToken, requireAdmin } from './auth.mjs';

/* ==========================================================================
   API FallTech Store — Express + SQLite.

   Remplace les stores Zustand persistés en localStorage (catalog, settings,
   commandes, session admin) : les données vivent maintenant sur le serveur,
   partagées entre tous les navigateurs, et la connexion admin vérifie un
   vrai mot de passe haché plutôt que d'accepter n'importe quel e-mail.
   ========================================================================== */

// 4000 est un port très couramment squatté par d'autres projets Node en dev
// (Express par défaut, autres backends de démo) : un port moins générique
// réduit le risque de collision quand plusieurs projets tournent en parallèle.
//
// API_PORT (et non le générique PORT) : npm réexporte automatiquement tout
// `--port` passé en CLI vers `npm run dev` comme variable d'env PORT pour
// tous les processus enfants — y compris ce serveur, lancé via
// `concurrently`/`npm:server` dans le même `npm run dev`. Avec PORT, un
// simple `npm run dev -- --port 5177` (utilisé par l'environnement de
// prévisualisation pour éviter les collisions entre projets) faisait
// basculer l'API sur 5177 au lieu de 4310, cassant le proxy Vite qui cible
// 4310 en dur (voir vite.config.ts) — l'app entière tombait alors en erreur.
const PORT = process.env.API_PORT || 4310;
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

/* ── Photos importées depuis l'admin ──────────────────────────────────────
   Stockées sur le serveur (server/uploads/), pas dans public/ : ce dossier
   n'est copié dans dist/ qu'au moment du build, donc une photo importée
   après coup n'y apparaîtrait jamais. Express sert lui-même ce dossier —
   /uploads/<fichier> reste valable tant que le serveur tourne, indépendamment
   d'un build front. ──────────────────────────────────────────────────────── */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo bruts, avant compression
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Fichier non image refusé.'));
    cb(null, true);
  },
});

app.post('/api/uploads', requireAdmin, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  try {
    const filename = `${crypto.randomUUID()}.webp`;
    // Recadrée à une taille raisonnable et convertie en WebP : une photo de
    // téléphone (souvent 4-8 Mo) ne doit pas alourdir chaque fiche produit
    // d'autant — même traitement d'intention que scripts/fetch-images.mjs
    // pour le catalogue d'origine.
    await sharp(req.file.buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(UPLOADS_DIR, filename));

    res.status(201).json({ url: `/uploads/${filename}` });
  } catch {
    res.status(400).json({ error: "Ce fichier n'a pas pu être traité comme une image." });
  }
});

/* ── Sérialisation ─────────────────────────────────────────────────────── */

function rowToProduct(row) {
  return {
    slug: row.slug,
    name: row.name,
    brandId: row.brandId,
    category: row.category,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    tagline: row.tagline,
    description: row.description,
    highlights: JSON.parse(row.highlights),
    specs: JSON.parse(row.specs),
    variantGroups: JSON.parse(row.variantGroups),
    stock: row.stock,
    rating: row.rating,
    reviewCount: row.reviewCount,
    releasedAt: row.releasedAt,
    featured: Boolean(row.featured),
    sold: row.sold,
    images: JSON.parse(row.images),
    hasPhotos: Boolean(row.hasPhotos),
  };
}

function rowToOrder(row) {
  return {
    id: row.id,
    date: row.date,
    status: row.status,
    total: row.total,
    lines: JSON.parse(row.lines),
    customer: JSON.parse(row.customer),
  };
}

function rowToSettings(row) {
  const { id, ...settings } = row;
  return settings;
}

/* ── Admin : authentification ─────────────────────────────────────────── */

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'E-mail et mot de passe requis.' });

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const token = signAdminToken(admin.email);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ email: admin.email });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ email: req.admin.email });
});

/* ── Produits ──────────────────────────────────────────────────────────── */

app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  res.json(rows.map(rowToProduct));
});

app.post('/api/products', requireAdmin, (req, res) => {
  const p = req.body;
  if (!p?.slug || !p?.name) return res.status(400).json({ error: 'Nom et identifiant requis.' });

  const exists = db.prepare('SELECT 1 FROM products WHERE slug = ?').get(p.slug);
  if (exists) return res.status(409).json({ error: 'Un produit avec cet identifiant existe déjà.' });

  db.prepare(`
    INSERT INTO products (
      slug, name, brandId, category, price, originalPrice, tagline, description,
      highlights, specs, variantGroups, stock, rating, reviewCount, releasedAt,
      featured, sold, images, hasPhotos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    p.slug,
    p.name,
    p.brandId,
    p.category,
    p.price,
    p.originalPrice ?? null,
    p.tagline ?? '',
    p.description ?? '',
    JSON.stringify(p.highlights ?? []),
    JSON.stringify(p.specs ?? []),
    JSON.stringify(p.variantGroups ?? []),
    p.stock ?? 0,
    p.rating ?? 0,
    p.reviewCount ?? 0,
    p.releasedAt ?? new Date().toISOString().slice(0, 10),
    p.featured ? 1 : 0,
    p.sold ?? 0,
    JSON.stringify(p.images ?? []),
    p.hasPhotos ? 1 : 0,
  );

  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(p.slug);
  res.status(201).json(rowToProduct(row));
});

app.put('/api/products/:slug', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!existing) return res.status(404).json({ error: 'Produit introuvable.' });

  const merged = { ...rowToProduct(existing), ...req.body, slug: existing.slug };

  db.prepare(`
    UPDATE products SET
      name = ?, brandId = ?, category = ?, price = ?, originalPrice = ?, tagline = ?,
      description = ?, highlights = ?, specs = ?, variantGroups = ?, stock = ?, rating = ?,
      reviewCount = ?, releasedAt = ?, featured = ?, sold = ?, images = ?, hasPhotos = ?
    WHERE slug = ?
  `).run(
    merged.name,
    merged.brandId,
    merged.category,
    merged.price,
    merged.originalPrice ?? null,
    merged.tagline,
    merged.description,
    JSON.stringify(merged.highlights ?? []),
    JSON.stringify(merged.specs ?? []),
    JSON.stringify(merged.variantGroups ?? []),
    merged.stock,
    merged.rating,
    merged.reviewCount,
    merged.releasedAt,
    merged.featured ? 1 : 0,
    merged.sold ?? 0,
    JSON.stringify(merged.images ?? []),
    merged.hasPhotos ? 1 : 0,
    existing.slug,
  );

  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(existing.slug);
  res.json(rowToProduct(row));
});

app.delete('/api/products/:slug', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE slug = ?').run(req.params.slug);
  res.json({ ok: true });
});

/* ── Commandes ─────────────────────────────────────────────────────────── */

app.get('/api/orders', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY date DESC').all();
  res.json(rows.map(rowToOrder));
});

/** Historique d'un client — accessible sans session admin : c'est la page
 *  « Mes commandes » du compte client qui l'appelle, filtrée par e-mail. */
app.get('/api/orders/by-email/:email', (req, res) => {
  const rows = db
    .prepare("SELECT * FROM orders WHERE json_extract(customer, '$.email') = ? ORDER BY date DESC")
    .all(req.params.email);
  res.json(rows.map(rowToOrder));
});

app.post('/api/orders', (req, res) => {
  const { id, total, lines, customer } = req.body ?? {};
  if (!id || !total || !lines || !customer) {
    return res.status(400).json({ error: 'Commande incomplète.' });
  }

  const date = new Date().toISOString();
  db.prepare('INSERT INTO orders (id, date, status, total, lines, customer) VALUES (?, ?, ?, ?, ?, ?)').run(
    id,
    date,
    'en-preparation',
    total,
    JSON.stringify(lines),
    JSON.stringify(customer),
  );

  // La commande décrémente le stock vendu : c'est ce que l'admin lit ensuite
  // dans les alertes de stock et le tableau de bord.
  const decrementStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?), sold = sold + ? WHERE slug = ?');
  for (const line of lines) {
    decrementStock.run(line.quantity, line.quantity, line.slug);
  }

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.status(201).json(rowToOrder(row));
});

app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body ?? {};
  if (!['en-preparation', 'expediee', 'livree'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Commande introuvable.' });
  res.json(rowToOrder(row));
});

/* ── Paramètres ────────────────────────────────────────────────────────── */

app.get('/api/settings', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(rowToSettings(row));
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const s = req.body;
  db.prepare(`
    UPDATE settings SET
      name = ?, tagline = ?, city = ?, country = ?, address = ?, phone = ?, email = ?,
      hours = ?, freeShippingThreshold = ?, warrantyMonths = ?, returnDays = ?
    WHERE id = 1
  `).run(
    s.name,
    s.tagline,
    s.city,
    s.country,
    s.address,
    s.phone,
    s.email,
    s.hours,
    s.freeShippingThreshold,
    s.warrantyMonths,
    s.returnDays,
  );
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(rowToSettings(row));
});

/* Erreurs Multer (taille dépassée, type refusé par fileFilter) : elles
   surviennent dans le middleware d'upload lui-même, avant la route — sans
   ce gestionnaire, Express répondrait avec une page d'erreur HTML brute. */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image trop lourde (10 Mo maximum).' : err.message;
    return res.status(400).json({ error: message });
  }
  if (err && req.path === '/api/uploads') {
    return res.status(400).json({ error: err.message || 'Fichier refusé.' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`API FallTech Store sur http://localhost:${PORT}`);
});
