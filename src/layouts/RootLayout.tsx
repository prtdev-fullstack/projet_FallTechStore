import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE } from '../constants/motion';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
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
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
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
        {/* `mode="wait"` : la page sortante s'efface avant l'entrée de la
            suivante. Sans cela, les deux se superposent et la hauteur du
            document saute pendant la transition. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: DURATION.base, ease: EASE.outExpo }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <CartDrawer />
      <CommandPalette />
      <ToastViewport />
    </div>
  );
}
