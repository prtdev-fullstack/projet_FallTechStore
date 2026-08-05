import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Quote, Sparkles } from 'lucide-react';
import { ROUTES, STORE } from '../constants/routes';
import { brands, categories } from '../data/catalog';
import { products } from '../data/products';
import { featuredReviews } from '../data/reviews';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { formatDate, formatPriceShort } from '../utils/format';
import { cn } from '../utils/cn';
import { Badge, Button, Rating } from '../components/ui';
import { CountUp, Magnetic, Marquee, Parallax, Reveal, Stagger, StaggerItem, TextReveal, Tilt } from '../components/motion';
import { ProductCard } from '../components/commerce/ProductCard';
import { ProductImage } from '../components/commerce/ProductImage';
import { Seo, storeJsonLd } from '../components/seo/Seo';

/* ========================================================================== */
/*  Héros                                                                     */
/* ========================================================================== */

const HERO_PRODUCT = products.find((p) => p.slug === 'iphone-15-pro-max')!;

const STATS = [
  { value: 12000, suffix: '+', label: 'clients servis' },
  { value: 4.8, decimals: 1, suffix: '/5', label: 'note moyenne' },
  { value: 48, suffix: ' h', label: 'délai de livraison' },
  { value: 24, suffix: ' mois', label: 'de garantie' },
];

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Le héros s'efface et recule légèrement en sortant : la page semble avoir
  // de la profondeur, sans détourner le défilement.
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Halo Aurora — animé en transform uniquement, donc composé par le GPU. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-18%] h-[560px] w-[560px] -translate-x-1/2 animate-aurora-drift rounded-full bg-aurora-radial blur-3xl md:left-[62%] md:h-[720px] md:w-[720px]"
      />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

      <motion.div
        style={prefersReducedMotion ? undefined : { opacity, scale, y }}
        className="container-page relative grid items-center gap-12 pb-20 pt-14 md:pb-28 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-24"
      >
        {/* Colonne texte */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge tone="accent" icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}>
              Nouveau · {HERO_PRODUCT.name}
            </Badge>
          </motion.div>

          <h1 className="mt-6 text-display-xl text-ink">
            <TextReveal text="La tech," immediate delay={0.15} className="block" />
            <TextReveal text="sans le" immediate delay={0.28} className="block" />
            <span className="block">
              <TextReveal text="superflu." immediate delay={0.41} className="text-aurora" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-7 max-w-xl text-balance text-body-l text-ink-secondary"
          >
            Smartphones, audio et accessoires authentiques à {STORE.city}. Scellés, facturés,
            garantis {STORE.warrantyMonths} mois. Livrés en 48 h partout au {STORE.country}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.82 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Magnetic>
              <Button
                to={ROUTES.product(HERO_PRODUCT.slug)}
                size="lg"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                block
              >
                Acheter maintenant
              </Button>
            </Magnetic>
            <Magnetic>
              <Button to={ROUTES.shop} size="lg" variant="secondary" block>
                Découvrir le catalogue
              </Button>
            </Magnetic>
          </motion.div>

          {/* Chiffres clés */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-border-subtle pt-8 sm:grid-cols-4"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-h3 font-semibold text-ink">
                    <CountUp to={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                  </span>
                  <span className="mt-1 block text-caption text-ink-tertiary">{stat.label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Colonne visuelle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto w-full max-w-md lg:max-w-none"
        >
          <Parallax distance={26}>
            <Tilt max={8}>
              <Link
                to={ROUTES.product(HERO_PRODUCT.slug)}
                className="block rounded-xl"
                aria-label={`Voir ${HERO_PRODUCT.name}`}
              >
                <ProductImage product={HERO_PRODUCT} priority />
              </Link>
            </Tilt>
          </Parallax>

          {/* Étiquette de prix flottante */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.05 }}
            className="absolute bottom-4 right-0 rounded-lg border border-border bg-surface/85 px-4 py-3 shadow-2 backdrop-blur-xl sm:right-4"
          >
            <p className="text-caption text-ink-tertiary">à partir de</p>
            <p className="tabular font-display text-h4 font-semibold text-ink">
              {formatPriceShort(HERO_PRODUCT.price)}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ========================================================================== */
/*  Bandeau des marques                                                       */
/* ========================================================================== */

function BrandStrip() {
  return (
    <section aria-label="Marques distribuées" className="border-y border-border-subtle py-8">
      <Marquee speed={42}>
        {brands.map((brand) => (
          <span
            key={brand.id}
            className="select-none font-display text-h3 font-semibold text-ink-tertiary/60 transition-colors duration-base hover:text-ink-secondary"
          >
            {brand.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ========================================================================== */
/*  En-tête de section réutilisable                                           */
/* ========================================================================== */

function SectionHeading({
  overline,
  title,
  description,
  action,
}: {
  overline: string;
  title: string;
  description?: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Reveal effect="fade">
          <p className="text-overline uppercase text-accent-text">{overline}</p>
        </Reveal>
        <h2 className="mt-3 text-h2 text-ink">
          <TextReveal text={title} />
        </h2>
        {description && (
          <Reveal effect="up" delay={0.1}>
            <p className="mt-4 text-balance text-body text-ink-secondary">{description}</p>
          </Reveal>
        )}
      </div>
      {action && (
        <Reveal effect="up" delay={0.15}>
          <Link
            to={action.to}
            className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 text-body-s font-semibold text-ink transition-colors duration-fast hover:text-accent-text"
          >
            {action.label}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-base ease-out-expo group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      )}
    </div>
  );
}

/* ========================================================================== */
/*  Nouveautés — carrousel horizontal                                         */
/* ========================================================================== */

function NewArrivals() {
  const latest = [...products]
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
    .slice(0, 8);

  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        overline="Arrivages"
        title="Les dernières nouveautés"
        description="Les derniers modèles reçus en boutique, tous disponibles immédiatement."
        action={{ label: 'Voir tout le catalogue', to: ROUTES.shop }}
      />

      {/* Défilement horizontal avec accroche : sur mobile c'est le geste
          naturel, sur desktop cela évite une grille de huit cartes qui écrase
          le reste de la page. */}
      <div className="mask-fade-x -mx-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden">
        <Stagger className="flex snap-x snap-mandatory gap-5" stagger={0.05}>
          {latest.map((product) => (
            <StaggerItem
              key={product.slug}
              className="w-[264px] shrink-0 snap-start sm:w-[288px]"
            >
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Grille bento                                                              */
/* ========================================================================== */

function BentoSection() {
  const bestSeller = products.find((p) => p.slug === 'iphone-13')!;
  const promo = products.filter((p) => p.originalPrice).slice(0, 1)[0];
  const audio = products.find((p) => p.slug === 'sony-wh-1000xm5')!;

  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        overline="Sélection"
        title="Ce que nos clients achètent"
        description="Trois familles de produits, trois raisons de nous faire confiance."
      />

      <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
        {/* Grande carte — meilleure vente */}
        <Reveal effect="scale" className="lg:col-span-2 lg:row-span-2">
          <Link
            to={ROUTES.product(bestSeller.slug)}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-elevated p-8 transition-all duration-base ease-out-expo hover:border-border-strong hover:shadow-2 md:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-aurora-radial opacity-60 blur-2xl transition-opacity duration-slow group-hover:opacity-100"
            />

            <div className="relative">
              <Badge tone="aurora">Meilleure vente</Badge>
              <h3 className="mt-5 max-w-md text-display-m text-ink">{bestSeller.name}</h3>
              <p className="mt-4 max-w-sm text-body text-ink-secondary">{bestSeller.tagline}</p>
              <div className="mt-6 flex items-center gap-4">
                <span className="tabular font-display text-h3 font-semibold text-ink">
                  {formatPriceShort(bestSeller.price)}
                </span>
                {bestSeller.originalPrice && (
                  <s className="tabular text-body-s text-ink-tertiary">
                    {formatPriceShort(bestSeller.originalPrice)}
                  </s>
                )}
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-body-s font-semibold text-accent-text">
                Voir la fiche
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>

            <div className="relative mt-8 h-56 self-end md:h-72 lg:h-80">
              <div className="h-full transition-transform duration-slow ease-out-expo group-hover:scale-105">
                <ProductImage product={bestSeller} />
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Carte promotion */}
        {promo && (
          <Reveal effect="up" delay={0.08}>
            <Link
              to={`${ROUTES.shop}?promo=1`}
              className="group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-promo/40 bg-promo/[0.06] p-7 transition-all duration-base ease-out-expo hover:border-promo hover:shadow-glow-promo"
            >
              <div>
                <Badge tone="promo">Promotions</Badge>
                <h3 className="mt-4 text-h3 text-ink">Jusqu'à −20 %</h3>
                <p className="mt-3 text-body-s text-ink-secondary">
                  Sur une sélection de smartphones et d'accessoires, tant qu'il y a du stock.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-body-s font-semibold text-promo">
                Voir les offres
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-base ease-out-expo group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </Reveal>
        )}

        {/* Carte audio */}
        <Reveal effect="up" delay={0.14}>
          <Link
            to={`${ROUTES.shop}?categorie=audio`}
            className="group relative flex h-full items-center gap-5 overflow-hidden rounded-xl border border-border bg-elevated p-7 transition-all duration-base ease-out-expo hover:border-border-strong hover:shadow-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-overline uppercase text-ink-tertiary">Audio</p>
              <h3 className="mt-2 text-h3 text-ink">Le silence, à la demande</h3>
              <p className="mt-3 text-body-s text-ink-secondary">
                Casques et écouteurs à réduction de bruit active.
              </p>
            </div>
            <div className="h-28 w-28 shrink-0 transition-transform duration-slow ease-out-expo group-hover:scale-110">
              <ProductImage product={audio} glow={false} />
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Catégories                                                                */
/* ========================================================================== */

function CategoryGrid() {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading overline="Rayons" title="Explorer par catégorie" />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
        {categories.map((category) => {
          const sample = products.find((product) => product.category === category.id)!;
          const count = products.filter((product) => product.category === category.id).length;

          return (
            <StaggerItem key={category.id}>
              <Link
                to={`${ROUTES.shop}?categorie=${category.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-elevated p-6 transition-all duration-base ease-out-expo hover:-translate-y-1 hover:border-border-strong hover:shadow-2"
              >
                <div className="mx-auto h-32 w-32 transition-transform duration-slow ease-out-expo group-hover:scale-110">
                  <ProductImage product={sample} glow={false} />
                </div>
                <h3 className="mt-4 text-h4 text-ink">{category.name}</h3>
                <p className="mt-2 flex-1 text-caption leading-relaxed text-ink-tertiary">
                  {category.tagline}
                </p>
                <p className="tabular mt-4 text-caption font-semibold text-accent-text">
                  {count} produits
                </p>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

/* ========================================================================== */
/*  Pourquoi FallTech — ligne qui se trace au scroll                          */
/* ========================================================================== */

const REASONS = [
  {
    title: 'Des produits authentiques',
    text: "Tous nos appareils sont neufs, scellés et accompagnés d'une facture. Aucun reconditionné vendu comme neuf, aucune importation grise.",
  },
  {
    title: `Garantie ${STORE.warrantyMonths} mois, sans astérisque`,
    text: 'La même durée sur un chargeur à 12 000 F que sur un iPhone à 1 150 000 F. La prise en charge se fait en boutique, sans envoi à l’étranger.',
  },
  {
    title: 'Livraison en 48 heures',
    text: `Offerte dès ${formatPriceShort(STORE.freeShippingThreshold)}. Dakar en 24 h, régions en 72 h maximum, avec un suivi par téléphone.`,
  },
  {
    title: 'Un interlocuteur, pas un formulaire',
    text: 'Une question avant l’achat, un problème après : vous parlez à quelqu’un qui connaît le produit, du lundi au samedi.',
  },
];

function WhySection() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'end 60%'],
  });

  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        overline="Nos engagements"
        title="Pourquoi acheter chez FallTech"
        description="Quatre promesses simples, vérifiables, et tenues depuis 2021."
      />

      <div ref={ref} className="relative">
        {/* Ligne verticale qui se remplit au fil du défilement — le fil
            conducteur littéral de la section. */}
        <div
          aria-hidden="true"
          className="absolute left-[15px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border md:block"
        >
          <motion.div
            className="h-full w-full origin-top bg-aurora"
            style={prefersReducedMotion ? { scaleY: 1 } : { scaleY: scrollYProgress }}
          />
        </div>

        <ol className="flex flex-col gap-12 md:gap-16">
          {REASONS.map((reason, index) => (
            <li key={reason.title}>
              <Reveal effect="up" delay={0.05}>
                <div className="grid gap-4 md:grid-cols-[32px_1fr] md:gap-8">
                  <span className="tabular flex h-8 w-8 items-center justify-center rounded-full border border-border bg-canvas font-mono text-caption font-semibold text-accent-text">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="max-w-2xl">
                    <h3 className="text-h3 text-ink">{reason.title}</h3>
                    <p className="mt-3 text-body leading-relaxed text-ink-secondary">
                      {reason.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Avis clients                                                              */
/* ========================================================================== */

function ReviewsSection() {
  return (
    <section className="border-y border-border-subtle bg-surface py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          overline="Preuves"
          title="Ce qu’en disent nos clients"
          description="Avis vérifiés, publiés sans filtre ni sélection."
        />

        <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
          {featuredReviews.map((review) => (
            <StaggerItem key={review.id}>
              <figure className="flex h-full flex-col rounded-lg border border-border bg-elevated p-6">
                <Quote className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <blockquote className="mt-4 flex-1">
                  <p className="text-body-s font-semibold text-ink">{review.title}</p>
                  <p className="mt-3 line-clamp-5 text-body-s leading-relaxed text-ink-secondary">
                    {review.body}
                  </p>
                </blockquote>
                <figcaption className="mt-6 border-t border-border-subtle pt-4">
                  <Rating value={review.rating} showValue={false} />
                  <p className="mt-2 text-caption text-ink">
                    {review.author}
                    <span className="text-ink-tertiary"> · {review.city}</span>
                  </p>
                  <p className="text-caption text-ink-tertiary">{formatDate(review.date)}</p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Appel à l'action final                                                    */
/* ========================================================================== */

function FinalCTA() {
  return (
    <section className="container-page py-24 md:py-32">
      <Reveal effect="scale">
        <div className="relative overflow-hidden rounded-xl border border-border bg-elevated px-6 py-16 text-center md:px-16 md:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 animate-aurora-drift rounded-full bg-aurora-radial blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-display-m text-ink">
              <TextReveal text="Un conseil avant d’acheter ?" />
            </h2>
            <Reveal effect="up" delay={0.15}>
              <p className="mx-auto mt-5 max-w-lg text-balance text-body-l text-ink-secondary">
                Dites-nous votre budget et votre usage, on vous oriente vers le bon modèle. Sans
                vous pousser vers le plus cher.
              </p>
            </Reveal>
            <Reveal effect="up" delay={0.25}>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Magnetic>
                  <Button to={ROUTES.contact} size="lg" block>
                    Nous écrire
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button href={`tel:${STORE.phone.replace(/\s/g, '')}`} size="lg" variant="secondary" block>
                    {STORE.phone}
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>
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
      <Hero />
      <BrandStrip />
      <NewArrivals />
      <BentoSection />
      <CategoryGrid />
      <WhySection />
      <ReviewsSection />
      <FinalCTA />
    </div>
  );
}
