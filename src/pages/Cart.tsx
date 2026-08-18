import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { DURATION, EASE } from '../constants/motion';
import { ROUTES } from '../constants/routes';
import { useCartStore, resolveLines } from '../store/cart.store';
import { useCatalogStore } from '../store/catalog.store';
import { useSettingsStore } from '../store/settings.store';
import { formatPrice, formatPriceShort } from '../utils/format';
import { Breadcrumb, Button, EmptyState, QuantityStepper } from '../components/ui';
import { ProductImage } from '../components/commerce/ProductImage';
import { Reveal, TextReveal } from '../components/motion';
import { Seo } from '../components/seo/Seo';

export default function Cart() {
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const catalog = useCatalogStore((state) => state.products);
  const settings = useSettingsStore((state) => state.settings);

  const resolved = resolveLines(lines, catalog);
  const subtotal = resolved.reduce((total, line) => total + line.lineTotal, 0);
  const isFreeShipping = subtotal >= settings.freeShippingThreshold;
  const missing = Math.max(0, settings.freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / settings.freeShippingThreshold) * 100);
  const itemCount = resolved.reduce((total, line) => total + line.quantity, 0);

  /* Rendu dans les deux branches : sans cela, un panier vide conservait le titre
     et l'URL canonique de la page précédente. */
  const seo = (
    <Seo
      title="Mon panier"
      description="Vérifiez votre panier avant de commander."
      path="/panier"
      noIndex
    />
  );

  if (resolved.length === 0) {
    return (
      <div className="container-page py-8 md:py-12">
        {seo}
        <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'Panier' }]} />
        <EmptyState
          titleAs="h1"
          icon={<ShoppingBag className="h-7 w-7" aria-hidden="true" />}
          title="Votre panier est vide"
          description="Parcourez le catalogue : 24 références disponibles, toutes garanties 24 mois et livrées en 48 h."
          action={
            <Button to={ROUTES.shop} size="lg">
              Découvrir la boutique
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      {seo}
      <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'Panier' }]} />

      <header className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-display-l text-ink">
          <TextReveal text="Mon panier" immediate />
        </h1>
        <p className="tabular text-body-s text-ink-tertiary">
          {itemCount} article{itemCount > 1 ? 's' : ''}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* Lignes */}
        <div>
          <ul className="divide-y divide-border-subtle border-y border-border-subtle">
            <AnimatePresence initial={false}>
              {resolved.map((line) => (
                <motion.li
                  key={line.key}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE.outExpo }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 py-6 sm:gap-6">
                    <Link
                      to={ROUTES.product(line.slug)}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-sunken sm:h-32 sm:w-32"
                    >
                      <ProductImage product={line.product} size="thumb" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            to={ROUTES.product(line.slug)}
                            className="text-h4 text-ink transition-colors duration-fast hover:text-accent-text"
                          >
                            {line.product.name}
                          </Link>
                          {line.variantLabels.length > 0 && (
                            <p className="mt-1 text-caption text-ink-tertiary">
                              {line.variantLabels.join(' · ')}
                            </p>
                          )}
                          <p className="tabular mt-1 text-caption text-ink-tertiary">
                            {formatPriceShort(line.unitPrice)} l'unité
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(line.key)}
                          aria-label={`Retirer ${line.product.name} du panier`}
                          className="-m-2 h-11 w-11 shrink-0 cursor-pointer rounded-md p-2 text-ink-tertiary transition-colors duration-fast hover:bg-elevated hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                        <QuantityStepper
                          value={line.quantity}
                          max={line.product.stock}
                          onChange={(next) => setQuantity(line.key, next)}
                        />
                        <motion.span
                          key={line.lineTotal}
                          initial={{ opacity: 0.5, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: DURATION.fast, ease: EASE.outExpo }}
                          className="tabular font-display text-h4 text-ink"
                        >
                          {formatPriceShort(line.lineTotal)}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <Link
            to={ROUTES.shop}
            className="mt-8 inline-flex items-center gap-2 text-body-s font-semibold text-ink-secondary transition-colors duration-fast hover:text-accent-text"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Continuer mes achats
          </Link>
        </div>

        {/* Récapitulatif — collant sur grand écran. */}
        <aside className="lg:sticky lg:top-[calc(var(--header-height-compact)+2rem)] lg:self-start">
          <Reveal effect="up">
            <div className="rounded-xl border border-border bg-elevated p-6">
              <h2 className="text-h4 text-ink">Récapitulatif</h2>

              <div className="mt-5 rounded-md border border-border-subtle bg-surface p-4">
                {isFreeShipping ? (
                  <p className="flex items-center gap-2 text-caption font-semibold text-success">
                    <Truck className="h-4 w-4" aria-hidden="true" />
                    Livraison offerte
                  </p>
                ) : (
                  <p className="text-caption text-ink-secondary">
                    Plus que <strong className="tabular text-ink">{formatPriceShort(missing)}</strong>{' '}
                    pour la livraison offerte
                  </p>
                )}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <motion.div
                    className="h-full rounded-full bg-aurora"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
                  />
                </div>
              </div>

              <dl className="mt-6 flex flex-col gap-3">
                <div className="flex justify-between text-body-s">
                  <dt className="text-ink-secondary">Sous-total</dt>
                  <dd className="tabular text-ink">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-body-s">
                  <dt className="text-ink-secondary">Livraison</dt>
                  <dd className={isFreeShipping ? 'text-success' : 'text-ink-tertiary'}>
                    {isFreeShipping ? 'Offerte' : 'Calculée à l’étape suivante'}
                  </dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-border-subtle pt-4">
                  <dt className="text-body font-semibold text-ink">Total</dt>
                  <dd className="tabular font-display text-h3 text-ink">{formatPrice(subtotal)}</dd>
                </div>
              </dl>

              <Button to={ROUTES.checkout} size="lg" block className="mt-6">
                Passer commande
              </Button>

              <p className="mt-4 flex items-center justify-center gap-2 text-caption text-ink-tertiary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Paiement sécurisé · Garantie {settings.warrantyMonths} mois
              </p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
