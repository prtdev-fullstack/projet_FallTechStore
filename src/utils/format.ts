/* ==========================================================================
   Formatage — marché sénégalais, franc CFA (XOF)
   Le XOF n'a pas de sous-unité : jamais de décimales.
   ========================================================================== */

const LOCALE = 'fr-SN';

/** Espace fine insécable : « 780 000 » ne se coupe jamais en fin de ligne. */
const NBSP = ' ';

const numberFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
});

/**
 * Prix complet : `formatPrice(780000)` → « 780 000 F CFA »
 */
export function formatPrice(value: number): string {
  return `${numberFormatter.format(Math.round(value)).replace(/\s/g, NBSP)}${NBSP}F${NBSP}CFA`;
}

/**
 * Prix court, pour les espaces contraints (cartes denses, filtres).
 * `formatPriceShort(780000)` → « 780 000 F »
 */
export function formatPriceShort(value: number): string {
  return `${numberFormatter.format(Math.round(value)).replace(/\s/g, NBSP)}${NBSP}F`;
}

/**
 * Prix compact pour les curseurs de filtre.
 * `formatPriceCompact(1500000)` → « 1,5 M F » · `formatPriceCompact(50000)` → « 50 k F »
 */
export function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const label = millions % 1 === 0 ? String(millions) : millions.toFixed(1).replace('.', ',');
    return `${label}${NBSP}M${NBSP}F`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}${NBSP}k${NBSP}F`;
  }
  return `${value}${NBSP}F`;
}

/** Nombre simple : `formatNumber(12000)` → « 12 000 » */
export function formatNumber(value: number): string {
  return numberFormatter.format(value).replace(/\s/g, NBSP);
}

/** Note sur 5 avec une décimale : `formatRating(4.8)` → « 4,8 » */
export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

/** Pourcentage de remise, arrondi : `discountPercent(850000, 780000)` → 8 */
export function discountPercent(originalPrice: number, price: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** Date longue en français : « 5 août 2026 » */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Numéro de commande lisible : « FT-2026-0847 » */
export function formatOrderNumber(sequence: number, year = new Date().getFullYear()): string {
  return `FT-${year}-${String(sequence).padStart(4, '0')}`;
}
