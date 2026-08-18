import { create } from 'zustand';
import type { Product } from '../types';
import { api } from '../lib/api';

/* ==========================================================================
   Catalogue — servi par l'API (voir server/), plus par localStorage.

   Un produit ajouté, modifié ou supprimé depuis l'admin est maintenant
   persisté en base côté serveur : il est visible depuis n'importe quel
   navigateur, pas seulement celui qui a fait la modification. Le store ne
   garde plus qu'un cache local, rafraîchi après chaque écriture.
   ========================================================================== */

interface CatalogState {
  products: Product[];
  isLoaded: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (slug: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (slug: string) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  products: [],
  isLoaded: false,

  fetchProducts: async () => {
    const products = await api.get<Product[]>('/products');
    set({ products, isLoaded: true });
  },

  addProduct: async (product) => {
    const created = await api.post<Product>('/products', product);
    set({ products: [created, ...get().products] });
  },

  updateProduct: async (slug, patch) => {
    const updated = await api.put<Product>(`/products/${slug}`, patch);
    set({ products: get().products.map((product) => (product.slug === slug ? updated : product)) });
  },

  removeProduct: async (slug) => {
    await api.delete(`/products/${slug}`);
    set({ products: get().products.filter((product) => product.slug !== slug) });
  },
}));

// Chargement initial, une seule fois : les composants n'ont qu'à lire
// `products` de façon réactive, comme avant.
useCatalogStore.getState().fetchProducts();

/* ── Dérivations — fonctions pures, prennent le catalogue en argument ─────
   Mêmes règles que l'ancien data/products.ts, mais recalculées à la demande
   plutôt que figées au chargement du module : elles doivent réagir à chaque
   modification faite depuis l'admin. ────────────────────────────────────── */

export function productBySlugMap(products: Product[]): Map<string, Product> {
  return new Map(products.map((product) => [product.slug, product]));
}

export function computePriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...products.map((p) => p.price)),
    max: Math.max(...products.map((p) => p.price)),
  };
}

/** Produits en promotion, du plus fort au plus faible pourcentage. */
export function computeDealsOfTheDay(products: Product[]): Product[] {
  return products
    .filter((p) => p.originalPrice)
    .sort(
      (a, b) =>
        (b.originalPrice! - b.price) / b.originalPrice! - (a.originalPrice! - a.price) / a.originalPrice!,
    );
}

/** Meilleures ventes, d'après le volume écoulé. */
export function computeBestSellers(products: Product[]): Product[] {
  return [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
}

/** Nouveautés, du plus récent au plus ancien. */
export function computeNewArrivals(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
}
