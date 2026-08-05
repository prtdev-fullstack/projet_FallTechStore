export const ROUTES = {
  home: '/',
  shop: '/boutique',
  product: (slug: string) => `/produit/${slug}`,
  productPattern: '/produit/:slug',
  cart: '/panier',
  checkout: '/commande',
  orderConfirmation: '/commande/confirmation',
  account: '/compte',
  accountOrders: '/compte/commandes',
  accountWishlist: '/compte/favoris',
  accountProfile: '/compte/profil',
  login: '/connexion',
  register: '/inscription',
  designSystem: '/design-system',
} as const;

export const MAIN_NAV = [
  { label: 'Boutique', to: ROUTES.shop },
  { label: 'Nouveautés', to: `${ROUTES.shop}?tri=nouveautes` },
  { label: 'Promotions', to: `${ROUTES.shop}?promo=1` },
] as const;

export const FOOTER_NAV = [
  {
    title: 'Boutique',
    links: [
      { label: 'Tous les produits', to: ROUTES.shop },
      { label: 'Smartphones', to: `${ROUTES.shop}?categorie=smartphones` },
      { label: 'Audio', to: `${ROUTES.shop}?categorie=audio` },
      { label: 'Accessoires', to: `${ROUTES.shop}?categorie=accessoires` },
      { label: 'Objets connectés', to: `${ROUTES.shop}?categorie=objets-connectes` },
    ],
  },
  {
    title: 'Compte',
    links: [
      { label: 'Se connecter', to: ROUTES.login },
      { label: 'Mes commandes', to: ROUTES.accountOrders },
      { label: 'Mes favoris', to: ROUTES.accountWishlist },
      { label: 'Mon profil', to: ROUTES.accountProfile },
    ],
  },
] as const;

/** Coordonnées de la boutique — une seule source pour le pied de page, la page contact et le JSON-LD. */
export const STORE = {
  name: 'FallTech Store',
  tagline: 'La tech, sans le superflu.',
  city: 'Dakar',
  country: 'Sénégal',
  address: 'Sacré-Cœur 3, VDN — Dakar',
  phone: '+221 77 000 00 00',
  email: 'contact@falltechstore.sn',
  hours: 'Lundi – Samedi · 9h00 – 20h00',
  freeShippingThreshold: 100_000,
  warrantyMonths: 24,
  returnDays: 14,
} as const;
