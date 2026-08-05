import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { DURATION, EASE } from '../../constants/motion';
import { ROUTES, STORE } from '../../constants/routes';
import { useCartStore, resolveLines } from '../../store/cart.store';
import { useUIStore } from '../../store/ui.store';
import { formatPrice, formatPriceShort } from '../../utils/format';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Overlay';
import { EmptyState, QuantityStepper } from '../ui';
import { ProductImage } from './ProductImage';

export function CartDrawer() {
  const isOpen = useUIStore((state) => state.isCartOpen);
  const close = useUIStore((state) => state.closeCart);

  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);

  const resolved = resolveLines(lines);
  const subtotal = resolved.reduce((total, line) => total + line.lineTotal, 0);
  const missingForFreeShipping = Math.max(0, STORE.freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / STORE.freeShippingThreshold) * 100);

  /* Le récapitulatif passe par la prop `footer` du Drawer : il reste ainsi
     collé en bas, visible sans défiler, même avec dix lignes au panier. */
  const footer =
    resolved.length === 0 ? undefined : (
      <>
        <div className="flex items-baseline justify-between">
          <span className="text-body-s text-ink-secondary">Sous-total</span>
          <motion.span
            key={subtotal}
            initial={{ opacity: 0.6, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.outExpo }}
            className="tabular font-display text-h4 text-ink"
          >
            {formatPrice(subtotal)}
          </motion.span>
        </div>
        <p className="mt-1 text-caption text-ink-tertiary">
          Frais de livraison calculés à l'étape suivante.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button to={ROUTES.checkout} onClick={close} block size="lg">
            Passer commande
          </Button>
          <Button variant="ghost" onClick={close} block>
            Continuer mes achats
          </Button>
        </div>
      </>
    );

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title={`Panier (${resolved.length})`}
      side="right"
      footer={footer}
    >
      {resolved.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" aria-hidden="true" />}
          title="Votre panier est vide"
          description="Parcourez le catalogue : smartphones, audio, accessoires et objets connectés, tous garantis 24 mois."
          action={
            <Button to={ROUTES.shop} onClick={close}>
              Découvrir la boutique
            </Button>
          }
        />
      ) : (
        <>
          {/* Jauge de livraison offerte : le levier de panier moyen le plus
              efficace, et la seule information vraiment utile en tête de panier. */}
          <div className="border-b border-border-subtle bg-elevated px-5 py-4">
            {missingForFreeShipping > 0 ? (
              <p className="text-caption text-ink-secondary">
                Plus que{' '}
                <strong className="tabular text-ink">{formatPriceShort(missingForFreeShipping)}</strong>{' '}
                pour la livraison offerte
              </p>
            ) : (
              <p className="text-caption font-semibold text-success">Livraison offerte débloquée</p>
            )}
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sunken">
              <motion.div
                className="h-full rounded-full bg-aurora"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
              />
            </div>
          </div>

          <ul className="divide-y divide-border-subtle">
            <AnimatePresence initial={false}>
              {resolved.map((line) => (
                <motion.li
                  key={line.key}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE.outExpo }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 p-5">
                    <Link
                      to={ROUTES.product(line.slug)}
                      onClick={close}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-sunken"
                    >
                      <ProductImage product={line.product} glow={false} />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to={ROUTES.product(line.slug)}
                        onClick={close}
                        className="text-body-s font-semibold leading-snug text-ink transition-colors hover:text-accent-text"
                      >
                        {line.product.name}
                      </Link>
                      {line.variantLabels.length > 0 && (
                        <p className="mt-0.5 text-caption text-ink-tertiary">
                          {line.variantLabels.join(' · ')}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <QuantityStepper
                          size="sm"
                          value={line.quantity}
                          max={line.product.stock}
                          onChange={(next) => setQuantity(line.key, next)}
                        />
                        <span className="tabular text-body-s font-semibold text-ink">
                          {formatPriceShort(line.lineTotal)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      aria-label={`Retirer ${line.product.name} du panier`}
                      className="-m-2 h-10 w-10 shrink-0 cursor-pointer rounded-md p-2 text-ink-tertiary transition-colors duration-fast hover:bg-elevated hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </Drawer>
  );
}
