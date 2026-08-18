import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORE } from '../constants/routes';

/* ==========================================================================
   Paramètres de la boutique — 100 % client, sans serveur.

   `constants/routes.ts` garde `STORE` comme valeurs par défaut. Toute page
   qui affiche une coordonnée de la boutique lit ce store, pas la constante
   statique, pour qu'un changement fait dans Paramètres se reflète partout —
   pied de page, fiche produit, tunnel de commande, JSON-LD SEO. Les
   modifications sont conservées dans localStorage, sur ce navigateur.
   ========================================================================== */

/**
 * `STORE` est déclaré `as const` (littéraux figés, utile pour l'inférence
 * ailleurs dans le code) : `typeof STORE` donnerait donc des champs comme
 * `name: "FallTech Store"` plutôt que `string`, rendant le formulaire de
 * l'admin impossible à typer. `{ -readonly [K in keyof T]: T[K] extends ... }`
 * élargit chaque littéral vers son type de base.
 */
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;
export type StoreSettings = { -readonly [K in keyof typeof STORE]: Widen<(typeof STORE)[K]> };

interface SettingsState {
  settings: StoreSettings;
  /** Toujours vrai ici — voir le même champ dans catalog.store.ts. */
  isLoaded: boolean;
  updateSettings: (patch: Partial<StoreSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: STORE,
      isLoaded: true,

      updateSettings: async (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
      },

      resetSettings: async () => {
        set({ settings: STORE });
      },
    }),
    {
      name: 'falltech-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
