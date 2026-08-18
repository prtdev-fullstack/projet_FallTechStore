import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '../types';
import { products as catalogSeed } from '../data/products';

/* ==========================================================================
   Catalogue — 100 % client, sans serveur.

   Le catalogue de référence vit dans data/products.ts (photos comprises) et
   sert de graine. Les ajouts, modifications et suppressions faits depuis
   l'admin sont conservés dans localStorage, sur le navigateur qui les a
   faits : c'est une démonstration, pas une vraie boutique multi-postes.

   `version` : toute évolution du catalogue livrée dans le code (nouveau
   produit, nouvelles photos) doit gagner sur la copie en cache d'un visiteur
   déjà venu. On incrémente donc ce numéro à chaque modification de
   data/products.ts — l'ancienne copie est alors ignorée et remplacée par la
   nouvelle graine.
   ========================================================================== */

const CATALOG_VERSION = 3;

interface CatalogState {
  products: Product[];
  /** Toujours vrai ici : conservé pour que les pages gardent le même contrat
   *  qu'à l'époque du chargement réseau (écran de chargement, gardes). */
  isLoaded: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (slug: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (slug: string) => Promise<void>;
  resetCatalog: () => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: catalogSeed,
      isLoaded: true,

      /* Les trois écritures restent `async` : les pages de l'admin les
         `await`ent déjà et gèrent un état d'envoi. Les garder asynchrones
         évite de réécrire ces pages, et laisse la porte ouverte à un vrai
         serveur plus tard sans nouvelle refonte. */
      addProduct: async (product) => {
        set({ products: [product, ...get().products] });
      },

      updateProduct: async (slug, patch) => {
        set({
          products: get().products.map((product) =>
            product.slug === slug ? { ...product, ...patch } : product,
          ),
        });
      },

      removeProduct: async (slug) => {
        set({ products: get().products.filter((product) => product.slug !== slug) });
      },

      resetCatalog: () => set({ products: catalogSeed }),
    }),
    {
      name: 'falltech-catalog',
      storage: createJSONStorage(() => localStorage),
      version: CATALOG_VERSION,
      partialize: (state) => ({ products: state.products }),
      /* Version antérieure en cache : on repart de la graine livrée avec le
         code plutôt que de tenter de fusionner deux catalogues. */
      migrate: () => ({ products: catalogSeed }),
    },
  ),
);

/* ── Dérivations — fonctions pures, prennent le catalogue en argument ─────
   Recalculées à la demande plutôt que figées au chargement du module :
   elles doivent réagir à chaque modification faite depuis l'admin. ─────── */

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
