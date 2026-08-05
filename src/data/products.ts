import type { Product } from '../types';

/* ==========================================================================
   Catalogue — 24 références, prix en francs CFA cohérents avec le marché
   sénégalais (Dakar, 2026).

   Rappel de modélisation : la promotion n'est pas une catégorie. Un produit est
   en promotion si, et seulement si, il porte un `originalPrice`. Il reste donc
   visible dans sa vraie catégorie, ce qui n'était pas le cas auparavant.
   ========================================================================== */

const colorGroup = (options: { id: string; label: string; swatch: string; inStock?: boolean }[]) => ({
  id: 'couleur',
  label: 'Couleur',
  options: options.map((option) => ({
    id: option.id,
    label: option.label,
    swatch: option.swatch,
    priceDelta: 0,
    inStock: option.inStock ?? true,
  })),
});

const storageGroup = (options: { id: string; label: string; priceDelta: number; inStock?: boolean }[]) => ({
  id: 'stockage',
  label: 'Stockage',
  options: options.map((option) => ({
    id: option.id,
    label: option.label,
    priceDelta: option.priceDelta,
    inStock: option.inStock ?? true,
  })),
});

export const products: Product[] = [
  /* ── Smartphones ──────────────────────────────────────────────────────── */
  {
    slug: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brandId: 'apple',
    category: 'smartphones',
    price: 1_150_000,
    originalPrice: 1_290_000,
    tagline: 'Titane. Si résistant. Si léger. Si Pro.',
    description:
      "Le plus abouti des iPhone. Châssis en titane de qualité aérospatiale, puce A17 Pro gravée en 3 nm et téléobjectif 5×. L'écran ProMotion 120 Hz monte à 2000 nits en plein soleil — un vrai sujet à Dakar.",
    highlights: [
      'Puce A17 Pro, 6 cœurs GPU avec ray tracing matériel',
      'Téléobjectif 5× et capteur principal 48 Mpx',
      'Châssis titane, 221 g seulement',
      'USB-C avec transferts USB 3 (jusqu’à 10 Gb/s)',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,7 pouces' },
          { label: 'Technologie', value: 'Super Retina XDR OLED' },
          { label: 'Rafraîchissement', value: 'ProMotion 1 – 120 Hz' },
          { label: 'Luminosité', value: '2 000 nits en extérieur' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Apple A17 Pro' },
          { label: 'Mémoire vive', value: '8 Go' },
          { label: 'Système', value: 'iOS 17' },
        ],
      },
      {
        label: 'Photo & autonomie',
        items: [
          { label: 'Capteur principal', value: '48 Mpx, f/1.78' },
          { label: 'Zoom optique', value: '5× (120 mm)' },
          { label: 'Batterie', value: '4 441 mAh' },
          { label: 'Charge', value: '27 W filaire, 15 W MagSafe' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'titane-naturel', label: 'Titane naturel', swatch: '#8F8A85' },
        { id: 'titane-bleu', label: 'Titane bleu', swatch: '#3E4B5B' },
        { id: 'titane-noir', label: 'Titane noir', swatch: '#3B3B3D' },
        { id: 'titane-blanc', label: 'Titane blanc', swatch: '#E8E4DE' },
      ]),
      storageGroup([
        { id: '256', label: '256 Go', priceDelta: 0 },
        { id: '512', label: '512 Go', priceDelta: 180_000 },
        { id: '1024', label: '1 To', priceDelta: 390_000, inStock: false },
      ]),
    ],
    stock: 7,
    rating: 4.9,
    reviewCount: 128,
    releasedAt: '2025-09-22',
    featured: true,
    gallery: 4,
  },
  {
    slug: 'iphone-15',
    name: 'iPhone 15',
    brandId: 'apple',
    category: 'smartphones',
    price: 750_000,
    tagline: 'La Dynamic Island pour tous.',
    description:
      "L'essentiel de la gamme Pro à un tarif plus raisonnable : capteur 48 Mpx, Dynamic Island, USB-C et la puce A16 Bionic. Le meilleur rapport qualité-prix du catalogue Apple.",
    highlights: [
      'Capteur principal 48 Mpx avec zoom 2× de qualité optique',
      'Dynamic Island',
      'Puce A16 Bionic',
      'Connecteur USB-C',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,1 pouces' },
          { label: 'Technologie', value: 'Super Retina XDR OLED' },
          { label: 'Luminosité', value: '1 600 nits en pic' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Apple A16 Bionic' },
          { label: 'Mémoire vive', value: '6 Go' },
          { label: 'Système', value: 'iOS 17' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#2E2E30' },
        { id: 'bleu', label: 'Bleu', swatch: '#AFC7D0' },
        { id: 'rose', label: 'Rose', swatch: '#EBD3D6' },
        { id: 'jaune', label: 'Jaune', swatch: '#EDE6C8' },
      ]),
      storageGroup([
        { id: '128', label: '128 Go', priceDelta: 0 },
        { id: '256', label: '256 Go', priceDelta: 95_000 },
      ]),
    ],
    stock: 14,
    rating: 4.7,
    reviewCount: 214,
    releasedAt: '2025-09-22',
    featured: true,
    gallery: 3,
  },
  {
    slug: 'iphone-13',
    name: 'iPhone 13',
    brandId: 'apple',
    category: 'smartphones',
    price: 480_000,
    originalPrice: 560_000,
    tagline: "L'iPhone qui refuse de vieillir.",
    description:
      "Quatre ans après sa sortie, il reste plus rapide que la plupart des Android neufs à ce prix, et il recevra les mises à jour iOS encore plusieurs années. Notre meilleure vente, sans discussion.",
    highlights: [
      'Puce A15 Bionic, toujours au niveau du milieu de gamme 2026',
      'Double capteur 12 Mpx avec stabilisation par décalage du capteur',
      'Autonomie confortable, jusqu’à 19 h de vidéo',
      'Certifié IP68',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,1 pouces' },
          { label: 'Technologie', value: 'Super Retina XDR OLED' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Apple A15 Bionic' },
          { label: 'Mémoire vive', value: '4 Go' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'minuit', label: 'Minuit', swatch: '#232A31' },
        { id: 'lumiere-stellaire', label: 'Lumière stellaire', swatch: '#F0E5D7' },
        { id: 'bleu', label: 'Bleu', swatch: '#2E4A62' },
      ]),
      storageGroup([
        { id: '128', label: '128 Go', priceDelta: 0 },
        { id: '256', label: '256 Go', priceDelta: 70_000 },
      ]),
    ],
    stock: 21,
    rating: 4.8,
    reviewCount: 342,
    releasedAt: '2023-11-04',
    featured: true,
    gallery: 3,
  },
  {
    slug: 'galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brandId: 'samsung',
    category: 'smartphones',
    price: 1_050_000,
    tagline: 'Le S Pen, le zoom 100× et Galaxy AI.',
    description:
      "Le couteau suisse du haut de gamme Android. Zoom optique 5×, numérique 100×, S Pen intégré et sept ans de mises à jour promises. L'écran anti-reflet fait une vraie différence dehors.",
    highlights: [
      'Capteur principal 200 Mpx',
      'S Pen intégré au châssis',
      'Écran Gorilla Armor anti-reflet',
      '7 ans de mises à jour Android garanties',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,8 pouces' },
          { label: 'Technologie', value: 'Dynamic AMOLED 2X' },
          { label: 'Rafraîchissement', value: '1 – 120 Hz' },
          { label: 'Luminosité', value: '2 600 nits en pic' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Snapdragon 8 Gen 3 for Galaxy' },
          { label: 'Mémoire vive', value: '12 Go' },
          { label: 'Système', value: 'Android 14 · One UI 6.1' },
        ],
      },
      {
        label: 'Photo & autonomie',
        items: [
          { label: 'Capteur principal', value: '200 Mpx, f/1.7' },
          { label: 'Zoom optique', value: '3× et 5×' },
          { label: 'Batterie', value: '5 000 mAh' },
          { label: 'Charge', value: '45 W filaire' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'titane-gris', label: 'Titane gris', swatch: '#6C6C70' },
        { id: 'titane-violet', label: 'Titane violet', swatch: '#8E86A8' },
        { id: 'titane-noir', label: 'Titane noir', swatch: '#2C2C2E' },
      ]),
      storageGroup([
        { id: '256', label: '256 Go', priceDelta: 0 },
        { id: '512', label: '512 Go', priceDelta: 140_000 },
      ]),
    ],
    stock: 5,
    rating: 4.8,
    reviewCount: 176,
    releasedAt: '2025-01-31',
    featured: true,
    gallery: 4,
  },
  {
    slug: 'galaxy-s24',
    name: 'Samsung Galaxy S24',
    brandId: 'samsung',
    category: 'smartphones',
    price: 690_000,
    originalPrice: 760_000,
    tagline: 'Compact, lumineux, sans compromis.',
    description:
      "6,2 pouces qui tiennent vraiment dans la main, un écran à 2 600 nits et les fonctions Galaxy AI de traduction en direct — pratique pour les appels internationaux.",
    highlights: [
      'Format compact 6,2 pouces',
      'Écran à 2 600 nits, le plus lumineux de sa catégorie',
      'Traduction d’appel en direct',
      '7 ans de mises à jour',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,2 pouces' },
          { label: 'Technologie', value: 'Dynamic AMOLED 2X' },
          { label: 'Rafraîchissement', value: '1 – 120 Hz' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Exynos 2400' },
          { label: 'Mémoire vive', value: '8 Go' },
          { label: 'Batterie', value: '4 000 mAh' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'onyx', label: 'Onyx', swatch: '#2A2A2C' },
        { id: 'marbre', label: 'Gris marbre', swatch: '#B9B6B1' },
        { id: 'violet', label: 'Violet cobalt', swatch: '#5B5F8A' },
      ]),
      storageGroup([
        { id: '128', label: '128 Go', priceDelta: 0 },
        { id: '256', label: '256 Go', priceDelta: 65_000 },
      ]),
    ],
    stock: 11,
    rating: 4.6,
    reviewCount: 158,
    releasedAt: '2025-01-31',
    gallery: 3,
  },
  {
    slug: 'galaxy-a55',
    name: 'Samsung Galaxy A55',
    brandId: 'samsung',
    category: 'smartphones',
    price: 285_000,
    tagline: 'Le milieu de gamme qui coche toutes les cases.',
    description:
      "Châssis métal, écran Super AMOLED 120 Hz, 5 000 mAh et quatre ans de mises à jour. À ce prix, difficile de faire mieux au Sénégal.",
    highlights: [
      'Châssis en aluminium',
      'Super AMOLED 120 Hz',
      'Batterie 5 000 mAh',
      '4 générations de mises à jour Android',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,6 pouces' },
          { label: 'Technologie', value: 'Super AMOLED 120 Hz' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Exynos 1480' },
          { label: 'Mémoire vive', value: '8 Go' },
          { label: 'Batterie', value: '5 000 mAh' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'bleu-glace', label: 'Bleu glacé', swatch: '#8EA7C4' },
        { id: 'noir', label: 'Noir', swatch: '#2B2B2D' },
        { id: 'lilas', label: 'Lilas', swatch: '#C3B4D6' },
      ]),
      storageGroup([
        { id: '128', label: '128 Go', priceDelta: 0 },
        { id: '256', label: '256 Go', priceDelta: 35_000 },
      ]),
    ],
    stock: 26,
    rating: 4.5,
    reviewCount: 203,
    releasedAt: '2025-03-11',
    gallery: 3,
  },
  {
    slug: 'pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    brandId: 'google',
    category: 'smartphones',
    price: 720_000,
    originalPrice: 820_000,
    tagline: 'La meilleure photo, sans effort.',
    description:
      "Le traitement d'image de Google reste une référence. Gomme Magique, Meilleure Photo et un mode nuit qui sauve les fins de soirée. Sept ans de mises à jour, système et sécurité compris.",
    highlights: [
      'Puce Google Tensor G3',
      'Gomme Magique Audio et Photo',
      'Thermomètre intégré',
      '7 ans de mises à jour',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,7 pouces' },
          { label: 'Technologie', value: 'Super Actua LTPO OLED' },
          { label: 'Luminosité', value: '2 400 nits en pic' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Google Tensor G3' },
          { label: 'Mémoire vive', value: '12 Go' },
          { label: 'Batterie', value: '5 050 mAh' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'obsidienne', label: 'Obsidienne', swatch: '#2C2C2E' },
        { id: 'porcelaine', label: 'Porcelaine', swatch: '#E9E4DC' },
        { id: 'baie', label: 'Bleu baie', swatch: '#7C93B8' },
      ]),
      storageGroup([
        { id: '128', label: '128 Go', priceDelta: 0 },
        { id: '256', label: '256 Go', priceDelta: 60_000 },
      ]),
    ],
    stock: 9,
    rating: 4.7,
    reviewCount: 97,
    releasedAt: '2024-10-12',
    gallery: 3,
  },
  {
    slug: 'redmi-note-13-pro',
    name: 'Xiaomi Redmi Note 13 Pro',
    brandId: 'xiaomi',
    category: 'smartphones',
    price: 195_000,
    tagline: '200 Mpx pour moins de 200 000 F.',
    description:
      "Le rapport fiche technique / prix le plus agressif du marché. Capteur 200 Mpx, AMOLED 120 Hz et charge 67 W qui remplit la batterie en une demi-heure.",
    highlights: [
      'Capteur 200 Mpx avec stabilisation optique',
      'AMOLED 1,5K à 120 Hz',
      'Charge turbo 67 W',
      'Double haut-parleur Dolby Atmos',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,67 pouces' },
          { label: 'Technologie', value: 'AMOLED 1,5K · 120 Hz' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Snapdragon 7s Gen 2' },
          { label: 'Mémoire vive', value: '8 Go' },
          { label: 'Batterie', value: '5 100 mAh · 67 W' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir-minuit', label: 'Noir minuit', swatch: '#26262A' },
        { id: 'violet', label: 'Violet aurore', swatch: '#9B8AC4' },
        { id: 'vert', label: 'Vert forêt', swatch: '#4C6B5A' },
      ]),
      storageGroup([
        { id: '256', label: '256 Go', priceDelta: 0 },
        { id: '512', label: '512 Go', priceDelta: 30_000 },
      ]),
    ],
    stock: 32,
    rating: 4.4,
    reviewCount: 268,
    releasedAt: '2024-09-05',
    gallery: 3,
  },
  {
    slug: 'tecno-camon-30',
    name: 'Tecno Camon 30',
    brandId: 'tecno',
    category: 'smartphones',
    price: 145_000,
    originalPrice: 168_000,
    tagline: 'Le portrait, sa spécialité.',
    description:
      "Tecno soigne la photo de portrait sur peaux foncées depuis des années, et cela se voit. Grand écran, gros haut-parleur et une autonomie de deux jours en usage normal.",
    highlights: [
      'Capteur 50 Mpx optimisé pour les carnations foncées',
      'AMOLED 6,78 pouces à 120 Hz',
      'Charge 70 W',
      'Certifié IP54',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,78 pouces' },
          { label: 'Technologie', value: 'AMOLED 120 Hz' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'MediaTek Helio G99 Ultimate' },
          { label: 'Mémoire vive', value: '8 Go' },
          { label: 'Batterie', value: '5 000 mAh · 70 W' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir basaltique', swatch: '#232326' },
        { id: 'or', label: 'Or sable', swatch: '#C9AF87' },
      ]),
      storageGroup([{ id: '256', label: '256 Go', priceDelta: 0 }]),
    ],
    stock: 38,
    rating: 4.3,
    reviewCount: 189,
    releasedAt: '2025-04-18',
    gallery: 2,
  },
  {
    slug: 'infinix-hot-40i',
    name: 'Infinix Hot 40i',
    brandId: 'infinix',
    category: 'smartphones',
    price: 85_000,
    tagline: 'Le premier smartphone qui ne déçoit pas.',
    description:
      "Notre recommandation systématique pour un premier téléphone ou un second appareil : 8 Go de mémoire, 5 000 mAh et un écran 90 Hz. Rien d'exceptionnel, rien de raté.",
    highlights: [
      'Écran 6,56 pouces à 90 Hz',
      '8 Go de mémoire vive extensible',
      'Batterie 5 000 mAh',
      'Double SIM 4G',
    ],
    specs: [
      {
        label: 'Écran',
        items: [
          { label: 'Taille', value: '6,56 pouces' },
          { label: 'Rafraîchissement', value: '90 Hz' },
        ],
      },
      {
        label: 'Performance',
        items: [
          { label: 'Processeur', value: 'Unisoc T606' },
          { label: 'Mémoire vive', value: '8 Go' },
          { label: 'Batterie', value: '5 000 mAh · 18 W' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir starlit', swatch: '#25252A' },
        { id: 'or', label: 'Or horizon', swatch: '#D3B98E' },
        { id: 'vert', label: 'Vert palmier', swatch: '#3F6B52' },
      ]),
      storageGroup([{ id: '256', label: '256 Go', priceDelta: 0 }]),
    ],
    stock: 45,
    rating: 4.1,
    reviewCount: 312,
    releasedAt: '2024-12-02',
    gallery: 2,
  },

  /* ── Audio ────────────────────────────────────────────────────────────── */
  {
    slug: 'airpods-pro-2',
    name: 'AirPods Pro 2 (USB-C)',
    brandId: 'apple',
    category: 'audio',
    price: 195_000,
    originalPrice: 225_000,
    tagline: 'Le silence, à la demande.',
    description:
      "La réduction de bruit la plus efficace du marché sur ce format, et surtout le mode Transparence adaptatif qui atténue les bruits violents sans vous couper du monde. Indispensable dans le trafic de Dakar.",
    highlights: [
      'Réduction de bruit deux fois plus efficace que la génération précédente',
      'Audio spatial personnalisé',
      'Boîtier USB-C avec haut-parleur intégré',
      '6 h d’écoute, 30 h avec le boîtier',
    ],
    specs: [
      {
        label: 'Audio',
        items: [
          { label: 'Puce', value: 'Apple H2' },
          { label: 'Réduction de bruit', value: 'Active, adaptative' },
          { label: 'Audio spatial', value: 'Avec suivi dynamique de la tête' },
        ],
      },
      {
        label: 'Autonomie & résistance',
        items: [
          { label: 'Écouteurs', value: 'Jusqu’à 6 h' },
          { label: 'Avec le boîtier', value: 'Jusqu’à 30 h' },
          { label: 'Résistance', value: 'IP54, écouteurs et boîtier' },
        ],
      },
    ],
    variantGroups: [colorGroup([{ id: 'blanc', label: 'Blanc', swatch: '#F5F5F7' }])],
    stock: 18,
    rating: 4.8,
    reviewCount: 241,
    releasedAt: '2024-09-12',
    featured: true,
    gallery: 3,
  },
  {
    slug: 'airpods-4',
    name: 'AirPods 4',
    brandId: 'apple',
    category: 'audio',
    price: 135_000,
    tagline: 'Le format ouvert, enfin réussi.',
    description:
      "Pour ceux que les embouts en silicone gênent. Nouveau design, bien plus stable que les AirPods 3, et une qualité d'appel nettement améliorée.",
    highlights: [
      'Puce Apple H2',
      'Audio spatial personnalisé',
      'Boîtier USB-C compact',
      'Résistant à la sueur et à l’eau',
    ],
    specs: [
      {
        label: 'Audio',
        items: [
          { label: 'Puce', value: 'Apple H2' },
          { label: 'Format', value: 'Intra-auriculaire ouvert' },
        ],
      },
      {
        label: 'Autonomie',
        items: [
          { label: 'Écouteurs', value: 'Jusqu’à 5 h' },
          { label: 'Avec le boîtier', value: 'Jusqu’à 30 h' },
        ],
      },
    ],
    variantGroups: [colorGroup([{ id: 'blanc', label: 'Blanc', swatch: '#F5F5F7' }])],
    stock: 24,
    rating: 4.5,
    reviewCount: 86,
    releasedAt: '2025-09-20',
    gallery: 2,
  },
  {
    slug: 'galaxy-buds3-pro',
    name: 'Samsung Galaxy Buds3 Pro',
    brandId: 'samsung',
    category: 'audio',
    price: 145_000,
    tagline: 'Hi-Fi 24 bits, sans fil.',
    description:
      "Le meilleur choix si vous êtes sur Galaxy : codec SSC hi-fi, réduction de bruit adaptative et interprétation en direct pendant les appels.",
    highlights: [
      'Audio 24 bits / 96 kHz avec les appareils Galaxy',
      'Réduction de bruit adaptative',
      'Double transducteur',
      'IP57',
    ],
    specs: [
      {
        label: 'Audio',
        items: [
          { label: 'Transducteurs', value: 'Woofer + tweeter planaire' },
          { label: 'Codecs', value: 'SSC Hi-Fi, AAC, SBC' },
        ],
      },
      {
        label: 'Autonomie',
        items: [
          { label: 'Écouteurs', value: 'Jusqu’à 6 h (RBA activée)' },
          { label: 'Avec le boîtier', value: 'Jusqu’à 26 h' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'argent', label: 'Argent', swatch: '#D8DADC' },
        { id: 'blanc', label: 'Blanc', swatch: '#F2F2F4' },
      ]),
    ],
    stock: 15,
    rating: 4.5,
    reviewCount: 74,
    releasedAt: '2025-07-24',
    gallery: 2,
  },
  {
    slug: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5',
    brandId: 'sony',
    category: 'audio',
    price: 385_000,
    originalPrice: 430_000,
    tagline: 'La référence du casque à réduction de bruit.',
    description:
      "Huit micros, deux processeurs, trente heures d'autonomie. Si vous prenez souvent l'avion ou travaillez en environnement bruyant, c'est le meilleur achat de cette liste.",
    highlights: [
      'Réduction de bruit à 8 micros et 2 processeurs',
      '30 h d’autonomie, 3 h en 3 minutes de charge',
      'Coussinets en mousse à mémoire de forme',
      'Multipoint Bluetooth',
    ],
    specs: [
      {
        label: 'Audio',
        items: [
          { label: 'Transducteurs', value: '30 mm en fibre de carbone' },
          { label: 'Codecs', value: 'LDAC, AAC, SBC' },
          { label: 'Réduction de bruit', value: 'Processeur QN1 + V1' },
        ],
      },
      {
        label: 'Autonomie & confort',
        items: [
          { label: 'Autonomie', value: '30 h avec RBA' },
          { label: 'Charge rapide', value: '3 h en 3 min' },
          { label: 'Poids', value: '250 g' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#242427' },
        { id: 'argent', label: 'Argent', swatch: '#D6D3CC' },
        { id: 'bleu', label: 'Bleu nuit', swatch: '#38455C', inStock: false },
      ]),
    ],
    stock: 6,
    rating: 4.9,
    reviewCount: 112,
    releasedAt: '2023-05-20',
    featured: true,
    gallery: 3,
  },
  {
    slug: 'jbl-tune-770nc',
    name: 'JBL Tune 770NC',
    brandId: 'jbl',
    category: 'audio',
    price: 95_000,
    originalPrice: 112_000,
    tagline: '70 heures d’autonomie. Vraiment.',
    description:
      "La réduction de bruit adaptative de JBL à un tarif accessible, avec une autonomie qui met tout le monde d'accord : une semaine complète sans recharger.",
    highlights: [
      'Jusqu’à 70 h sans réduction de bruit',
      'Réduction de bruit adaptative',
      'Pliable, avec housse',
      'Multipoint Bluetooth 5.3',
    ],
    specs: [
      {
        label: 'Audio',
        items: [
          { label: 'Transducteurs', value: '40 mm' },
          { label: 'Signature', value: 'JBL Pure Bass' },
        ],
      },
      {
        label: 'Autonomie',
        items: [
          { label: 'Sans RBA', value: '70 h' },
          { label: 'Avec RBA', value: '44 h' },
          { label: 'Charge rapide', value: '3 h en 5 min' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#232326' },
        { id: 'bleu', label: 'Bleu', swatch: '#33507E' },
        { id: 'blanc', label: 'Blanc', swatch: '#EFEFEF' },
      ]),
    ],
    stock: 22,
    rating: 4.4,
    reviewCount: 156,
    releasedAt: '2024-06-14',
    gallery: 2,
  },

  /* ── Accessoires ──────────────────────────────────────────────────────── */
  {
    slug: 'chargeur-gan-65w',
    name: 'Chargeur GaN 65 W — 3 ports',
    brandId: 'anker',
    category: 'accessoires',
    price: 32_000,
    tagline: 'Un seul chargeur pour tout.',
    description:
      "Deux USB-C et un USB-A : votre téléphone, vos écouteurs et un ordinateur portable sur la même prise. La technologie GaN le rend deux fois plus compact qu'un chargeur classique de même puissance.",
    highlights: [
      '65 W répartis intelligemment sur 3 ports',
      'Compatible Power Delivery 3.0 et Quick Charge',
      'Deux fois plus compact grâce au nitrure de gallium',
      'Protection contre la surchauffe et les surtensions',
    ],
    specs: [
      {
        label: 'Caractéristiques',
        items: [
          { label: 'Puissance totale', value: '65 W' },
          { label: 'Ports', value: '2 × USB-C, 1 × USB-A' },
          { label: 'Norme', value: 'USB Power Delivery 3.0' },
          { label: 'Prise', value: 'Type C européenne' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#242426' },
        { id: 'blanc', label: 'Blanc', swatch: '#F0F0F2' },
      ]),
    ],
    stock: 54,
    rating: 4.7,
    reviewCount: 198,
    releasedAt: '2024-03-08',
    gallery: 2,
  },
  {
    slug: 'batterie-externe-20000',
    name: 'Batterie externe 20 000 mAh — 22,5 W',
    brandId: 'anker',
    category: 'accessoires',
    price: 28_000,
    originalPrice: 36_000,
    tagline: 'Quatre recharges complètes.',
    description:
      "Avec les coupures de courant, une batterie externe n'est plus un accessoire de voyage mais un équipement du quotidien. Écran de charge précis au pourcentage près.",
    highlights: [
      '20 000 mAh, environ 4 recharges de smartphone',
      'Charge rapide 22,5 W',
      'Écran digital du niveau restant',
      'Recharge simultanée de 3 appareils',
    ],
    specs: [
      {
        label: 'Caractéristiques',
        items: [
          { label: 'Capacité', value: '20 000 mAh' },
          { label: 'Sortie maximale', value: '22,5 W' },
          { label: 'Ports', value: '1 × USB-C, 2 × USB-A' },
          { label: 'Poids', value: '435 g' },
        ],
      },
    ],
    variantGroups: [colorGroup([{ id: 'noir', label: 'Noir', swatch: '#1F1F22' }])],
    stock: 41,
    rating: 4.6,
    reviewCount: 267,
    releasedAt: '2024-08-21',
    gallery: 2,
  },
  {
    slug: 'coque-magsafe-iphone-15-pro',
    name: 'Coque MagSafe — iPhone 15 Pro',
    brandId: 'apple',
    category: 'accessoires',
    price: 18_000,
    tagline: 'La protection qui ne se voit pas.',
    description:
      "Silicone doublé microfibre, aimants alignés MagSafe et boutons métalliques. Ne jaunit pas, contrairement aux coques transparentes bas de gamme.",
    highlights: [
      'Aimants MagSafe intégrés',
      'Intérieur microfibre doux',
      'Boutons en aluminium',
      'Protection renforcée des angles',
    ],
    specs: [
      {
        label: 'Caractéristiques',
        items: [
          { label: 'Compatibilité', value: 'iPhone 15 Pro' },
          { label: 'Matière', value: 'Silicone et microfibre' },
          { label: 'MagSafe', value: 'Oui' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#232325' },
        { id: 'bleu', label: 'Bleu hiver', swatch: '#4B6480' },
        { id: 'argile', label: 'Argile', swatch: '#B08D74' },
        { id: 'cyprès', label: 'Cyprès', swatch: '#4E5C48' },
      ]),
    ],
    stock: 67,
    rating: 4.4,
    reviewCount: 91,
    releasedAt: '2025-09-22',
    gallery: 2,
  },
  {
    slug: 'verre-trempe-9h',
    name: 'Verre trempé 9H — pose sans bulle',
    brandId: 'anker',
    category: 'accessoires',
    price: 8_000,
    tagline: 'Deux dans la boîte, un cadre de pose inclus.',
    description:
      "Le cadre de pose fourni rend l'installation infaillible, même sans expérience. Dureté 9H, oléophobe, compatible avec toutes les coques.",
    highlights: [
      'Deux protections par boîte',
      'Cadre de pose sans bulle',
      'Dureté 9H',
      'Traitement anti-traces de doigts',
    ],
    specs: [
      {
        label: 'Caractéristiques',
        items: [
          { label: 'Dureté', value: '9H' },
          { label: 'Épaisseur', value: '0,33 mm' },
          { label: 'Contenu', value: '2 verres + cadre de pose' },
        ],
      },
    ],
    variantGroups: [
      {
        id: 'modele',
        label: 'Modèle',
        options: [
          { id: 'iphone-15-pro', label: 'iPhone 15 / 15 Pro', priceDelta: 0, inStock: true },
          { id: 'galaxy-s24', label: 'Galaxy S24 / S24+', priceDelta: 0, inStock: true },
          { id: 'redmi-note-13', label: 'Redmi Note 13', priceDelta: 0, inStock: true },
        ],
      },
    ],
    stock: 120,
    rating: 4.2,
    reviewCount: 344,
    releasedAt: '2024-02-15',
    gallery: 1,
  },
  {
    slug: 'cable-usb-c-tresse-2m',
    name: 'Câble USB-C tressé 2 m — 100 W',
    brandId: 'anker',
    category: 'accessoires',
    price: 12_000,
    tagline: 'Celui qui ne lâchera pas.',
    description:
      "Gaine nylon tressée testée à 12 000 pliages, connecteurs renforcés et 100 W de puissance : il charge aussi bien un téléphone qu'un ordinateur portable.",
    highlights: [
      'Nylon tressé testé à 12 000 pliages',
      'Jusqu’à 100 W en Power Delivery',
      'Transfert de données 480 Mb/s',
      'Longueur 2 m',
    ],
    specs: [
      {
        label: 'Caractéristiques',
        items: [
          { label: 'Longueur', value: '2 m' },
          { label: 'Puissance', value: '100 W (20 V / 5 A)' },
          { label: 'Gaine', value: 'Nylon tressé double couche' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#212124' },
        { id: 'gris', label: 'Gris', swatch: '#9A9AA0' },
      ]),
    ],
    stock: 98,
    rating: 4.5,
    reviewCount: 178,
    releasedAt: '2024-05-30',
    gallery: 1,
  },

  /* ── Objets connectés ─────────────────────────────────────────────────── */
  {
    slug: 'apple-watch-series-9',
    name: 'Apple Watch Series 9',
    brandId: 'apple',
    category: 'objets-connectes',
    price: 385_000,
    tagline: 'Le double tap change tout.',
    description:
      "Écran deux fois plus lumineux, geste du double tap pour répondre sans toucher l'écran, et un suivi de santé qui reste le plus complet du marché.",
    highlights: [
      'Puce S9 SiP et geste du double tap',
      'Écran jusqu’à 2 000 nits',
      'Capteurs ECG, oxygène sanguin et température',
      '18 h d’autonomie, 36 h en mode économie',
    ],
    specs: [
      {
        label: 'Écran & boîtier',
        items: [
          { label: 'Taille', value: '41 mm ou 45 mm' },
          { label: 'Écran', value: 'Retina LTPO toujours activé' },
          { label: 'Résistance', value: 'WR50, IP6X' },
        ],
      },
      {
        label: 'Santé',
        items: [
          { label: 'Capteurs', value: 'Cardio, ECG, SpO₂, température' },
          { label: 'Autonomie', value: '18 h' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'minuit', label: 'Minuit', swatch: '#2A2E33' },
        { id: 'lumiere-stellaire', label: 'Lumière stellaire', swatch: '#EBE4D8' },
        { id: 'rouge', label: 'PRODUCT(RED)', swatch: '#A32536' },
      ]),
      {
        id: 'taille',
        label: 'Boîtier',
        options: [
          { id: '41', label: '41 mm', priceDelta: 0, inStock: true },
          { id: '45', label: '45 mm', priceDelta: 40_000, inStock: true },
        ],
      },
    ],
    stock: 12,
    rating: 4.8,
    reviewCount: 143,
    releasedAt: '2024-09-22',
    featured: true,
    gallery: 3,
  },
  {
    slug: 'galaxy-watch6',
    name: 'Samsung Galaxy Watch6',
    brandId: 'samsung',
    category: 'objets-connectes',
    price: 245_000,
    tagline: 'Le suivi du sommeil qui sert vraiment.',
    description:
      "Analyse du sommeil détaillée avec coaching sur plusieurs semaines, composition corporelle et cardio en continu. Se recharge en 30 minutes pour une journée entière.",
    highlights: [
      'Analyse avancée du sommeil avec coaching',
      'Mesure de la composition corporelle',
      'Écran Super AMOLED 20 % plus grand',
      'Charge rapide : 30 min pour une journée',
    ],
    specs: [
      {
        label: 'Écran & boîtier',
        items: [
          { label: 'Taille', value: '40 mm ou 44 mm' },
          { label: 'Écran', value: 'Super AMOLED, 2 000 nits' },
          { label: 'Résistance', value: '5 ATM, IP68' },
        ],
      },
      {
        label: 'Santé',
        items: [
          { label: 'Capteurs', value: 'BioActive : cardio, ECG, bio-impédance' },
          { label: 'Autonomie', value: '40 h' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'graphite', label: 'Graphite', swatch: '#35353A' },
        { id: 'or', label: 'Or', swatch: '#C8A882' },
        { id: 'argent', label: 'Argent', swatch: '#D5D6D8' },
      ]),
      {
        id: 'taille',
        label: 'Boîtier',
        options: [
          { id: '40', label: '40 mm', priceDelta: 0, inStock: true },
          { id: '44', label: '44 mm', priceDelta: 25_000, inStock: true },
        ],
      },
    ],
    stock: 17,
    rating: 4.5,
    reviewCount: 108,
    releasedAt: '2024-08-11',
    gallery: 2,
  },
  {
    slug: 'xiaomi-smart-band-8',
    name: 'Xiaomi Smart Band 8',
    brandId: 'xiaomi',
    category: 'objets-connectes',
    price: 35_000,
    originalPrice: 44_000,
    tagline: 'Deux semaines sans chargeur.',
    description:
      "Le meilleur premier bracelet connecté : suivi du sommeil, 150 modes sportifs, écran AMOLED lumineux et une autonomie qui se compte en semaines.",
    highlights: [
      'Jusqu’à 16 jours d’autonomie',
      'AMOLED 1,62 pouce à 60 Hz',
      '150 modes sportifs',
      'Résistant à 5 ATM',
    ],
    specs: [
      {
        label: 'Caractéristiques',
        items: [
          { label: 'Écran', value: 'AMOLED 1,62 pouce' },
          { label: 'Autonomie', value: '16 jours en usage normal' },
          { label: 'Résistance', value: '5 ATM' },
          { label: 'Poids', value: '27 g' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#232326' },
        { id: 'or-rose', label: 'Or rose', swatch: '#D9A79A' },
      ]),
    ],
    stock: 63,
    rating: 4.3,
    reviewCount: 421,
    releasedAt: '2024-04-25',
    gallery: 2,
  },
  {
    slug: 'jbl-flip-6',
    name: 'JBL Flip 6',
    brandId: 'jbl',
    category: 'objets-connectes',
    price: 78_000,
    tagline: 'Étanche, robuste, sonore.',
    description:
      "Certifiée IP67 : elle survit au sable, à la pluie et à une chute dans la piscine. Douze heures d'autonomie et un vrai grave malgré sa taille.",
    highlights: [
      'Certification IP67, étanche et anti-poussière',
      '12 h d’autonomie',
      'Transducteur en course + double radiateur passif',
      'PartyBoost pour appairer deux enceintes',
    ],
    specs: [
      {
        label: 'Audio',
        items: [
          { label: 'Puissance', value: '30 W (20 W + 10 W)' },
          { label: 'Réponse en fréquence', value: '63 Hz – 20 kHz' },
        ],
      },
      {
        label: 'Autonomie & résistance',
        items: [
          { label: 'Autonomie', value: '12 h' },
          { label: 'Résistance', value: 'IP67' },
          { label: 'Poids', value: '550 g' },
        ],
      },
    ],
    variantGroups: [
      colorGroup([
        { id: 'noir', label: 'Noir', swatch: '#232326' },
        { id: 'bleu', label: 'Bleu', swatch: '#2F5FA8' },
        { id: 'rouge', label: 'Rouge', swatch: '#B33A34' },
        { id: 'kaki', label: 'Kaki', swatch: '#6B6B4E' },
      ]),
    ],
    stock: 29,
    rating: 4.6,
    reviewCount: 234,
    releasedAt: '2023-11-18',
    gallery: 2,
  },
];

export const productBySlug = new Map(products.map((product) => [product.slug, product]));

/** Fourchette de prix du catalogue — alimente les bornes du filtre. */
export const priceRange = {
  min: Math.min(...products.map((product) => product.price)),
  max: Math.max(...products.map((product) => product.price)),
};
