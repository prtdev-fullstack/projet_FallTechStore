import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, ShieldCheck, Sparkles, Truck, Zap } from 'lucide-react';
import { ROUTES, STORE } from '../constants/routes';
import { categories } from '../data/catalog';
import { bestSellers, dealsOfTheDay, newArrivals, products } from '../data/products';
import { discountPercent, formatPriceShort } from '../utils/format';
import { cn } from '../utils/cn';
import { CountUp, Marquee, Reveal, Stagger, StaggerItem } from '../components/motion';
import { ProductCard } from '../components/commerce/ProductCard';
import { ProductImage } from '../components/commerce/ProductImage';
import { Seo, storeJsonLd } from '../components/seo/Seo';

/* ==========================================================================
   Accueil — densité marketplace.

   Version précédente : un héros plein écran, une seule vedette produit et de
   longues sections narratives (chronologie, gros bloc d'appel à l'action).
   Correct pour une vitrine de marque, faux pour du e-commerce : sur Jumia ou
   Amazon, la page d'accueil EST un rayon — le plus de produits visibles, le
   plus vite possible, prix et remises en évidence.

   Cette version montre 30+ produits dès le premier écran ou presque : bandeau
   de catégories, bons plans du jour, meilleures ventes, nouveautés.
   ========================================================================== */

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

/* ── Bandeau promotionnel compact ─────────────────────────────────────── */

function PromoBanner() {
  const hero = dealsOfTheDay[0] ?? products[0];
  const discount = hero.originalPrice ? discountPercent(hero.originalPrice, hero.price) : 0;

  return (
    <section className="border-b border-border-subtle bg-gradient-to-r from-accent/[0.08] via-transparent to-transparent">
      <div className="container-page grid items-center gap-6 py-6 md:grid-cols-[1fr_auto] md:py-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-promo px-2 py-1 text-caption font-bold text-promo-fg">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Vente flash
          </span>
          <h1 className="mt-3 text-h2 leading-tight text-ink">
            {discount > 0 ? `Jusqu'à −${discount}%` : 'Bons plans du jour'} sur les smartphones et
            l'audio
          </h1>
          <p className="mt-2 max-w-lg text-body-s text-ink-secondary">
            {STORE.city}, livré en 48 h · Garantie {STORE.warrantyMonths} mois · Orange Money, Wave,
            Free Money ou paiement à la livraison.
          </p>
          <Link
            to={`${ROUTES.shop}?promo=1`}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-accent-solid px-5 text-body-s font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-solid-hover"
          >
            Voir toutes les promos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Link
          to={ROUTES.product(hero.slug)}
          className="group flex items-center gap-4 rounded-lg border border-border bg-elevated p-4 transition-colors hover:border-border-strong"
        >
          <span className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-sunken sm:h-24 sm:w-24">
            <ProductImage product={hero} size="thumb" priority />
          </span>
          <span className="min-w-0">
            <span className="line-clamp-1 block text-body-s font-semibold text-ink">{hero.name}</span>
            <span className="mt-1 flex items-baseline gap-2">
              <span className="tabular text-h4 font-bold text-ink">{formatPriceShort(hero.price)}</span>
              {hero.originalPrice && (
                <span className="tabular text-caption text-ink-tertiary line-through">
                  {formatPriceShort(hero.originalPrice)}
                </span>
              )}
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-accent-text">
              Voir l'offre
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

/* ── Bandeau de catégories ────────────────────────────────────────────── */

function CategoryStrip() {
  return (
    <section className="border-b border-border-subtle">
      <div className="container-page py-4">
        <div className="mask-fade-x -mx-5 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const sample = products.find((p) => p.category === category.id)!;
            const count = products.filter((p) => p.category === category.id).length;
            return (
              <Link
                key={category.id}
                to={`${ROUTES.shop}?categorie=${category.id}`}
                className="group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-md border border-transparent p-2 text-center transition-colors hover:border-border hover:bg-elevated"
              >
                <span className="h-16 w-16 overflow-hidden rounded-full bg-sunken transition-transform duration-fast group-hover:scale-105">
                  <ProductImage product={sample} size="thumb" />
                </span>
                <span className="line-clamp-1 text-caption font-medium text-ink">{category.name}</span>
                <span className="tabular text-[0.6875rem] text-ink-tertiary">{count} produits</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── En-tête de rayon compact ─────────────────────────────────────────── */

function ShelfHeading({
  icon: Icon,
  title,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  to: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-h4 text-ink">
        <Icon className="h-4 w-4 text-accent-text" />
        {title}
      </h2>
      <Link
        to={to}
        className="group flex min-h-[36px] items-center gap-1 text-caption font-semibold text-accent-text"
      >
        Tout voir
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ── Rayon (grille dense de produits) ─────────────────────────────────── */

function Shelf({
  icon,
  title,
  to,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  to: string;
  items: typeof products;
}) {
  return (
    <section className="container-page py-6 md:py-8">
      <ShelfHeading icon={icon} title={title} to={to} />
      <Stagger className={GRID} stagger={0.02} amount={0.1}>
        {items.map((product, index) => (
          <StaggerItem key={product.slug} className="h-full">
            <ProductCard product={product} priority={index < 6} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ── Bandeau de réassurance, une seule ligne ──────────────────────────── */

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, text: `Garantie ${STORE.warrantyMonths} mois` },
    { icon: Truck, text: `Livraison offerte dès ${formatPriceShort(STORE.freeShippingThreshold)}` },
    { icon: RotateCcw, text: `Retour sous ${STORE.returnDays} jours` },
    { icon: Sparkles, text: 'Produits scellés et authentiques' },
  ];

  return (
    <section className="border-y border-border-subtle bg-surface">
      <div className="container-page grid grid-cols-2 gap-4 py-5 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.text} className="flex items-center gap-2.5">
            <item.icon className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
            <span className="text-caption text-ink-secondary">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Chiffres compacts ─────────────────────────────────────────────────── */

function StatsStrip() {
  const stats = [
    { value: 12000, suffix: '+', label: 'clients servis' },
    { value: 38, suffix: '', label: 'produits en stock' },
    { value: 4.6, decimals: 1, suffix: '/5', label: 'note moyenne' },
    { value: 48, suffix: 'h', label: 'délai de livraison' },
  ];

  return (
    <section className="container-page py-8">
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-elevated py-5 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="tabular font-display text-h3 font-semibold text-ink">
              <CountUp to={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
            </p>
            <p className="mt-0.5 text-caption text-ink-tertiary">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Marques ─────────────────────────────────────────────────────────── */

function BrandStrip() {
  const brandNames = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Sony', 'JBL', 'Anker', 'Tecno', 'Infinix', 'Oppo'];
  return (
    <section aria-label="Marques distribuées" className="border-y border-border-subtle py-4">
      <Marquee speed={38}>
        {brandNames.map((name) => (
          <span
            key={name}
            className="select-none text-body font-semibold text-ink-tertiary/50 transition-colors duration-base hover:text-ink-secondary"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ========================================================================== */

export default function Home() {
  return (
    <div className={cn('overflow-x-clip')}>
      <Seo
        title="FallTech Store — Smartphones et high-tech authentiques au Sénégal"
        description="Smartphones, audio, accessoires et objets connectés authentiques à Dakar. Garantis 24 mois, livrés en 48 h partout au Sénégal. Orange Money, Wave, Free Money ou paiement à la livraison."
        path="/"
        jsonLd={storeJsonLd}
      />

      <PromoBanner />
      <CategoryStrip />

      <Reveal effect="fade">
        <Shelf icon={Zap} title="Bons plans du jour" to={`${ROUTES.shop}?promo=1`} items={dealsOfTheDay.slice(0, 12)} />
      </Reveal>

      <TrustStrip />

      <Reveal effect="fade">
        <Shelf
          icon={Sparkles}
          title="Meilleures ventes"
          to={`${ROUTES.shop}?tri=pertinence`}
          items={bestSellers.slice(0, 12)}
        />
      </Reveal>

      <StatsStrip />

      <Reveal effect="fade">
        <Shelf
          icon={ArrowRight}
          title="Nouveautés"
          to={`${ROUTES.shop}?tri=nouveautes`}
          items={newArrivals.slice(0, 12)}
        />
      </Reveal>

      <BrandStrip />
    </div>
  );
}
