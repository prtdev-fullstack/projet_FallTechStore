import bcrypt from 'bcryptjs';
// @ts-expect-error — module JS sans déclarations de types, exécuté via tsx.
import { db } from './db.mjs';
import { products } from '../src/data/products';
import { STORE } from '../src/constants/routes';

/* ==========================================================================
   Amorçage de la base — idempotent, sans danger à relancer.

   Réutilise le catalogue et les coordonnées déjà écrits dans le frontend
   (data/products.ts, constants/routes.ts) plutôt que de les dupliquer : ce
   script tourne une seule fois, à la création de la base, pour lui donner un
   contenu de départ identique à ce que montrait la version 100 % client.
   ========================================================================== */

const ADMIN_EMAIL = 'admin@falltechstore.sn';
const ADMIN_PASSWORD = 'FallTech2026!';

function seedAdmin() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM admins').get() as { n: number };
  if (count.n > 0) return;

  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(ADMIN_EMAIL, hash);
  console.log(`Compte admin créé — e-mail : ${ADMIN_EMAIL} · mot de passe : ${ADMIN_PASSWORD}`);
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number };
  if (count.n > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (
      slug, name, brandId, category, price, originalPrice, tagline, description,
      highlights, specs, variantGroups, stock, rating, reviewCount, releasedAt,
      featured, sold, images, hasPhotos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const product of products) {
    insert.run(
      product.slug,
      product.name,
      product.brandId,
      product.category,
      product.price,
      product.originalPrice ?? null,
      product.tagline,
      product.description,
      JSON.stringify(product.highlights),
      JSON.stringify(product.specs),
      JSON.stringify(product.variantGroups),
      product.stock,
      product.rating,
      product.reviewCount,
      product.releasedAt,
      product.featured ? 1 : 0,
      product.sold ?? 0,
      JSON.stringify(product.images ?? []),
      product.hasPhotos ? 1 : 0,
    );
  }
  console.log(`${products.length} produits importés.`);
}

function seedSettings() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM settings').get() as { n: number };
  if (count.n > 0) return;

  db.prepare(`
    INSERT INTO settings (
      id, name, tagline, city, country, address, phone, email, hours,
      freeShippingThreshold, warrantyMonths, returnDays
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    STORE.name,
    STORE.tagline,
    STORE.city,
    STORE.country,
    STORE.address,
    STORE.phone,
    STORE.email,
    STORE.hours,
    STORE.freeShippingThreshold,
    STORE.warrantyMonths,
    STORE.returnDays,
  );
  console.log('Paramètres de la boutique initialisés.');
}

seedAdmin();
seedProducts();
seedSettings();
