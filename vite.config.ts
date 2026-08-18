import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Port fixe : plusieurs projets tournent en dev sur cette même machine
    // (voir ~/.claude/launch.json), chacun sur un port qui lui est propre.
    // Sans cela, vite dérive silencieusement vers un autre port dès que
    // 5177 est occupé, ce qui cassait la prévisualisation.
    port: 5177,
    strictPort: true,
  },
  build: {
    /* Découpage manuel des dépendances.

       Sans cela, React, le routeur, Framer Motion et Lenis se retrouvent dans
       le même fichier que le code applicatif : la moindre correction de texte
       invalide 450 Ko de cache navigateur. Isolés, ils gardent leur empreinte
       entre deux déploiements et ne sont retéléchargés qu'en cas de mise à jour
       réelle de la bibliothèque. */
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion', 'lenis'],
          state: ['zustand'],
        },
      },
    },
    /* Le seuil par défaut (500 Ko) alerte sur des tailles qui ne sont plus
       problématiques une fois compressées. On l'aligne sur notre budget réel. */
    chunkSizeWarningLimit: 300,
  },
});
