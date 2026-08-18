import { create } from 'zustand';
import { api, ApiError } from '../lib/api';

/* ==========================================================================
   Session admin — vraie authentification, côté serveur.

   Contrairement au compte client (auth.store.ts), volontairement resté
   simulé, celle-ci vérifie un mot de passe haché en base (voir
   server/index.mjs) via un cookie httpOnly signé : l'état local
   (`isAuthenticated`) n'est qu'un reflet de ce que le serveur a validé, pas
   la source de vérité — d'où `checkSession()`, appelé au montage de
   l'admin pour restaurer une session déjà valide après un rechargement.
   ========================================================================== */

interface AdminAuthState {
  isAuthenticated: boolean;
  isChecking: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  isAuthenticated: false,
  isChecking: true,
  email: null,

  login: async (email, password) => {
    try {
      const result = await api.post<{ email: string }>('/admin/login', { email, password });
      set({ isAuthenticated: true, email: result.email, isChecking: false });
      return { ok: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Connexion impossible.';
      return { ok: false, error: message };
    }
  },

  logout: async () => {
    await api.post('/admin/logout').catch(() => {});
    set({ isAuthenticated: false, email: null });
  },

  checkSession: async () => {
    try {
      const result = await api.get<{ email: string }>('/admin/me');
      set({ isAuthenticated: true, email: result.email, isChecking: false });
    } catch {
      set({ isAuthenticated: false, email: null, isChecking: false });
    }
  },
}));
