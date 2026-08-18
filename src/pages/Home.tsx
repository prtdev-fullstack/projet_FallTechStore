import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, ShieldCheck, Sparkles, Truck, Zap } from 'lucide-react';
import type { Product } from '../types';
import { ROUTES } from '../constants/routes';
import { categories } from '../data/catalog';
import { useCatalogStore, computeDealsOfTheDay, computeNewArrivals } from '../store/catalog.store';
import { useSettingsStore, type StoreSettings } from '../store/settings.store';
import { discountPercent, formatPriceShort } from '../utils/format';
import { cn } from '../utils/cn';
import { CountUp, Marquee, Reveal, Stagger, StaggerItem } from '../components/motion';
import { ProductCard } from '../components/commerce/ProductCard';
import { VideoHero } from '../components/commerce/VideoHero';
import { SectionVideoBanner } from '../components/commerce/SectionVideoBanner';
import { RouteLoader } from '../components/brand/Loader';
import { Seo, buildStoreJsonLd } from '../components/seo/Seo';

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

function PromoBanner({
  products,
  dealsOfTheDay,
  settings,
}: {
  products: Product[];
  dealsOfTheDay: Product[];
  settings: StoreSettings;
}) {
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
            {settings.city}, livré en 48 h · Garantie {settings.warrantyMonths} mois · Orange Money, Wave,
            Free Money ou paiement à la livraison.
          </p>
          <Link
            to={`${ROUTES.shop}?promo=1`}
            className="mt-4 flex w-fit min-h-[44px] items-center gap-2 rounded-md bg-accent-solid px-5 text-body-s font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-solid-hover mx-auto md:mx-0"
          >
            Voir toutes les promos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Étonnée, elle pointe vers le texte de l'offre à sa gauche — la
            photo et la mise en page se répondent, ce n'est pas un hasard.
            Centrée et empilée sous le texte sur mobile (grille à une seule
            colonne) ; ancrée à droite en bas dès le passage à deux colonnes. */}
        <Link
          to={`${ROUTES.shop}?promo=1`}
          aria-label="Voir toutes les promotions"
          className="-mb-6 mx-auto md:mx-0 md:self-end md:-mb-8"
        >
          <img
            src="/promo-femme.webp"
            alt=""
            aria-hidden="true"
            width={488}
            height={700}
            className="h-40 w-auto object-contain object-bottom md:h-48 lg:h-56"
          />
        </Link>
      </div>
    </section>
  );
}

/* ── Bandeau de catégories ────────────────────────────────────────────── */

/** Photos de couverture dédiées, déposées par l'utilisateur — au format
 *  16:9 natif (960×540) : la vignette de la carte adopte ce même ratio
 *  plutôt qu'un carré, pour ne rien recadrer. */
const categoryCovers: Record<string, string> = {
  smartphones: '/category-smartphones.webp',
  audio: '/category-audio.webp',
  accessoires: '/category-accessoires.webp',
  'objets-connectes': '/category-objets-connectes.webp',
};

function CategoryStrip({ products }: { products: Product[] }) {
  return (
    <section className="border-b border-border-subtle">
      <div className="container-page py-6 md:py-8">
        {/* Grille pleine largeur, pas de bandeau défilant : 4 catégories,
            donc 4 colonnes dès sm — chacune occupe sa juste part de la
            section plutôt qu'une pastille de 104px perdue dans l'espace. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {categories.map((category) => {
            const count = products.filter((p) => p.category === category.id).length;
            return (
              <Link
                key={category.id}
                to={`${ROUTES.shop}?categorie=${category.id}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-elevated transition-colors hover:border-border-strong hover:shadow-2"
              >
                <span className="block aspect-video overflow-hidden bg-sunken">
                  <img
                    src={categoryCovers[category.id]}
                    alt=""
                    aria-hidden="true"
                    width={960}
                    height={540}
                    className="block h-full w-full object-cover transition-transform duration-base ease-out-expo group-hover:scale-110"
                  />
                </span>
                <span className="flex flex-col gap-0.5 p-4">
                  <span className="text-h4 text-ink">{category.name}</span>
                  <span className="tabular text-caption text-ink-tertiary">{count} produits</span>
                </span>
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
  items: Product[];
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

function TrustStrip({ settings }: { settings: StoreSettings }) {
  const items = [
    { icon: ShieldCheck, text: `Garantie ${settings.warrantyMonths} mois` },
    { icon: Truck, text: `Livraison offerte dès ${formatPriceShort(settings.freeShippingThreshold)}` },
    { icon: RotateCcw, text: `Retour sous ${settings.returnDays} jours` },
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

const BRANDS = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Sony', 'JBL', 'Anker', 'Tecno', 'Infinix', 'Oppo'].map(
  (name) => ({ name, slug: name.toLowerCase() }),
);

/** Vrai logo si présent (voir scripts/import-brand-logos.mjs), sinon repli
 *  sur le nom de la marque en texte — même principe que ProductImage pour
 *  les photos produit : un fichier manquant ne casse jamais l'affichage. */
function BrandLogo({ name, slug }: { name: string; slug: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="select-none text-body font-semibold text-ink-tertiary/50 transition-colors duration-base group-hover/logo:text-ink-secondary">
        {name}
      </span>
    );
  }

  return (
    <img
      src={`/brands/${slug}.webp`}
      alt={name}
      width={160}
      height={80}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-8 w-auto object-contain"
    />
  );
}

function BrandStrip() {
  return (
    <section aria-label="Marques distribuées" className="border-y border-border-subtle py-4">
      <Marquee speed={12} pauseOnHover={false}>
        {BRANDS.map((brand) => (
          <span key={brand.slug} className="group/logo flex shrink-0 items-center">
            <BrandLogo name={brand.name} slug={brand.slug} />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ========================================================================== */

export default function Home() {
  const products = useCatalogStore((state) => state.products);
  const isCatalogLoaded = useCatalogStore((state) => state.isLoaded);
  const settings = useSettingsStore((state) => state.settings);
  const dealsOfTheDay = useMemo(() => computeDealsOfTheDay(products), [products]);
  const newArrivals = useMemo(() => computeNewArrivals(products), [products]);
  const jsonLd = useMemo(() => buildStoreJsonLd(settings), [settings]);

  // Le catalogue vient désormais de l'API (voir catalog.store.ts) : le
  // premier rendu peut précéder la réponse, `products` est alors vide et
  // `PromoBanner` n'a pas de produit vedette à afficher.
  if (!isCatalogLoaded) return <RouteLoader />;

  return (
    <div className={cn('overflow-x-clip')}>
      <Seo
        title="FallTech Store — Smartphones et high-tech authentiques au Sénégal"
        description="Smartphones, audio, accessoires et objets connectés authentiques à Dakar. Garantis 24 mois, livrés en 48 h partout au Sénégal. Orange Money, Wave, Free Money ou paiement à la livraison."
        path="/"
        jsonLd={jsonLd}
      />

      <VideoHero />
      <PromoBanner products={products} dealsOfTheDay={dealsOfTheDay} settings={settings} />
      <CategoryStrip products={products} />

      <SectionVideoBanner
        to={`${ROUTES.shop}?promo=1`}
        ariaLabel="Découvrir les bons plans du jour"
        poster="/video/deal-poster.jpg"
        webm="/video/deal.webm"
        mp4="/video/deal.mp4"
        fallbackAlt="Bons plans du jour chez FallTech Store"
      />

      <Reveal effect="fade">
        <Shelf icon={Zap} title="Bons plans du jour" to={`${ROUTES.shop}?promo=1`} items={dealsOfTheDay.slice(0, 6)} />
      </Reveal>

      <TrustStrip settings={settings} />

      <StatsStrip />

      <SectionVideoBanner
        to={`${ROUTES.shop}?tri=nouveautes`}
        ariaLabel="Découvrir les nouveautés"
        poster="/video/new-poster.jpg"
        webm="/video/new.webm"
        mp4="/video/new.mp4"
        fallbackAlt="Nouveautés chez FallTech Store"
      />

      <Reveal effect="fade">
        <Shelf
          icon={ArrowRight}
          title="Nouveautés"
          to={`${ROUTES.shop}?tri=nouveautes`}
          items={newArrivals.slice(0, 6)}
        />
      </Reveal>

      <BrandStrip />
    </div>
  );
}
