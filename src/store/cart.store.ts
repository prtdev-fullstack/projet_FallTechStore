import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartLine, Product } from '../types';

/* ==========================================================================
   Panier.

   Deux différences de fond avec la version d'origine :

   1. On ne stocke que `{ slug, quantité, variantes }`, jamais l'objet produit
      entier. Auparavant, un prix modifié en base laissait un panier figé sur
      l'ancien tarif, et le localStorage grossissait avec les descriptions et
      les listes de caractéristiques.

   2. La lecture est protégée. Un JSON corrompu faisait planter toute
      l'application au démarrage : `persist` isole désormais l'erreur et repart
      sur un panier vide.
   ========================================================================== */

/** Clé de ligne : un même produit en deux couleurs = deux lignes distinctes. */
function lineKey(slug: string, variants: Record<string, string>): string {
  const suffix = Object.keys(variants)
    .sort()
    .map((group) => `${group}:${variants[group]}`)
    .join('|');
  return suffix ? `${slug}__${suffix}` : slug;
}

/** Prix effectif d'une combinaison de variantes. */
export function priceForVariants(product: Product, variants: Record<string, string>): number {
  return product.variantGroups.reduce((total, group) => {
    const selected = group.options.find((option) => option.id === variants[group.id]);
    return total + (selected?.priceDelta ?? 0);
  }, product.price);
}

/** Variantes par défaut : la première option disponible de chaque groupe. */
export function defaultVariants(product: Product): Record<string, string> {
  return product.variantGroups.reduce<Record<string, string>>((acc, group) => {
    const first = group.options.find((option) => option.inStock) ?? group.options[0];
    if (first) acc[group.id] = first.id;
    return acc;
  }, {});
}

/** Ligne enrichie du produit correspondant — la seule forme utilisée par l'interface. */
export interface ResolvedCartLine extends CartLine {
  product: Product;
  unitPrice: number;
  lineTotal: number;
  variantLabels: string[];
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, variants?: Record<string, string>, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (product, variants, quantity = 1) => {
        const resolved = variants ?? defaultVariants(product);
        const key = lineKey(product.slug, resolved);
        set((state) => {
          const existing = state.lines.find((line) => line.key === key);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.key === key
                  ? { ...line, quantity: Math.min(product.stock, line.quantity + quantity) }
                  : line,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              { key, slug: product.slug, quantity: Math.min(product.stock, quantity), variants: resolved },
            ],
          };
        });
      },

      remove: (key) => set((state) => ({ lines: state.lines.filter((line) => line.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.key !== key)
              : state.lines.map((line) => (line.key === key ? { ...line, quantity } : line)),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: 'falltech-cart',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      /* Le format a changé (objet produit complet → référence). Les paniers de
         l'ancienne version ne sont pas récupérables : on repart proprement. */
      migrate: () => ({ lines: [] }),
    },
  ),
);

/* ── Sélecteurs ──────────────────────────────────────────────────────────
   Exposés en fonctions pures et non en méthodes du store : un composant qui
   n'a besoin que du nombre d'articles ne se rend plus quand une quantité change
   sans modifier le total. C'était le défaut du Context d'origine, qui
   redessinait tout l'arbre à chaque mutation.
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Prend le catalogue en argument (plutôt qu'un import statique) : les prix et
 * le stock viennent désormais du catalogue éditable (`catalog.store`), et
 * doivent donc pouvoir varier d'un appel à l'autre — une modification faite
 * depuis l'admin doit se refléter dans le panier sans rechargement.
 */
export function resolveLines(lines: CartLine[], products: Product[]): ResolvedCartLine[] {
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  return lines.flatMap((line) => {
    const product = productBySlug.get(line.slug);
    // Un produit retiré du catalogue ne doit pas faire planter le panier.
    if (!product) return [];
    const unitPrice = priceForVariants(product, line.variants);
    const variantLabels = product.variantGroups
      .map((group) => group.options.find((option) => option.id === line.variants[group.id])?.label)
      .filter((label): label is string => Boolean(label));

    return [{ ...line, product, unitPrice, lineTotal: unitPrice * line.quantity, variantLabels }];
  });
}

export const selectItemCount = (state: CartState): number =>
  state.lines.reduce((total, line) => total + line.quantity, 0);

/** Vrai si ce produit, dans cette combinaison, est déjà au panier. */
export const selectHasLine =
  (slug: string, variants: Record<string, string>) =>
  (state: CartState): boolean =>
    state.lines.some((line) => line.key === lineKey(slug, variants));
