import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
}

/**
 * Favoris. Le cœur était présent trois fois dans l'interface d'origine sans
 * aucun état derrière : c'était la promesse la plus visible et la plus vide
 * du site.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      /** Renvoie le nouvel état, pour afficher la bonne notification. */
      toggle: (slug) => {
        const isFavorite = get().slugs.includes(slug);
        set((state) => ({
          slugs: isFavorite ? state.slugs.filter((s) => s !== slug) : [...state.slugs, slug],
        }));
        return !isFavorite;
      },
      remove: (slug) => set((state) => ({ slugs: state.slugs.filter((s) => s !== slug) })),
      clear: () => set({ slugs: [] }),
    }),
    { name: 'falltech-wishlist', storage: createJSONStorage(() => localStorage) },
  ),
);

export const selectIsFavorite = (slug: string) => (state: WishlistState) =>
  state.slugs.includes(slug);
