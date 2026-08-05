import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ArrowRight, CornerDownLeft, Search, TrendingUp } from 'lucide-react';
import { DURATION, EASE } from '../../constants/motion';
import { MAIN_NAV, ROUTES } from '../../constants/routes';
import { brandById } from '../../data/catalog';
import { products } from '../../data/products';
import { useDebounce } from '../../hooks/useDebounce';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useUIStore } from '../../store/ui.store';
import { formatPriceShort } from '../../utils/format';
import { cn } from '../../utils/cn';
import { ProductImage } from './ProductImage';

/* ==========================================================================
   Palette de commandes (⌘K / Ctrl+K).

   Elle remplace la barre de recherche de l'ancien en-tête, qui était un
   `<input>` sans `value`, sans `onChange` et sans résultat : la première chose
   qu'un visiteur essayait, et la première déception.
   ========================================================================== */

/** Retire les accents pour que « ecouteur » trouve « écouteurs ». */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

interface Result {
  type: 'product' | 'page';
  id: string;
  label: string;
  sublabel?: string;
  to: string;
  price?: number;
  productSlug?: string;
}

const searchIndex = products.map((product) => ({
  product,
  haystack: normalize(
    [product.name, brandById.get(product.brandId)?.name ?? '', product.tagline, product.category].join(' '),
  ),
}));

export function CommandPalette() {
  const isOpen = useUIStore((state) => state.isCommandOpen);
  const setOpen = useUIStore((state) => state.setCommandOpen);
  const toggle = useUIStore((state) => state.toggleCommand);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 120);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();

  useLockBodyScroll(isOpen);

  /* Raccourci global. `metaKey` pour macOS, `ctrlKey` pour Windows et Linux. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggle, setOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const results = useMemo<Result[]>(() => {
    const q = normalize(debouncedQuery.trim());

    if (!q) {
      // Sans saisie, on propose les meilleures ventes plutôt qu'un écran vide.
      return products
        .filter((product) => product.featured)
        .slice(0, 5)
        .map((product) => ({
          type: 'product',
          id: product.slug,
          label: product.name,
          sublabel: brandById.get(product.brandId)?.name,
          to: ROUTES.product(product.slug),
          price: product.price,
          productSlug: product.slug,
        }));
    }

    const productMatches: Result[] = searchIndex
      .filter((entry) => entry.haystack.includes(q))
      .slice(0, 6)
      .map(({ product }) => ({
        type: 'product',
        id: product.slug,
        label: product.name,
        sublabel: brandById.get(product.brandId)?.name,
        to: ROUTES.product(product.slug),
        price: product.price,
        productSlug: product.slug,
      }));

    const pageMatches: Result[] = MAIN_NAV.filter((item) => normalize(item.label).includes(q)).map(
      (item) => ({ type: 'page', id: item.to, label: item.label, to: item.to }),
    );

    return [...productMatches, ...pageMatches];
  }, [debouncedQuery]);

  useEffect(() => setActiveIndex(0), [debouncedQuery]);

  const go = (result: Result) => {
    setOpen(false);
    navigate(result.to);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(1, results.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % Math.max(1, results.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) go(target);
      else if (query.trim()) {
        setOpen(false);
        navigate(`${ROUTES.shop}?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  /* Garde l'élément actif visible pendant la navigation au clavier. */
  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  /* Chaque enfant d'AnimatePresence porte sa `key`, et l'état de sortie coupe
     `pointerEvents` pour que la palette n'intercepte plus rien pendant son
     animation de fermeture. */
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="command-scrim"
            className="fixed inset-0 z-[120] bg-[rgb(var(--overlay))] backdrop-blur-md"
            style={{ opacity: 'var(--overlay-opacity)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: DURATION.fast }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <motion.div
            key="command-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Rechercher dans la boutique"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0, pointerEvents: 'none' } : { opacity: 0, y: -12, scale: 0.98, pointerEvents: 'none' }}
            transition={{ duration: DURATION.base, ease: EASE.outExpo }}
            className="fixed inset-x-4 top-[12vh] z-[130] mx-auto flex max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface/95 shadow-3 backdrop-blur-2xl"
          >
              <div className="flex items-center gap-3 border-b border-border-subtle px-5">
                <Search className="h-5 w-5 shrink-0 text-ink-tertiary" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Rechercher un produit, une marque…"
                  aria-label="Rechercher"
                  aria-controls="command-results"
                  className="h-16 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary [&::-webkit-search-cancel-button]:hidden"
                />
                <kbd className="hidden shrink-0 rounded border border-border bg-elevated px-2 py-1 font-mono text-caption text-ink-tertiary sm:block">
                  Échap
                </kbd>
              </div>

              {results.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-body-s text-ink-secondary">
                    Aucun résultat pour «&nbsp;{query}&nbsp;»
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate(ROUTES.shop);
                    }}
                    className="mt-3 cursor-pointer text-caption font-semibold text-accent-text underline-offset-4 hover:underline"
                  >
                    Parcourir tout le catalogue
                  </button>
                </div>
              ) : (
                <>
                  <p className="flex items-center gap-2 px-5 pb-2 pt-4 text-overline uppercase text-ink-tertiary">
                    {debouncedQuery.trim() ? (
                      `${results.length} résultat${results.length > 1 ? 's' : ''}`
                    ) : (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        Les plus demandés
                      </>
                    )}
                  </p>

                  <ul
                    id="command-results"
                    ref={listRef}
                    role="listbox"
                    className="max-h-[46vh] overflow-y-auto overscroll-contain px-2 pb-3"
                  >
                    {results.map((result, index) => {
                      const product = result.productSlug
                        ? products.find((p) => p.slug === result.productSlug)
                        : undefined;
                      const isActive = index === activeIndex;

                      return (
                        <li key={result.id} role="option" aria-selected={isActive}>
                          <button
                            type="button"
                            onClick={() => go(result)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={cn(
                              'flex w-full cursor-pointer items-center gap-4 rounded-md px-3 py-2.5 text-left',
                              'transition-colors duration-instant',
                              isActive ? 'bg-elevated' : 'hover:bg-elevated/60',
                            )}
                          >
                            {product ? (
                              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-sunken">
                                <ProductImage product={product} size="thumb" />
                              </span>
                            ) : (
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-sunken text-ink-tertiary">
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-body-s font-semibold text-ink">
                                {result.label}
                              </span>
                              {result.sublabel && (
                                <span className="block text-caption text-ink-tertiary">
                                  {result.sublabel}
                                </span>
                              )}
                            </span>

                            {result.price !== undefined && (
                              <span className="tabular shrink-0 text-caption font-semibold text-ink-secondary">
                                {formatPriceShort(result.price)}
                              </span>
                            )}

                            {isActive && (
                              <CornerDownLeft
                                className="h-4 w-4 shrink-0 text-ink-tertiary"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <div className="hidden items-center gap-4 border-t border-border-subtle px-5 py-3 text-caption text-ink-tertiary sm:flex">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono">↑</kbd>
                  <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono">↓</kbd>
                  naviguer
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono">↵</kbd>
                  ouvrir
                </span>
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
