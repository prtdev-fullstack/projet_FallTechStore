import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { ROUTES } from '../../constants/routes';
import { useCartStore, defaultVariants } from '../../store/cart.store';
import { useWishlistStore } from '../../store/wishlist.store';
import { useUIStore } from '../../store/ui.store';
import { discountPercent, formatNumber, formatPriceShort, formatRating } from '../../utils/format';
import { cn } from '../../utils/cn';
import { toast } from '../ui/Toast';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

/** Compacte un compteur de ventes façon marketplace : 1 240 → « 1,2k vendus ». */
function formatSold(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k vendus`;
  return `${formatNumber(count)} vendus`;
}

/**
 * Carte produit — densité marketplace (Jumia, Amazon) plutôt que vitrine.
 *
 * Contrairement à une carte de boutique premium, l'objectif ici n'est pas de
 * faire respirer un seul produit mais d'en montrer le plus possible par écran,
 * avec le prix et la remise immédiatement lisibles : c'est ce qui vend en
 * ligne sur ce marché, pas la mise en scène.
 *
 * `memo` est justifié : la grille en affiche jusqu'à 40, et un changement de
 * filtre ne doit redessiner que les cartes réellement modifiées.
 */
export const ProductCard = memo(function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const add = useCartStore((state) => state.add);
  const isFavorite = useWishlistStore((state) => state.slugs.includes(product.slug));
  const toggleFavorite = useWishlistStore((state) => state.toggle);
  const [justAdded, setJustAdded] = useState(false);

  const discount = product.originalPrice ? discountPercent(product.originalPrice, product.price) : 0;
  const isOutOfStock = product.stock === 0;

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;

    add(product, defaultVariants(product), 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);

    toast.success('Ajouté au panier', {
      description: product.name,
      thumbnail: (
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-sunken">
          <ProductImage product={product} size="thumb" />
        </span>
      ),
      action: { label: 'Voir le panier', onClick: () => useUIStore.getState().openCart() },
    });
  };

  const handleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const added = toggleFavorite(product.slug);
    toast.info(added ? 'Ajouté aux favoris' : 'Retiré des favoris', { description: product.name });
  };

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-elevated',
        'transition-[border-color,box-shadow] duration-fast ease-out-expo hover:border-border-strong hover:shadow-2',
        className,
      )}
    >
      {/* Visuel — fond neutre déjà cuit dans la photo, carré fixe. */}
      <Link
        to={ROUTES.product(product.slug)}
        className="relative block aspect-square overflow-hidden bg-sunken"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage
          product={product}
          size="thumb"
          priority={priority}
          className="transition-transform duration-base ease-out-expo group-hover:scale-105"
        />

        {discount > 0 && (
          <span className="absolute left-0 top-2 rounded-r-sm bg-promo px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-promo-fg">
            -{discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-canvas/70 text-caption font-semibold text-ink-secondary backdrop-blur-[1px]">
            Épuisé
          </span>
        )}
      </Link>

      {/* Favori */}
      <button
        type="button"
        onClick={handleFavorite}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
        className={cn(
          'absolute right-1.5 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full',
          'bg-surface/85 backdrop-blur-md transition-colors duration-fast hover:bg-surface',
        )}
      >
        <Heart
          className={cn('h-3.5 w-3.5 transition-colors', isFavorite ? 'fill-danger text-danger' : 'text-ink-secondary')}
          aria-hidden="true"
        />
      </button>

      {/* Contenu — dense : nom sur 2 lignes max, note, prix, action. */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 min-h-[2.6em] text-body-s leading-snug text-ink">
          <Link
            to={ROUTES.product(product.slug)}
            className="rounded transition-colors duration-fast before:absolute before:inset-0 before:content-[''] hover:text-accent-text"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 text-caption text-ink-tertiary">
            <Star className="h-3 w-3 fill-promo text-promo" aria-hidden="true" />
            {formatRating(product.rating)}
          </span>
          {typeof product.sold === 'number' && product.sold > 0 && (
            <span className="text-caption text-ink-tertiary">· {formatSold(product.sold)}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div className="min-w-0">
            <p className="tabular truncate text-body font-bold text-ink">{formatPriceShort(product.price)}</p>
            {product.originalPrice && (
              <p className="tabular truncate text-[0.6875rem] text-ink-tertiary line-through">
                {formatPriceShort(product.originalPrice)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
            className={cn(
              'relative z-10 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full',
              'transition-all duration-fast ease-out-expo active:scale-90',
              'disabled:pointer-events-none disabled:opacity-30',
              justAdded ? 'bg-success text-carbon-950' : 'bg-accent-solid text-accent-fg hover:bg-accent-solid-hover',
            )}
          >
            {justAdded ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

/** Squelette de chargement, aux dimensions exactes de la carte. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-elevated">
      <div className="relative aspect-square overflow-hidden bg-sunken">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-sheen" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div className="h-3 w-full rounded bg-sunken" />
        <div className="h-3 w-2/3 rounded bg-sunken" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-4 w-16 rounded bg-sunken" />
          <div className="h-8 w-8 rounded-full bg-sunken" />
        </div>
      </div>
    </div>
  );
}
