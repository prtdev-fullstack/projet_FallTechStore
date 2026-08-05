import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { ROUTES, STORE } from '../constants/routes';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { formatPriceShort } from '../utils/format';
import { Accordion, Breadcrumb, Button } from '../components/ui';
import { CountUp, Parallax, Reveal, Stagger, StaggerItem, TextReveal } from '../components/motion';
import { Seo } from '../components/seo/Seo';

const MILESTONES = [
  {
    year: '2021',
    title: 'Une boutique, une vitrine',
    text: "FallTech ouvre à Sacré-Cœur avec une trentaine de références et une règle simple : ne vendre que ce que l'on utiliserait soi-même.",
  },
  {
    year: '2023',
    title: 'La garantie 24 mois pour tout',
    text: "Nous étendons la garantie à l'ensemble du catalogue, du câble au flagship. La prise en charge se fait sur place, sans envoi à l'étranger.",
  },
  {
    year: '2025',
    title: 'Livraison dans tout le Sénégal',
    text: 'Partenariat avec un réseau de points relais à Dakar, Thiès et Saint-Louis. Les régions sont livrées sous 72 heures.',
  },
  {
    year: '2026',
    title: 'La boutique en ligne',
    text: 'Le catalogue complet devient consultable et commandable en ligne, avec Orange Money, Wave, Free Money et le paiement à la livraison.',
  },
];

const FAQ = [
  {
    id: 'garantie',
    question: `Comment fonctionne la garantie ${STORE.warrantyMonths} mois ?`,
    answer:
      "Tous nos produits sont garantis 24 mois à compter de la date d'achat figurant sur la facture. En cas de panne, ramenez l'appareil en boutique : nous prenons en charge le diagnostic et la réparation. Si la réparation n'est pas possible, l'appareil est remplacé.",
  },
  {
    id: 'livraison',
    question: 'Quels sont les délais et les frais de livraison ?',
    answer: `Dakar et sa banlieue sont livrés en 24 à 48 heures pour 3 000 F. Les autres régions sont livrées sous 72 heures. La livraison est offerte dès ${formatPriceShort(STORE.freeShippingThreshold)} d'achat. Le retrait en boutique est gratuit et disponible sous 2 heures.`,
  },
  {
    id: 'retours',
    question: `Puis-je retourner un produit ?`,
    answer: `Oui, sous ${STORE.returnDays} jours, sans avoir à vous justifier, à condition que le produit soit dans son emballage d'origine et complet. Le remboursement est effectué sous 5 jours ouvrés par le même moyen que le paiement.`,
  },
  {
    id: 'authenticite',
    question: 'Vos produits sont-ils authentiques ?',
    answer:
      "Tous nos appareils sont neufs, scellés en usine, et accompagnés d'une facture. Nous ne vendons aucun produit reconditionné présenté comme neuf. Les numéros de série sont vérifiables auprès des constructeurs.",
  },
  {
    id: 'paiement',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Orange Money, Wave, Free Money, carte bancaire Visa et Mastercard, et le paiement à la livraison en espèces à Dakar et en banlieue.',
  },
];

export default function About() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 70%', 'end 65%'],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="overflow-x-clip">
      <div className="container-page py-8 md:py-12">
        <Seo
          title="À propos — FallTech Store à Dakar"
          description="Depuis 2021 à Sacré-Cœur : produits scellés et facturés, garantie 24 mois sur tout le catalogue, livraison 48 h dans tout le Sénégal."
          path="/a-propos"
        />
        <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'À propos' }]} />
      </div>

      {/* En-tête */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 animate-aurora-drift rounded-full bg-aurora-radial blur-3xl"
        />
        <div className="container-page relative pb-20 pt-6 text-center md:pb-28">
          <p className="text-overline uppercase text-accent-text">Depuis 2021 à Dakar</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-display-l text-ink">
            <TextReveal text="On vend de la tech." immediate className="block" />
            <TextReveal text="Pas des promesses." immediate delay={0.18} className="block text-aurora" />
          </h1>
          <Reveal effect="up" delay={0.4}>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-body-l text-ink-secondary">
              FallTech Store est né d'un constat simple : à Dakar, acheter un smartphone relevait
              trop souvent du pari. Origine incertaine, garantie floue, service après-vente
              inexistant. Nous avons ouvert une boutique pour que ce ne soit plus le cas.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Chiffres */}
      <section className="border-y border-border-subtle bg-surface">
        <div className="container-page grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
          {[
            { to: 12000, suffix: '+', label: 'clients depuis 2021' },
            { to: 24, suffix: '', label: 'références en catalogue' },
            { to: 98, suffix: ' %', label: 'de commandes livrées à l’heure' },
            { to: 4.8, decimals: 1, suffix: '/5', label: 'note moyenne des avis' },
          ].map((stat) => (
            <Reveal key={stat.label} effect="up">
              <div>
                <p className="font-display text-display-m font-semibold text-ink">
                  <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-body-s text-ink-tertiary">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Chronologie */}
      <section className="container-page py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="text-overline uppercase text-accent-text">Notre parcours</p>
          <h2 className="mt-3 text-h2 text-ink">
            <TextReveal text="Cinq ans, une seule règle" />
          </h2>
        </div>

        <div ref={timelineRef} className="relative">
          <div
            aria-hidden="true"
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border md:block"
          >
            <motion.div
              className="h-full w-full origin-top bg-aurora"
              style={prefersReducedMotion ? { scaleY: 1 } : { scaleY: lineScale }}
            />
          </div>

          <ol className="flex flex-col gap-14">
            {MILESTONES.map((milestone) => (
              <li key={milestone.year}>
                <Reveal effect="up">
                  <div className="grid gap-4 md:grid-cols-[16px_1fr] md:gap-10">
                    <span
                      className="mt-2 hidden h-4 w-4 rounded-full border-2 border-canvas bg-accent md:block"
                      aria-hidden="true"
                    />
                    <div className="max-w-2xl">
                      <p className="font-mono text-caption font-semibold text-accent-text">
                        {milestone.year}
                      </p>
                      <h3 className="mt-2 text-h3 text-ink">{milestone.title}</h3>
                      <p className="mt-3 text-body leading-relaxed text-ink-secondary">
                        {milestone.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Engagements */}
      <section className="border-y border-border-subtle bg-surface py-20 md:py-28">
        <div className="container-page">
          <h2 className="text-h2 text-ink">
            <TextReveal text="Trois engagements, sans astérisque" />
          </h2>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.09}>
            {[
              {
                id: 'garantie',
                icon: ShieldCheck,
                title: `Garantie ${STORE.warrantyMonths} mois`,
                text: 'La même durée sur un câble que sur un flagship. Prise en charge sur place, sans envoi à l’étranger.',
              },
              {
                id: 'livraison',
                icon: Truck,
                title: 'Livraison 24 – 48 h',
                text: `Offerte dès ${formatPriceShort(STORE.freeShippingThreshold)}. Dakar en 24 h, régions en 72 h, avec un appel avant le passage.`,
              },
              {
                id: 'retours',
                icon: RotateCcw,
                title: `Retour sous ${STORE.returnDays} jours`,
                text: 'Sans justification, remboursement intégral sous 5 jours ouvrés par le moyen de paiement d’origine.',
              },
            ].map((item) => (
              <StaggerItem key={item.id}>
                <div id={item.id} className="h-full rounded-xl border border-border bg-elevated p-7">
                  <item.icon className="h-6 w-6 text-accent-text" aria-hidden="true" />
                  <h3 className="mt-5 text-h3 text-ink">{item.title}</h3>
                  <p className="mt-3 text-body-s leading-relaxed text-ink-secondary">{item.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Questions fréquentes */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-overline uppercase text-accent-text">Questions fréquentes</p>
            <h2 className="mt-3 text-h2 text-ink">Tout ce qu'on nous demande</h2>
            <Parallax distance={18}>
              <p className="mt-5 text-body text-ink-secondary">
                Une question qui n'est pas là ? Appelez-nous, on répond du lundi au samedi.
              </p>
            </Parallax>
            <Button to={ROUTES.contact} variant="secondary" className="mt-7">
              Nous contacter
            </Button>
          </div>

          <Accordion items={FAQ} />
        </div>
      </section>
    </div>
  );
}
