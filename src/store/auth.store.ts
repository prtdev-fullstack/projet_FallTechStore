import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ==========================================================================
   Compte utilisateur — authentification simulée.

   Volontairement resté simulé, contrairement à la session admin (voir
   admin.store.ts) : c'est le compte client de démonstration, sans mot de
   passe réel. Les commandes ne vivent plus ici — voir orders.store.ts,
   qui les persiste côté serveur.
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
  login: (email: string) => void;
  register: (user: User) => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
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

      login: (email) =>
        set({ user: { ...demoUser, email: email || demoUser.email } }),

      register: (user) => set({ user }),

      logout: () => set({ user: null }),

      updateProfile: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
    }),
    { name: 'falltech-auth', storage: createJSONStorage(() => localStorage) },
  ),
);
