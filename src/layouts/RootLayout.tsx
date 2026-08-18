import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DURATION, EASE } from '../constants/motion';
import { getLenis, useSmoothScroll } from '../hooks/useSmoothScroll';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useUIStore } from '../store/ui.store';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/commerce/CartDrawer';
import { CommandPalette } from '../components/commerce/CommandPalette';
import { ToastViewport } from '../components/ui/Toast';
import { ScrollProgress } from '../components/motion';

/**
 * Remonte en haut à chaque changement de route.
 *
 * React Router ne le fait pas : sans cela, on arrive en bas d'une fiche produit
 * après avoir cliqué depuis le bas d'un catalogue. `instant` volontairement —
 * animer ce déplacement donne l'impression que la page « tombe ».
 *
 * Lenis (défilement fluide) maintient sa propre position interne, indépendante
 * de `window.scrollY` : un simple `window.scrollTo` ne la met pas à jour, et sa
 * boucle `raf` la réimpose au prochain tick — on atterrit en pied de page. Il
 * faut passer par `lenis.scrollTo(0, { immediate: true })` quand Lenis est actif.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  return null;
}

export function RootLayout() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const closeAllOverlays = useUIStore((state) => state.closeAllOverlays);

  useSmoothScroll();

  // Une surcouche ouverte ne doit jamais survivre à un changement de page.
  useEffect(() => closeAllOverlays(), [location.pathname, closeAllOverlays]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="skip-link">
        Aller au contenu principal
      </a>

      <ScrollToTop />
      <ScrollProgress />
      <Header />

      <main id="contenu" className="flex-1">
        {/* Pas d'AnimatePresence ici : avec `mode="wait"`, le nouveau contenu
            n'apparaît qu'une fois l'animation de sortie de l'ancien terminée.
            Si cette confirmation de fin d'animation n'arrive jamais — onglet
            en arrière-plan, fenêtre non focalisée, tout ce qui met en pause
            requestAnimationFrame — la page reste bloquée sur l'ancien
            contenu indéfiniment, jusqu'à un rechargement complet. C'est
            exactement le bug rapporté : clic sur un produit, rien ne
            s'affiche tant qu'on n'actualise pas.

            Ici, le changement de `key` démonte l'ancienne page et monte la
            nouvelle immédiatement, via la réconciliation React normale,
            sans dépendre d'aucune animation. Le fondu d'entrée reste, mais
            il ne peut plus jamais bloquer l'affichage. */}
        <motion.div
          key={location.pathname}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.fast, ease: EASE.outExpo }}
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />

      <CartDrawer />
      <CommandPalette />
      <ToastViewport />
    </div>
  );
}
