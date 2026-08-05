import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, Plus } from 'lucide-react';
import type { Product } from '../../types';
import { ROUTES } from '../../constants/routes';
import { brandById } from '../../data/catalog';
import { useCartStore, defaultVariants } from '../../store/cart.store';
import { useWishlistStore } from '../../store/wishlist.store';
import { useUIStore } from '../../store/ui.store';
import { discountPercent } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Badge, PriceTag, Rating } from '../ui/Primitives';
import { toast } from '../ui/Toast';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  /** `compact` réduit le visuel — utilisé dans les carrousels de suggestions. */
  density?: 'default' | 'compact';
  priority?: boolean;
  className?: string;
}

/**
 * Carte produit.
 *
 * `memo` est justifié ici : la grille du catalogue en affiche jusqu'à 24, et un
 * changement de filtre ne doit redessiner que les cartes réellement modifiées.
 */
export const ProductCard = memo(function ProductCard({
  product,
  density = 'default',
  priority = false,
  className,
}: ProductCardProps) {
  const add = useCartStore((state) => state.add);
  const isFavorite = useWishlistStore((state) => state.slugs.includes(product.slug));
  const toggleFavorite = useWishlistStore((state) => state.toggle);
  const [justAdded, setJustAdded] = useState(false);

  const brand = brandById.get(product.brandId);
  const discount = product.originalPrice ? discountPercent(product.originalPrice, product.price) : 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;
  const isOutOfStock = product.stock === 0;

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;

    add(product, defaultVariants(product), 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);

    toast.success('Ajouté au panier', {
      description: product.name,
      thumbnail: (
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-sunken">
          <ProductImage product={product} glow={false} />
        </span>
      ),
      // Ouvre le panneau latéral plutôt que de naviguer : l'utilisateur reste
      // dans le catalogue, ce qui est le comportement qui convertit le mieux.
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
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-elevated',
        'transition-[transform,border-color,box-shadow] duration-base ease-out-expo',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-2',
        'focus-within:border-accent focus-within:shadow-glow',
        className,
      )}
    >
      {/* Visuel — aspect-ratio fixe : aucune réservation de place à faire, donc
          aucun décalage de mise en page au chargement. */}
      <Link
        to={ROUTES.product(product.slug)}
        className="relative block aspect-square overflow-hidden bg-sunken"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="absolute inset-0 transition-transform duration-slow ease-out-expo group-hover:scale-[1.06]">
          <ProductImage product={product} priority={priority} />
        </div>

        {/* Second visuel révélé au survol : donne du relief sans seconde requête. */}
        {product.gallery > 1 && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-slow ease-out-expo group-hover:opacity-100">
            <ProductImage product={product} view={1} priority={false} />
          </div>
        )}
      </Link>

      {/* Étiquettes */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-2">
        {discount > 0 && <Badge tone="promo">−{discount} %</Badge>}
        {isLowStock && !isOutOfStock && (
          <Badge tone="neutral">Plus que {product.stock}</Badge>
        )}
        {isOutOfStock && <Badge tone="neutral">Épuisé</Badge>}
      </div>

      {/* Favori — toujours présent au clavier, révélé au survol à la souris. */}
      <button
        type="button"
        onClick={handleFavorite}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
        className={cn(
          // 44 px au doigt, 40 px au pointeur fin où la précision est meilleure.
          'absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full lg:h-10 lg:w-10',
          'border border-border bg-surface/80 backdrop-blur-md',
          'transition-all duration-fast ease-out-expo',
          'hover:border-border-strong hover:bg-surface',
          'lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100',
          isFavorite && 'lg:opacity-100',
        )}
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-colors duration-fast',
            isFavorite ? 'fill-danger text-danger' : 'text-ink-secondary',
          )}
          aria-hidden="true"
        />
      </button>

      {/* Contenu */}
      <div className={cn('flex flex-1 flex-col p-5', density === 'compact' && 'p-4')}>
        {brand && (
          <p className="text-overline uppercase text-ink-tertiary">{brand.name}</p>
        )}

        <h3 className="mt-1.5 text-h4 leading-snug text-ink">
          <Link
            to={ROUTES.product(product.slug)}
            className="rounded transition-colors duration-fast before:absolute before:inset-0 before:content-[''] hover:text-accent-text"
          >
            {product.name}
          </Link>
        </h3>

        {density === 'default' && (
          <p className="mt-2 line-clamp-2 text-caption text-ink-tertiary">{product.tagline}</p>
        )}

        <div className="mt-3">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <PriceTag price={product.price} originalPrice={product.originalPrice} size="md" short />

          {/* z-10 : passe devant le lien en pseudo-élément qui couvre la carte. */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
            className={cn(
              'relative z-10 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md',
              'transition-all duration-fast ease-out-expo active:scale-95',
              'disabled:pointer-events-none disabled:opacity-40',
              justAdded
                ? 'bg-success text-carbon-950'
                : 'bg-accent-solid text-accent-fg hover:bg-accent-solid-hover hover:shadow-glow',
            )}
          >
            {justAdded ? (
              <Check className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Plus className="h-5 w-5" aria-hidden="true" />
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
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-elevated">
      <div className="relative aspect-square overflow-hidden bg-sunken">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-sheen" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-3 w-16 rounded bg-sunken" />
        <div className="h-5 w-3/4 rounded bg-sunken" />
        <div className="h-3 w-full rounded bg-sunken" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="h-6 w-28 rounded bg-sunken" />
          <div className="h-11 w-11 rounded-md bg-sunken" />
        </div>
      </div>
    </div>
  );
}
