import { create } from 'zustand';

interface UIState {
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

export const useUIStore = create<UIState>()((set) => ({
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
}));
