import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { Product } from '../../types';
import { cn } from '../../utils/cn';

/* ==========================================================================
   Visuel produit.

   Le catalogue d'origine a sa vraie photo dans /public/products/<slug>.webp,
   rapatriée une fois pour toutes par scripts/fetch-images.mjs (téléchargement
   + recadrage carré sur fond neutre + export WebP). Fini le hotlinking vers
   huit domaines tiers : la boutique ne dépend plus d'aucun service externe
   pour s'afficher.

   `thumb` charge la vignette 320 px (grilles denses, panier, palette de
   recherche) ; `full` charge la version 900 px (fiche produit, héros).

   Un produit ajouté ou complété depuis l'admin n'a pas forcément cette photo
   traitée : `images[0]` (import depuis l'admin, jusqu'à plusieurs par
   produit — voir la galerie sur ProductDetail) prend le relais si présente,
   et un pictogramme neutre remplace l'icône d'image cassée du navigateur si
   le chargement échoue des deux côtés.

   `src` court-circuite la résolution par défaut : c'est ce que la galerie de
   ProductDetail utilise pour afficher une image précise de `product.images`
   (pas forcément la première) tout en gardant le même filet de secours.
   ========================================================================== */

interface ProductImageProps {
  product: Product;
  size?: 'thumb' | 'full';
  className?: string;
  priority?: boolean;
  src?: string;
}

export function ProductImage({ product, size = 'full', className, priority = false, src: srcOverride }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src =
    srcOverride ??
    product.images?.[0] ??
    (size === 'thumb' ? `/products/${product.slug}-thumb.webp` : `/products/${product.slug}.webp`);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={product.name}
        className={cn('flex h-full w-full items-center justify-center bg-sunken text-ink-tertiary', className)}
      >
        <ImageOff className="h-1/4 w-1/4 min-h-6 min-w-6" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={product.name}
      width={size === 'thumb' ? 320 : 900}
      height={size === 'thumb' ? 320 : 900}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onError={() => setFailed(true)}
      // React DOM (18.3) ne mappe pas encore `fetchPriority` vers l'attribut
      // HTML `fetchpriority` : passé en camelCase il finit dans le DOM tel
      // quel et déclenche l'avertissement « unknown prop ». On le pose donc
      // en minuscule via le spread, comme le recommande l'avertissement.
      {...(priority ? { fetchpriority: 'high' } : {})}
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
