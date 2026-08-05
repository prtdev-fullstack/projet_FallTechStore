import type { Brand, Category, PaymentMethod, ShippingMethod } from '../types';

export const categories: Category[] = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    tagline: 'Des modèles d’entrée de gamme aux flagships, tous scellés et garantis 24 mois.',
  },
  {
    id: 'audio',
    name: 'Audio',
    tagline: 'Écouteurs, casques et enceintes — réduction de bruit et autonomie réelle.',
  },
  {
    id: 'accessoires',
    name: 'Accessoires',
    tagline: 'Charge, protection et câbles certifiés. Ce qui dure, pas ce qui coûte le moins.',
  },
  {
    id: 'objets-connectes',
    name: 'Objets connectés',
    tagline: 'Montres et bracelets qui tiennent la semaine, pas la journée.',
  },
];

export const brands: Brand[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'google', name: 'Google' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'tecno', name: 'Tecno' },
  { id: 'infinix', name: 'Infinix' },
  { id: 'sony', name: 'Sony' },
  { id: 'jbl', name: 'JBL' },
  { id: 'anker', name: 'Anker' },
];

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'domicile',
    label: 'Livraison à domicile',
    description: 'Dakar et banlieue. Régions sous 72 h.',
    price: 3000,
    delay: '24 – 48 h',
  },
  {
    id: 'relais',
    label: 'Point relais',
    description: 'Plus de 40 points partenaires à Dakar, Thiès et Saint-Louis.',
    price: 1500,
    delay: '48 h',
  },
  {
    id: 'retrait',
    label: 'Retrait en boutique',
    description: 'Sacré-Cœur 3, VDN — du lundi au samedi, 9h – 20h.',
    price: 0,
    delay: 'Sous 2 h',
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'orange-money',
    label: 'Orange Money',
    description: 'Validation par code USSD sur votre téléphone',
  },
  { id: 'wave', label: 'Wave', description: 'Paiement instantané, sans frais' },
  { id: 'free-money', label: 'Free Money', description: 'Débit immédiat sur votre compte' },
  { id: 'carte', label: 'Carte bancaire', description: 'Visa et Mastercard, paiement sécurisé 3-D Secure' },
  {
    id: 'livraison',
    label: 'Paiement à la livraison',
    description: 'Espèces au livreur. Dakar et banlieue uniquement.',
  },
];

export const brandById = new Map(brands.map((brand) => [brand.id, brand]));
export const categoryById = new Map(categories.map((category) => [category.id, category]));
