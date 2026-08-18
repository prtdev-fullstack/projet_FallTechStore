import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { DURATION, EASE } from '../../constants/motion';
import { MAIN_NAV, ROUTES } from '../../constants/routes';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useCartStore, selectItemCount } from '../../store/cart.store';
import { useWishlistStore } from '../../store/wishlist.store';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useSettingsStore } from '../../store/settings.store';
import { formatPriceShort } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Logo } from '../brand/Logo';

/* ==========================================================================
   En-tête.

   Comportement au défilement, en trois temps :
     1. En haut de page, il est transparent et haut (72 px) : le héros respire.
     2. Dès le premier défilement, il devient vitré et se contracte à 60 px.
     3. En descendant au-delà de 160 px, il s'efface ; il revient dès qu'on
        remonte. Sur mobile, cela rend une pleine hauteur d'écran au contenu.
   ========================================================================== */

function CartButton() {
  const count = useCartStore(selectItemCount);
  const openCart = useUIStore((state) => state.openCart);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier, vide'}
      className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-elevated hover:text-ink lg:h-10 lg:w-10"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.spring }}
            className="tabular absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-solid px-1 text-[0.6875rem] font-bold text-accent-fg"
            aria-hidden="true"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function MobileNav() {
  const isOpen = useUIStore((state) => state.isMobileNavOpen);
  const close = useUIStore((state) => state.closeMobileNav);
  const settings = useSettingsStore((state) => state.settings);
  const location = useLocation();

  useLockBodyScroll(isOpen);
  useEffect(() => close(), [location.pathname, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          /* `key` sur l'enfant d'AnimatePresence : requis par Framer Motion pour
             suivre la présence et déclencher le démontage en fin de sortie.
             `pointerEvents: none` dans l'état de sortie : pendant les 200 ms de
             disparition, le panneau couvre encore l'écran ; sans cela, un tap
             pendant la fermeture atteint un lien de menu au lieu de la page. */
          key="mobile-nav"
          id="mobile-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: DURATION.fast }}
          className="fixed inset-0 top-[var(--header-height-compact)] z-40 flex flex-col bg-canvas lg:hidden"
        >
          <nav className="flex-1 overflow-y-auto px-5 py-8">
            <ul className="flex flex-col">
              {MAIN_NAV.map((item, index) => (
                <motion.li
                  key={item.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: DURATION.base, ease: EASE.outExpo }}
                  className="border-b border-border-subtle"
                >
                  <Link
                    to={item.to}
                    onClick={close}
                    className="flex min-h-[60px] items-center font-display text-h3 text-ink transition-colors duration-fast active:text-accent-text"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: DURATION.base, ease: EASE.outExpo }}
              className="mt-10 flex flex-col gap-2"
            >
              <Link
                to={ROUTES.account}
                onClick={close}
                className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-body text-ink-secondary transition-colors active:bg-elevated"
              >
                <User className="h-5 w-5" aria-hidden="true" />
                Mon compte
              </Link>
              <Link
                to={ROUTES.accountWishlist}
                onClick={close}
                className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-body text-ink-secondary transition-colors active:bg-elevated"
              >
                <Heart className="h-5 w-5" aria-hidden="true" />
                Mes favoris
              </Link>
            </motion.div>
          </nav>

          <div className="border-t border-border-subtle px-5 py-5 text-caption text-ink-tertiary">
            <p>{settings.address}</p>
            <p className="mt-1">{settings.phone}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const { isScrolled, isHidden } = useScrollDirection();
  const isMobile = useIsMobile();
  const setCommandOpen = useUIStore((state) => state.setCommandOpen);
  const isMobileNavOpen = useUIStore((state) => state.isMobileNavOpen);
  const toggleMobileNav = useUIStore((state) => state.toggleMobileNav);
  const wishlistCount = useWishlistStore((state) => state.slugs.length);
  const user = useAuthStore((state) => state.user);
  const settings = useSettingsStore((state) => state.settings);

  // Le menu mobile ouvert fige l'en-tête : le voir se dérober sous le menu
  // serait déroutant. Sur mobile, l'en-tête reste toujours visible pendant le
  // défilement — se dérober est un gain d'espace pensé pour le curseur/scroll
  // fin d'un grand écran, pas pour le pouce, qui a besoin d'un repère de
  // navigation constant du haut de page jusqu'au pied de page.
  const hidden = isHidden && !isMobileNavOpen && !isMobile;

  return (
    <>
      {/* Bandeau d'annonce — il défile avec la page, il ne colle pas. */}
      <div className="relative z-30 bg-elevated text-center">
        <p className="container-page py-2 text-caption text-ink-secondary">
          Livraison offerte dès{' '}
          <strong className="tabular text-ink">
            {formatPriceShort(settings.freeShippingThreshold)}
          </strong>{' '}
          · Garantie {settings.warrantyMonths} mois · Paiement à la livraison à Dakar
        </p>
      </div>

      <motion.header
        initial={false}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: DURATION.base, ease: EASE.outExpo }}
        className={cn(
          'sticky top-0 z-50 border-b transition-[background-color,border-color,height] duration-base ease-out-expo',
          isScrolled
            ? 'glass h-[var(--header-height-compact)] border-border'
            : 'h-header border-transparent bg-canvas',
        )}
      >
        <div className="container-page flex h-full items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {MAIN_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'relative inline-flex h-10 items-center rounded-md px-3.5 text-body-s font-medium',
                        'transition-colors duration-fast',
                        isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-x-3 bottom-1 h-px bg-accent"
                            transition={{ duration: DURATION.base, ease: EASE.outExpo }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-0.5">
            {/* Déclencheur de recherche : bouton complet sur grand écran,
                icône seule sur mobile pour économiser la largeur. */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden h-10 cursor-pointer items-center gap-2.5 rounded-md border border-border bg-elevated pl-3 pr-2 text-body-s text-ink-tertiary transition-colors duration-fast hover:border-border-strong hover:text-ink-secondary xl:flex"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Rechercher</span>
              <kbd className="ml-4 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.6875rem]">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="Rechercher"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-elevated hover:text-ink lg:h-10 lg:w-10 xl:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              to={ROUTES.accountWishlist}
              aria-label={
                wishlistCount > 0 ? `Favoris, ${wishlistCount} produit${wishlistCount > 1 ? 's' : ''}` : 'Favoris'
              }
              className="relative hidden h-10 w-10 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-elevated hover:text-ink md:flex"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
              )}
            </Link>

            <Link
              to={user ? ROUTES.account : ROUTES.login}
              aria-label={user ? 'Mon compte' : 'Se connecter'}
              className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-elevated hover:text-ink md:flex"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>

            <CartButton />

            <button
              type="button"
              onClick={toggleMobileNav}
              aria-label={isMobileNavOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-elevated hover:text-ink lg:hidden"
            >
              {isMobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <MobileNav />
    </>
  );
}
