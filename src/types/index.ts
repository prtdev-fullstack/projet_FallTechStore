/* ==========================================================================
   Modèle de données FallTech Store.

   Deux corrections de fond par rapport à la version d'origine :

   1. « Promotions » n'est plus une catégorie. C'était une erreur de
      modélisation : un iPhone en promotion disparaissait de la catégorie
      « smartphones ». La promotion est désormais un état commercial dérivé de
      la présence d'un `originalPrice`.

   2. L'identifiant public est un slug, pas un entier. `/produit/iphone-15-pro`
      est lisible, indexable et stable ; `/produit/1` ne l'est pas.
   ========================================================================== */

export type CategoryId = 'smartphones' | 'audio' | 'accessoires' | 'objets-connectes';

export interface Category {
  id: CategoryId;
  name: string;
  /** Phrase d'accroche affichée en tête de catégorie. */
  tagline: string;
}

export interface Brand {
  id: string;
  name: string;
}

/** Déclinaison achetable : couleur, capacité de stockage. */
export interface Variant {
  id: string;
  label: string;
  /** Supplément appliqué au prix de base (0 pour la déclinaison par défaut). */
  priceDelta: number;
  /** Code couleur d'aperçu, pour les pastilles de sélection. */
  swatch?: string;
  inStock: boolean;
}

export interface VariantGroup {
  id: string;
  label: string;
  options: Variant[];
}

export interface SpecGroup {
  label: string;
  items: { label: string; value: string }[];
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  /** Achat confirmé — affiche le marqueur « vérifié ». */
  verified: boolean;
}

export interface Product {
  slug: string;
  name: string;
  brandId: string;
  category: CategoryId;
  /** Prix de base en francs CFA, sans décimale. */
  price: number;
  /** Prix barré. Sa présence — et elle seule — définit une promotion. */
  originalPrice?: number;
  tagline: string;
  description: string;
  highlights: string[];
  specs: SpecGroup[];
  variantGroups: VariantGroup[];
  stock: number;
  rating: number;
  reviewCount: number;
  releasedAt: string;
  /** Mis en avant sur la page d'accueil. */
  featured?: boolean;
  /**
   * Unités vendues — alimente le tri « meilleures ventes » et le repère social
   * affiché sur la carte produit (« 1,2k vendus »), comme sur les marketplaces.
   */
  sold?: number;
  /**
   * Photo réelle disponible dans /public/products/<slug>.webp (et
   * <slug>-thumb.webp pour les vignettes). Tout le catalogue en dispose ;
   * le champ reste optionnel pour couvrir un futur ajout sans visuel.
   */
  hasPhotos?: boolean;
}

export interface CartLine {
  /** Clé unique de la ligne : slug + déclinaisons choisies. */
  key: string;
  slug: string;
  quantity: number;
  /** Identifiants des variantes sélectionnées, par groupe. */
  variants: Record<string, string>;
}

export type ShippingMethodId = 'domicile' | 'relais' | 'retrait';
export type PaymentMethodId = 'orange-money' | 'wave' | 'free-money' | 'carte' | 'livraison';

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
  delay: string;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'en-preparation' | 'expediee' | 'livree';
  total: number;
  lines: { slug: string; name: string; quantity: number; price: number }[];
}
