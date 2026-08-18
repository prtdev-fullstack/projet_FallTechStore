import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ==========================================================================
   Session admin — simulée, 100 % client.

   ATTENTION : ceci n'est PAS une sécurité. Les identifiants ci-dessous sont
   dans le bundle JavaScript, donc lisibles par n'importe quel visiteur qui
   ouvre les outils de développement. C'est un garde-fou de démonstration,
   destiné à montrer le back-office dans un projet de portfolio — pas à
   protéger de vraies données.

   Une vraie boutique exige un serveur : mot de passe haché en base, session
   signée dans un cookie httpOnly, et toutes les écritures (produits,
   commandes, paramètres) validées côté serveur. Tant que le site est
   entièrement statique, cette protection reste cosmétique.
   ========================================================================== */

const ADMIN_EMAIL = 'admin@falltechstore.sn';
const ADMIN_PASSWORD = 'FallTech2026!';

interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,

      login: async (email, password) => {
        const matches =
          email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

        if (!matches) return { ok: false, error: 'Identifiants incorrects.' };

        set({ isAuthenticated: true, email: ADMIN_EMAIL });
        return { ok: true };
      },

      logout: async () => {
        set({ isAuthenticated: false, email: null });
      },
    }),
    {
      name: 'falltech-admin',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, email: state.email }),
    },
  ),
);
