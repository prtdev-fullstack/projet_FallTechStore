import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Order } from '../types';

/* ==========================================================================
   Compte utilisateur — authentification simulée.

   Aucun mot de passe n'est stocké ni vérifié : c'est une démonstration
   d'architecture, pas un système d'authentification. Le jour où une vraie API
   arrive, seule la fonction `login` change ; les composants, les routes et le
   garde de navigation restent identiques.
   ========================================================================== */

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
}

interface AuthState {
  user: User | null;
  orders: Order[];
  login: (email: string) => void;
  register: (user: User) => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  addOrder: (order: Order) => void;
}

const demoUser: User = {
  firstName: 'Awa',
  lastName: 'Diallo',
  email: 'awa.diallo@example.sn',
  phone: '+221 77 123 45 67',
  city: 'Dakar',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      orders: [],

      login: (email) =>
        set({ user: { ...demoUser, email: email || demoUser.email } }),

      register: (user) => set({ user }),

      logout: () => set({ user: null }),

      updateProfile: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    { name: 'falltech-auth', storage: createJSONStorage(() => localStorage) },
  ),
);
