import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PackageSearch, SlidersHorizontal, X } from 'lucide-react';
import type { CategoryId } from '../types';
import { DURATION, EASE } from '../constants/motion';
import { brands, categories } from '../data/catalog';
import { priceRange, products } from '../data/products';
import { useDebounce } from '../hooks/useDebounce';
import { useIsMobile } from '../hooks/useMediaQuery';
import { formatPriceCompact, formatNumber } from '../utils/format';
import { cn } from '../utils/cn';
import {
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  Chip,
  Drawer,
  EmptyState,
  Input,
  Select,
} from '../components/ui';
import { ProductCard, ProductCardSkeleton } from '../components/commerce/ProductCard';
import { Stagger, StaggerItem } from '../components/motion';
import { Seo, breadcrumbJsonLd } from '../components/seo/Seo';

/* ==========================================================================
   Catalogue.

   L'état des filtres vit dans l'URL, pas dans le composant. Un filtrage est
   partageable, ajoutable aux favoris et survit à un rechargement — et le
   bouton « précédent » du navigateur défait un filtre au lieu de quitter la
   page.
   ========================================================================== */

const PAGE_SIZE = 18;

/** Grille dense façon marketplace : jusqu'à 6 colonnes sur grand écran. */
const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';

type SortId = 'pertinence' | 'nouveautes' | 'prix-croissant' | 'prix-decroissant' | 'note';

const SORT_OPTIONS: { value: SortId; label: string }[] = [
  { value: 'pertinence', label: 'Popularité' },
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'prix-croissant', label: 'Prix croissant' },
  { value: 'prix-decroissant', label: 'Prix décroissant' },
  { value: 'note', label: 'Mieux notés' },
];

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Lit un paramètre multi-valeurs : `?marque=apple,samsung`. */
function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  return raw ? raw.split(',').filter(Boolean) : [];
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isPending, setPending] = useState(false);

  const selectedCategories = readList(searchParams, 'categorie') as CategoryId[];
  const selectedBrands = readList(searchParams, 'marque');
  const onlyPromo = searchParams.get('promo') === '1';
  const onlyInStock = searchParams.get('stock') === '1';
  const maxPrice = Number(searchParams.get('prixMax')) || priceRange.max;
  const sort = (searchParams.get('tri') as SortId) ?? 'pertinence';
  const query = searchParams.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(query);
  const debouncedSearch = useDebounce(searchInput, 180);

  /* Synchronise la saisie vers l'URL, sans empiler d'entrées d'historique :
     `replace` évite qu'un retour arrière parcoure chaque lettre tapée. */
  useEffect(() => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, setSearchParams]);

  const updateParam = (key: string, value: string | null) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
      return next;
    });
  };

  const toggleInList = (key: string, value: string) => {
    const current = readList(searchParams, key);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateParam(key, next.join(','));
  };

  const clearAll = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  /* Clés primitives des sélections : `readList` recrée un tableau à chaque
     rendu, donc le passer en dépendance de `useMemo` relancerait le filtrage
     à chaque fois. Une chaîne se compare par valeur. */
  const categoryKey = selectedCategories.join(',');
  const brandKey = selectedBrands.join(',');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const activeCategories = categoryKey ? categoryKey.split(',') : [];
    const activeBrands = brandKey ? brandKey.split(',') : [];

    let result = products.filter((product) => {
      if (activeCategories.length && !activeCategories.includes(product.category)) return false;
      if (activeBrands.length && !activeBrands.includes(product.brandId)) return false;
      if (onlyPromo && !product.originalPrice) return false;
      if (onlyInStock && product.stock === 0) return false;
      if (product.price > maxPrice) return false;
      if (q) {
        const haystack = normalize(`${product.name} ${product.tagline} ${product.brandId}`);
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'nouveautes':
          return b.releasedAt.localeCompare(a.releasedAt);
        case 'prix-croissant':
          return a.price - b.price;
        case 'prix-decroissant':
          return b.price - a.price;
        case 'note':
          return b.rating - a.rating;
        default:
          // Popularité : les produits mis en avant d'abord, puis le volume d'avis.
          return (
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            b.reviewCount - a.reviewCount
          );
      }
    });

    return result;
  }, [query, categoryKey, brandKey, onlyPromo, onlyInStock, maxPrice, sort]);

  /* Le squelette n'apparaît qu'au changement de filtre : sur un catalogue
     local, le calcul est instantané, mais un retour visuel confirme que
     l'action a été prise en compte. */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setPending(true);
    const id = window.setTimeout(() => setPending(false), 220);
    return () => window.clearTimeout(id);
  }, [filtered]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilters = [
    ...selectedCategories.map((id) => ({
      key: `categorie-${id}`,
      label: categories.find((c) => c.id === id)?.name ?? id,
      clear: () => toggleInList('categorie', id),
    })),
    ...selectedBrands.map((id) => ({
      key: `marque-${id}`,
      label: brands.find((b) => b.id === id)?.name ?? id,
      clear: () => toggleInList('marque', id),
    })),
    ...(onlyPromo ? [{ key: 'promo', label: 'En promotion', clear: () => updateParam('promo', null) }] : []),
    ...(onlyInStock ? [{ key: 'stock', label: 'En stock', clear: () => updateParam('stock', null) }] : []),
    ...(maxPrice < priceRange.max
      ? [
          {
            key: 'prix',
            label: `Jusqu'à ${formatPriceCompact(maxPrice)}`,
            clear: () => updateParam('prixMax', null),
          },
        ]
      : []),
  ];

  /* ── Panneau de filtres, partagé entre la colonne et le drawer mobile ── */
  const filterPanel = (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="mb-3 text-overline uppercase text-ink-tertiary">Catégorie</legend>
        <div className="flex flex-col">
          {categories.map((category) => (
            <Checkbox
              key={category.id}
              label={category.name}
              count={products.filter((p) => p.category === category.id).length}
              checked={selectedCategories.includes(category.id)}
              onChange={() => toggleInList('categorie', category.id)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-overline uppercase text-ink-tertiary">Marque</legend>
        <div className="flex flex-col">
          {brands
            .filter((brand) => products.some((p) => p.brandId === brand.id))
            .map((brand) => (
              <Checkbox
                key={brand.id}
                label={brand.name}
                count={products.filter((p) => p.brandId === brand.id).length}
                checked={selectedBrands.includes(brand.id)}
                onChange={() => toggleInList('marque', brand.id)}
              />
            ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-overline uppercase text-ink-tertiary">Prix maximum</legend>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={5000}
          value={maxPrice}
          onChange={(event) => updateParam('prixMax', event.target.value)}
          aria-label="Prix maximum"
          aria-valuetext={formatPriceCompact(maxPrice)}
          className="h-11 w-full cursor-pointer accent-[rgb(var(--accent))]"
        />
        <div className="tabular flex justify-between text-caption text-ink-tertiary">
          <span>{formatPriceCompact(priceRange.min)}</span>
          <span className="font-semibold text-ink">{formatPriceCompact(maxPrice)}</span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-overline uppercase text-ink-tertiary">Disponibilité</legend>
        <Checkbox
          label="En stock uniquement"
          checked={onlyInStock}
          onChange={() => updateParam('stock', onlyInStock ? null : '1')}
        />
        <Checkbox
          label="En promotion"
          checked={onlyPromo}
          onChange={() => updateParam('promo', onlyPromo ? null : '1')}
        />
      </fieldset>
    </div>
  );

  return (
    <div className="container-page py-8 md:py-12">
      <Seo
        title="Boutique — smartphones, audio et accessoires"
        description="24 références disponibles à Dakar : smartphones Apple, Samsung, Google, Xiaomi, Tecno et Infinix, casques, écouteurs et accessoires. Garantis 24 mois, livrés en 48 h."
        path="/boutique"
        jsonLd={breadcrumbJsonLd([
          { label: 'Accueil', path: '/' },
          { label: 'Boutique', path: '/boutique' },
        ])}
      />
      <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Boutique' }]} />

      <header className="mt-3 flex items-baseline justify-between gap-4">
        <h1 className="text-h2 text-ink">Boutique</h1>
        <p className="tabular hidden text-caption text-ink-tertiary sm:block">
          {products.length} références · garanties 24 mois
        </p>
      </header>

      <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Colonne de filtres — masquée sous lg, remplacée par le drawer. */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height-compact)+1.5rem)] max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2">
            {filterPanel}
          </div>
        </aside>

        <div>
          {/* Barre d'outils */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher dans le catalogue"
              iconLeft={<PackageSearch className="h-4 w-4" aria-hidden="true" />}
              wrapperClassName="flex-1"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setFilterOpen(true)}
                className="lg:hidden"
                iconLeft={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
              >
                Filtres
                {activeFilters.length > 0 && (
                  <span className="tabular ml-1 rounded-full bg-accent-solid px-1.5 text-[0.6875rem] text-accent-fg">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
              <Select
                value={sort}
                onChange={(event) => updateParam('tri', event.target.value)}
                options={SORT_OPTIONS}
                aria-label="Trier les produits"
                wrapperClassName="min-w-[172px]"
              />
            </div>
          </div>

          {/* Filtres actifs */}
          <AnimatePresence initial={false}>
            {activeFilters.length > 0 && (
              <motion.div
                key="filtres-actifs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.outExpo }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-5">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={filter.clear}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-accent bg-accent/15 pl-3.5 pr-2.5 text-caption font-medium text-accent-text transition-colors duration-fast hover:bg-accent/25"
                    >
                      {filter.label}
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">Retirer ce filtre</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearAll}
                    className="ml-1 cursor-pointer text-caption text-ink-tertiary underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Tout effacer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compteur — annoncé aux lecteurs d'écran à chaque filtrage. */}
          <p aria-live="polite" className="tabular mt-6 text-caption text-ink-tertiary">
            {filtered.length === 0
              ? 'Aucun produit'
              : `${formatNumber(filtered.length)} produit${filtered.length > 1 ? 's' : ''}`}
            {query && ` pour « ${query} »`}
          </p>

          {/* Grille */}
          {isPending ? (
            <div className={cn('mt-4', GRID)}>
              {Array.from({ length: Math.min(PAGE_SIZE, 12) }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-7 w-7" aria-hidden="true" />}
              title="Aucun produit ne correspond"
              description="Essayez d'élargir votre recherche ou de retirer un filtre."
              action={<Button onClick={clearAll}>Effacer les filtres</Button>}
            />
          ) : (
            <>
              <Stagger className={cn('mt-4', GRID)} stagger={0.02} amount={0.05}>
                {visible.map((product, index) => (
                  <StaggerItem key={product.slug} className="h-full">
                    <ProductCard product={product} priority={index < 3} />
                  </StaggerItem>
                ))}
              </Stagger>

              {hasMore && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    Charger plus de produits
                  </Button>
                  <p className="tabular text-caption text-ink-tertiary">
                    {visible.length} sur {filtered.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filtres en drawer sur mobile */}
      {isMobile && (
        <Drawer
          open={isFilterOpen}
          onClose={() => setFilterOpen(false)}
          title="Filtres"
          side="left"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" block onClick={clearAll}>
                Effacer
              </Button>
              <Button block onClick={() => setFilterOpen(false)}>
                Voir {filtered.length} produit{filtered.length > 1 ? 's' : ''}
              </Button>
            </div>
          }
        >
          <div className="p-5">{filterPanel}</div>
        </Drawer>
      )}

      {/* Catégories mises en avant si aucun filtre — évite une page nue. */}
      {activeFilters.length === 0 && !query && (
        <section className="mt-20 border-t border-border-subtle pt-12">
          <h2 className="text-h3 text-ink">Parcourir par catégorie</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <Chip
                key={category.id}
                onClick={() => toggleInList('categorie', category.id)}
                count={products.filter((p) => p.category === category.id).length}
              >
                {category.name}
              </Chip>
            ))}
            <Chip onClick={() => updateParam('promo', '1')}>
              <Badge tone="promo">Promo</Badge>
            </Chip>
          </div>
        </section>
      )}
    </div>
  );
}
