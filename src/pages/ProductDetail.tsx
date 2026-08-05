import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Heart,
  MessageSquare,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { DURATION, EASE } from '../constants/motion';
import { ROUTES, STORE } from '../constants/routes';
import { brandById, categoryById } from '../data/catalog';
import { productBySlug, products } from '../data/products';
import { ratingBreakdown, reviewsForProduct } from '../data/reviews';
import { useIsTouch } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useCartStore, defaultVariants, priceForVariants } from '../store/cart.store';
import { useWishlistStore } from '../store/wishlist.store';
import { useUIStore } from '../store/ui.store';
import { discountPercent, formatDate, formatPrice, formatPriceShort, formatRating } from '../utils/format';
import { cn } from '../utils/cn';
import {
  Badge,
  Breadcrumb,
  Button,
  PriceTag,
  QuantityStepper,
  Rating,
  Tabs,
  toast,
} from '../components/ui';
import { ProductCard } from '../components/commerce/ProductCard';
import { ProductImage } from '../components/commerce/ProductImage';
import { Reveal, Stagger, StaggerItem } from '../components/motion';
import { Seo, breadcrumbJsonLd, productJsonLd } from '../components/seo/Seo';

/* ==========================================================================
   Galerie avec zoom à la loupe.

   Le zoom est désactivé au tactile : au doigt, il n'y a pas de position de
   curseur à suivre, et le pincement natif fait déjà le travail.
   ========================================================================== */

function Gallery({ product }: { product: ReturnType<typeof productBySlug.get> & object }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  const onMouseMove = (event: React.MouseEvent) => {
    if (isTouch || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setZoom(null)}
      className="relative aspect-square overflow-hidden rounded-xl border border-border bg-sunken"
    >
      <div
        className="absolute inset-0"
        style={
          zoom
            ? {
                transform: 'scale(1.9)',
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
                transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1)',
              }
            : { transform: 'scale(1)', transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)' }
        }
      >
        <ProductImage product={product} priority />
      </div>

      {!isTouch && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-caption text-ink-tertiary backdrop-blur-md">
          Survolez pour agrandir
        </p>
      )}
    </div>
  );
}

/* ========================================================================== */

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? productBySlug.get(slug) : undefined;

  const add = useCartStore((state) => state.add);
  const openCart = useUIStore((state) => state.openCart);
  const isFavorite = useWishlistStore((state) => (slug ? state.slugs.includes(slug) : false));
  const toggleFavorite = useWishlistStore((state) => state.toggle);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [variants, setVariants] = useState<Record<string, string>>(() =>
    product ? defaultVariants(product) : {},
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const similar = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.slug !== product.slug && item.category === product.category)
      .slice(0, 4);
  }, [product]);

  const productReviews = useMemo(() => (product ? reviewsForProduct(product.slug) : []), [product]);
  const breakdown = useMemo(() => (product ? ratingBreakdown(product.slug) : []), [product]);

  // Un slug inconnu renvoie vers le catalogue plutôt que d'afficher une page
  // d'erreur : l'utilisateur cherchait un produit, on lui en propose d'autres.
  if (!product) return <Navigate to={ROUTES.shop} replace />;

  const brand = brandById.get(product.brandId);
  const category = categoryById.get(product.category);
  const unitPrice = priceForVariants(product, variants);
  const originalUnitPrice = product.originalPrice
    ? product.originalPrice + (unitPrice - product.price)
    : undefined;
  const discount = originalUnitPrice ? discountPercent(originalUnitPrice, unitPrice) : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;

  const handleAdd = () => {
    add(product, variants, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
    toast.success('Ajouté au panier', {
      description: `${product.name} × ${quantity}`,
      thumbnail: (
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-sunken">
          <ProductImage product={product} size="thumb" />
        </span>
      ),
      action: { label: 'Voir le panier', onClick: openCart },
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    // `navigator.share` sur mobile, presse-papiers ailleurs. Le bouton
    // « Partager » de l'ancienne version n'était relié à rien.
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.tagline, url });
        return;
      } catch {
        /* Partage annulé par l'utilisateur : on ne signale rien. */
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success('Lien copié', { description: 'Vous pouvez le partager où vous voulez.' });
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* Le JSON-LD Product alimente les résultats enrichis de Google : prix,
          disponibilité et note s'affichent directement dans la page de
          résultats, ce qui change tout sur le taux de clic. */}
      <Seo
        title={`${product.name} — ${formatPriceShort(product.price)}`}
        description={`${product.tagline} ${product.description.slice(0, 110)}… Garantie ${STORE.warrantyMonths} mois, livraison 48 h au Sénégal.`}
        path={`/produit/${product.slug}`}
        type="product"
        jsonLd={[
          productJsonLd({
            name: product.name,
            slug: product.slug,
            description: product.description,
            brand: brand?.name ?? '',
            price: product.price,
            stock: product.stock,
            rating: product.rating,
            reviewCount: product.reviewCount,
          }),
          breadcrumbJsonLd([
            { label: 'Accueil', path: '/' },
            { label: 'Boutique', path: '/boutique' },
            { label: category?.name ?? '', path: `/boutique?categorie=${product.category}` },
            { label: product.name, path: `/produit/${product.slug}` },
          ]),
        ]}
      />

      <div className="container-page py-6 md:py-10">
        <Breadcrumb
          items={[
            { label: 'Accueil', to: ROUTES.home },
            { label: 'Boutique', to: ROUTES.shop },
            { label: category?.name ?? '', to: `${ROUTES.shop}?categorie=${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Galerie — collante sur grand écran pendant qu'on lit la fiche. */}
          <div className="lg:sticky lg:top-[calc(var(--header-height-compact)+2rem)] lg:self-start">
            <Gallery product={product} />
          </div>

          {/* Informations */}
          <div>
            {brand && <p className="text-overline uppercase text-ink-tertiary">{brand.name}</p>}
            <h1 className="mt-2 text-display-m text-ink">{product.name}</h1>
            <p className="mt-3 text-body-l text-ink-secondary">{product.tagline}</p>

            <a
              href="#avis"
              className="tap-safe mt-4 inline-flex min-h-[44px] items-center gap-2 rounded transition-colors hover:text-ink"
            >
              <Rating value={product.rating} count={product.reviewCount} size="md" />
            </a>

            {/* Prix */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <PriceTag price={unitPrice} originalPrice={originalUnitPrice} size="lg" />
              {discount > 0 && <Badge tone="promo">−{discount} %</Badge>}
            </div>
            <p className="mt-2 text-caption text-ink-tertiary">
              ou {formatPriceShort(Math.round(unitPrice / 3))} × 3 sans frais
            </p>

            {/* Variantes */}
            {product.variantGroups.map((group) => (
              <fieldset key={group.id} className="mt-8">
                <legend className="text-body-s font-semibold text-ink">
                  {group.label}
                  <span className="ml-2 font-normal text-ink-tertiary">
                    {group.options.find((option) => option.id === variants[group.id])?.label}
                  </span>
                </legend>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {group.options.map((option) => {
                    const isSelected = variants[group.id] === option.id;
                    const isColor = group.id === 'couleur' && option.swatch;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!option.inStock}
                        onClick={() => setVariants((current) => ({ ...current, [group.id]: option.id }))}
                        aria-pressed={isSelected}
                        aria-label={`${group.label} : ${option.label}${option.inStock ? '' : ' (indisponible)'}`}
                        title={option.label}
                        className={cn(
                          'relative cursor-pointer rounded-md border transition-all duration-fast ease-out-expo',
                          'disabled:cursor-not-allowed disabled:opacity-40',
                          isColor
                            ? 'h-11 w-11 p-1'
                            : 'h-11 px-4 text-body-s font-medium text-ink',
                          isSelected
                            ? 'border-accent shadow-glow'
                            : 'border-border hover:border-border-strong',
                        )}
                      >
                        {isColor ? (
                          <span
                            className="block h-full w-full rounded-[6px]"
                            style={{ backgroundColor: option.swatch }}
                            aria-hidden="true"
                          />
                        ) : (
                          <>
                            {option.label}
                            {option.priceDelta > 0 && (
                              <span className="tabular ml-1.5 text-caption text-ink-tertiary">
                                +{formatPriceShort(option.priceDelta)}
                              </span>
                            )}
                          </>
                        )}
                        {/* Barré diagonal : l'indisponibilité ne repose pas
                            uniquement sur l'opacité. */}
                        {!option.inStock && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-md bg-[linear-gradient(to_top_right,transparent_47%,rgb(var(--danger))_48%,rgb(var(--danger))_52%,transparent_53%)]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {/* Disponibilité */}
            <p className="mt-8 flex items-center gap-2 text-body-s">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-promo' : 'bg-success',
                )}
                aria-hidden="true"
              />
              {isOutOfStock ? (
                <span className="text-danger">Rupture de stock</span>
              ) : isLowStock ? (
                <span className="text-promo">Plus que {product.stock} en stock</span>
              ) : (
                <span className="text-success">En stock — expédié sous 24 h</span>
              )}
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={Math.max(1, Math.min(10, product.stock))}
              />
              <Button
                onClick={handleAdd}
                disabled={isOutOfStock}
                size="lg"
                className="min-w-[220px] flex-1"
                iconLeft={
                  justAdded ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {justAdded ? 'Ajouté au panier' : isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
              </Button>
            </div>

            <div className="mt-3 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  const added = toggleFavorite(product.slug);
                  toast.info(added ? 'Ajouté aux favoris' : 'Retiré des favoris', {
                    description: product.name,
                  });
                }}
                className="flex-1"
                iconLeft={
                  <Heart
                    className={cn('h-4 w-4', isFavorite && 'fill-danger text-danger')}
                    aria-hidden="true"
                  />
                }
              >
                {isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleShare}
                aria-label="Partager ce produit"
                iconLeft={<Share2 className="h-4 w-4" aria-hidden="true" />}
              >
                <span className="hidden sm:inline">Partager</span>
              </Button>
            </div>

            {/* Réassurance */}
            <ul className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
              {[
                { icon: ShieldCheck, text: `Garantie ${STORE.warrantyMonths} mois, prise en charge en boutique` },
                { icon: Truck, text: `Livraison offerte dès ${formatPriceShort(STORE.freeShippingThreshold)}` },
                { icon: RotateCcw, text: `Retour sous ${STORE.returnDays} jours, remboursement intégral` },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 py-3.5">
                  <item.icon className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <span className="text-body-s text-ink-secondary">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="container-page pb-20 pt-4">
        <Tabs
          tabs={[
            {
              id: 'description',
              label: 'Description',
              content: (
                <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
                  <div className="max-w-2xl">
                    <p className="text-body-l leading-relaxed text-ink-secondary">
                      {product.description}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {product.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                        <span className="text-body-s text-ink-secondary">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            },
            {
              id: 'specs',
              label: 'Caractéristiques',
              content: (
                <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                  {product.specs.map((group) => (
                    <div key={group.label}>
                      <h3 className="text-overline uppercase text-accent-text">{group.label}</h3>
                      <dl className="mt-4 divide-y divide-border-subtle border-t border-border-subtle">
                        {group.items.map((item) => (
                          <div key={item.label} className="flex justify-between gap-6 py-3">
                            <dt className="text-body-s text-ink-tertiary">{item.label}</dt>
                            <dd className="text-right font-mono text-caption text-ink">
                              {item.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'avis',
              label: 'Avis',
              badge: (
                <span className="tabular rounded-full bg-elevated px-2 py-0.5 text-caption text-ink-tertiary">
                  {productReviews.length}
                </span>
              ),
              content: (
                <div id="avis" className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
                  {/* Synthèse */}
                  <div className="lg:sticky lg:top-32 lg:self-start">
                    <p className="tabular font-display text-display-m text-ink">
                      {formatRating(product.rating)}
                      <span className="text-h3 text-ink-tertiary">/5</span>
                    </p>
                    <Rating value={product.rating} size="md" showValue={false} className="mt-2" />
                    <p className="mt-2 text-caption text-ink-tertiary">
                      {product.reviewCount} avis au total
                    </p>

                    <ul className="mt-6 flex flex-col gap-2">
                      {breakdown.map((row) => (
                        <li key={row.stars} className="flex items-center gap-3">
                          <span className="tabular w-6 text-caption text-ink-tertiary">
                            {row.stars}★
                          </span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                            <motion.span
                              className="block h-full rounded-full bg-promo"
                              initial={prefersReducedMotion ? false : { width: 0 }}
                              whileInView={{ width: `${row.percent}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
                            />
                          </span>
                          <span className="tabular w-9 text-right text-caption text-ink-tertiary">
                            {row.percent} %
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Liste */}
                  {productReviews.length === 0 ? (
                    <p className="flex items-center gap-3 text-body-s text-ink-secondary">
                      <MessageSquare className="h-5 w-5 text-ink-tertiary" aria-hidden="true" />
                      Aucun avis publié pour ce produit pour le moment.
                    </p>
                  ) : (
                    <Stagger className="flex flex-col gap-6" stagger={0.06}>
                      {productReviews.map((review) => (
                        <StaggerItem key={review.id}>
                          <article className="rounded-lg border border-border bg-elevated p-6">
                            <header className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-body-s font-semibold text-ink">
                                  {review.author}
                                  <span className="font-normal text-ink-tertiary">
                                    {' '}
                                    · {review.city}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-caption text-ink-tertiary">
                                  {formatDate(review.date)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {review.verified && (
                                  <Badge tone="success" icon={<Check className="h-3 w-3" aria-hidden="true" />}>
                                    Achat vérifié
                                  </Badge>
                                )}
                                <Rating value={review.rating} showValue={false} />
                              </div>
                            </header>
                            <h4 className="mt-4 text-body font-semibold text-ink">{review.title}</h4>
                            <p className="mt-2 text-body-s leading-relaxed text-ink-secondary">
                              {review.body}
                            </p>
                          </article>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Produits similaires */}
      {similar.length > 0 && (
        <section className="border-t border-border-subtle bg-surface py-20">
          <div className="container-page">
            <Reveal effect="up">
              <div className="mb-10 flex items-end justify-between gap-6">
                <h2 className="text-h2 text-ink">Vous aimerez aussi</h2>
                <Link
                  to={`${ROUTES.shop}?categorie=${product.category}`}
                  className="tap-safe shrink-0 text-body-s font-semibold text-accent-text underline-offset-4 hover:underline"
                >
                  Tout voir
                </Link>
              </div>
            </Reveal>

            <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
              {similar.map((item) => (
                <StaggerItem key={item.slug} className="h-full">
                  <ProductCard product={item} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Barre d'achat collante sur mobile — le prix et le bouton restent
          accessibles quelle que soit la position dans la page. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-caption text-ink-tertiary">{product.name}</p>
            <p className="tabular font-display text-body font-semibold text-ink">
              {formatPrice(unitPrice)}
            </p>
          </div>
          <Button onClick={handleAdd} disabled={isOutOfStock} size="lg" className="shrink-0">
            {justAdded ? <Check className="h-4 w-4" aria-hidden="true" /> : 'Ajouter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
