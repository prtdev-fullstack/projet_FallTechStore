import { useEffect } from 'react';
import { STORE } from '../../constants/routes';

/* ==========================================================================
   Métadonnées de page et données structurées.

   La version d'origine n'avait qu'un <title> statique dans index.html : toutes
   les pages partageaient le même titre, aucune n'avait de description propre, et
   un partage sur WhatsApp ou LinkedIn n'affichait aucun aperçu.

   Implémentation maison plutôt qu'une bibliothèque : sur une application rendue
   côté client, gérer les balises `head` tient en quelques lignes. Cela évite une
   dépendance de plus dans le bundle, et surtout react-helmet-async n'injectait
   rien du tout dans notre configuration React 18.

   Chaque balise posée est marquée `data-seo` : au démontage, on retire
   exactement ce qu'on a ajouté, sans jamais toucher aux balises statiques
   d'index.html.
   ========================================================================== */

const SITE_URL = 'https://falltechstore.sn';
const MARKER = 'data-seo';

interface SeoProps {
  title: string;
  description: string;
  /** Chemin absolu de la page, sans le domaine. */
  path?: string;
  type?: 'website' | 'product';
  /** Bloc JSON-LD ou tableau de blocs (Product, BreadcrumbList…). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

/** Crée une balise marquée, ou met à jour celle qui existe déjà. */
function setTag(
  tagName: 'meta' | 'link',
  attributes: Record<string, string>,
  identifier: string,
): HTMLElement {
  const selector = `${tagName}[${MARKER}="${identifier}"]`;
  let element = document.head.querySelector<HTMLElement>(selector);

  if (!element) {
    element = document.createElement(tagName);
    element.setAttribute(MARKER, identifier);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
  return element;
}

export function Seo({ title, description, path = '', type = 'website', jsonLd, noIndex }: SeoProps) {
  // Le nom du site n'est ajouté que s'il n'y figure pas déjà : évite
  // « FallTech Store — FallTech Store » sur la page d'accueil.
  const fullTitle = title.includes(STORE.name) ? title : `${title} — ${STORE.name}`;
  const canonical = `${SITE_URL}${path}`;
  const serializedJsonLd = jsonLd ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : '';

  useEffect(() => {
    document.title = fullTitle;

    setTag('meta', { name: 'description', content: description }, 'description');
    setTag('link', { rel: 'canonical', href: canonical }, 'canonical');

    setTag('meta', { property: 'og:title', content: fullTitle }, 'og:title');
    setTag('meta', { property: 'og:description', content: description }, 'og:description');
    setTag('meta', { property: 'og:url', content: canonical }, 'og:url');
    setTag(
      'meta',
      { property: 'og:type', content: type === 'product' ? 'product' : 'website' },
      'og:type',
    );

    setTag('meta', { name: 'twitter:title', content: fullTitle }, 'twitter:title');
    setTag('meta', { name: 'twitter:description', content: description }, 'twitter:description');

    // `robots` n'est posé que sur les pages à exclure, et retiré ensuite :
    // laisser un `noindex` traîner après navigation désindexerait tout le site.
    const robots = document.head.querySelector(`meta[${MARKER}="robots"]`);
    if (noIndex) setTag('meta', { name: 'robots', content: 'noindex, nofollow' }, 'robots');
    else robots?.remove();

    let ldScript: HTMLScriptElement | null = null;
    if (serializedJsonLd) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.setAttribute(MARKER, 'jsonld');
      ldScript.textContent = serializedJsonLd;
      document.head.appendChild(ldScript);
    }

    return () => {
      // Le JSON-LD est propre à une page : il doit disparaître en la quittant,
      // sinon une fiche produit laisserait ses données sur le catalogue.
      ldScript?.remove();
    };
  }, [fullTitle, description, canonical, type, noIndex, serializedJsonLd]);

  return null;
}

/* ── Constructeurs de données structurées ──────────────────────────────── */

/** Identité de la boutique — injectée une fois, depuis la page d'accueil. */
export const storeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: STORE.name,
  slogan: STORE.tagline,
  url: SITE_URL,
  telephone: STORE.phone,
  email: STORE.email,
  priceRange: '8 000 – 1 540 000 FCFA',
  currenciesAccepted: 'XOF',
  paymentAccepted: 'Orange Money, Wave, Free Money, Carte bancaire, Espèces',
  openingHours: 'Mo-Sa 09:00-20:00',
  address: {
    '@type': 'PostalAddress',
    streetAddress: STORE.address,
    addressLocality: STORE.city,
    addressCountry: 'SN',
  },
};

export function productJsonLd(product: {
  name: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produit/${product.slug}`,
      priceCurrency: 'XOF',
      price: product.price,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
    },
  };
}

export function breadcrumbJsonLd(items: { label: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
