import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'falltech-ui';

interface UIState {
  /* Thème */
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  /* Surcouches — un seul endroit pour savoir ce qui est ouvert */
  isCartOpen: boolean;
  isCommandOpen: boolean;
  isMobileNavOpen: boolean;
  isFilterOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCommand: () => void;
  setCommandOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  setFilterOpen: (open: boolean) => void;
  closeAllOverlays: () => void;
}

/**
 * Applique le thème au <html> — seul endroit qui touche au DOM.
 *
 * Les transitions sont suspendues le temps du basculement, pour deux raisons :
 *   1. Chrome n'interpole pas correctement une couleur pilotée par une custom
 *      property lorsqu'elle est prise dans un `transition: all` : l'élément
 *      reste bloqué sur l'ancienne couleur (constaté sur l'en-tête vitré).
 *   2. Un fondu de 300 ms sur toute la page à chaque changement de thème est
 *      lent et brouillon — les références du secteur basculent instantanément.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.setAttribute('data-theme', theme);

  // Deux frames : la première applique les nouvelles valeurs sans transition,
  // la seconde réactive les transitions pour les interactions suivantes.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove('theme-switching'));
  });
}

/**
 * Aligne le store sur ce que le script anti-FOUC de index.html a déjà décidé.
 * Sans cela, un visiteur dont le système est en clair et qui n'a jamais choisi
 * de thème verrait la page en clair alors que le store croit être en sombre —
 * le premier clic sur le sélecteur ne ferait alors rien.
 * À appeler une seule fois, avant le rendu.
 */
export function initTheme(): void {
  const hasPreference = localStorage.getItem(THEME_STORAGE_KEY) !== null;
  if (hasPreference) return;

  const domTheme = document.documentElement.getAttribute('data-theme');
  if (domTheme === 'light' || domTheme === 'dark') {
    useUIStore.setState({ theme: domTheme });
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),

      isCartOpen: false,
      isCommandOpen: false,
      isMobileNavOpen: false,
      isFilterOpen: false,

      openCart: () => set({ isCartOpen: true, isMobileNavOpen: false }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCommand: () => set((s) => ({ isCommandOpen: !s.isCommandOpen })),
      setCommandOpen: (open) => set({ isCommandOpen: open }),
      toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
      setFilterOpen: (open) => set({ isFilterOpen: open }),
      closeAllOverlays: () =>
        set({ isCartOpen: false, isCommandOpen: false, isMobileNavOpen: false, isFilterOpen: false }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      /* On ne persiste QUE le thème : rouvrir le site avec un panneau
         ouvert serait déroutant. */
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
