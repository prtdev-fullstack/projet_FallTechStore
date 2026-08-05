import type { Product } from '../../types';
import { cn } from '../../utils/cn';

/* ==========================================================================
   Visuel produit — vraie photo locale.

   Chaque produit a sa photo dans /public/products/<slug>.webp, rapatriée une
   fois pour toutes par scripts/fetch-images.mjs (téléchargement + recadrage
   carré sur fond neutre + export WebP). Fini le hotlinking vers huit domaines
   tiers : la boutique ne dépend plus d'aucun service externe pour s'afficher.

   `thumb` charge la vignette 320 px (grilles denses, panier, palette de
   recherche) ; `full` charge la version 900 px (fiche produit, héros).
   ========================================================================== */

interface ProductImageProps {
  product: Product;
  size?: 'thumb' | 'full';
  className?: string;
  priority?: boolean;
}

export function ProductImage({ product, size = 'full', className, priority = false }: ProductImageProps) {
  const src = size === 'thumb' ? `/products/${product.slug}-thumb.webp` : `/products/${product.slug}.webp`;

  return (
    <img
      src={src}
      alt={product.name}
      width={size === 'thumb' ? 320 : 900}
      height={size === 'thumb' ? 320 : 900}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // React DOM (18.3) ne mappe pas encore `fetchPriority` vers l'attribut
      // HTML `fetchpriority` : passé en camelCase il finit dans le DOM tel
      // quel et déclenche l'avertissement « unknown prop ». On le pose donc
      // en minuscule via le spread, comme le recommande l'avertissement.
      {...(priority ? { fetchpriority: 'high' } : {})}
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
