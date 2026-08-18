import { create } from 'zustand';
import { STORE } from '../constants/routes';
import { api } from '../lib/api';

/* ==========================================================================
   Paramètres de la boutique — servis par l'API, plus par localStorage.

   `constants/routes.ts` garde `STORE` comme valeur de repli, affichée le
   temps du tout premier chargement (avant que la réponse du serveur
   n'arrive) et comme graine pour server/seed.ts. Toute page qui affiche une
   coordonnée de la boutique lit ce store, pas la constante statique, pour
   qu'un changement fait dans Paramètres se reflète partout — pied de page,
   fiche produit, tunnel de commande, JSON-LD SEO.
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
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (patch: Partial<StoreSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: STORE,
  isLoaded: false,

  fetchSettings: async () => {
    const settings = await api.get<StoreSettings>('/settings');
    set({ settings, isLoaded: true });
  },

  updateSettings: async (patch) => {
    const current = useSettingsStore.getState().settings;
    const settings = await api.put<StoreSettings>('/settings', { ...current, ...patch });
    set({ settings });
  },

  resetSettings: async () => {
    const settings = await api.put<StoreSettings>('/settings', STORE);
    set({ settings });
  },
}));

useSettingsStore.getState().fetchSettings();
