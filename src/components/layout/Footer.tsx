import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { FOOTER_NAV, ROUTES, STORE } from '../../constants/routes';
import { formatPriceShort } from '../../utils/format';
import { Button, Input } from '../ui';
import { toast } from '../ui/Toast';
import { Logo } from '../brand/Logo';
import { Reveal } from '../motion';

const GUARANTEES = [
  {
    icon: Truck,
    title: 'Livraison 24 – 48 h',
    text: `Offerte dès ${formatPriceShort(STORE.freeShippingThreshold)} d'achat`,
  },
  {
    icon: ShieldCheck,
    title: `Garantie ${STORE.warrantyMonths} mois`,
    text: 'Sur tous les produits, sans exception',
  },
  {
    icon: RotateCcw,
    title: `Retour sous ${STORE.returnDays} jours`,
    text: 'Remboursement intégral, sans justification',
  },
  {
    icon: Clock,
    title: 'Support humain',
    text: STORE.hours,
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const onSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Entrez une adresse e-mail valide, par exemple nom@exemple.sn');
      return;
    }
    setError(undefined);
    setEmail('');
    toast.success('Inscription confirmée', {
      description: 'Vous recevrez nos offres une fois par semaine, pas plus.',
    });
  };

  return (
    <footer className="mt-24 border-t border-border-subtle bg-surface">
      {/* Bandeau de réassurance */}
      <div className="border-b border-border-subtle">
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-12 lg:grid-cols-4">
          {GUARANTEES.map((item, index) => (
            <Reveal key={item.title} effect="up" delay={index * 0.06} distance={20}>
              <div className="flex flex-col gap-3">
                <item.icon className="h-5 w-5 text-accent-text" aria-hidden="true" />
                <div>
                  <p className="text-body-s font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-caption text-ink-tertiary">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
        {/* Marque et infolettre */}
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-body-s leading-relaxed text-ink-secondary">
            Smartphones, audio et accessoires authentiques à {STORE.city}. Produits scellés,
            facturés, garantis {STORE.warrantyMonths} mois.
          </p>

          <form onSubmit={onSubscribe} className="mt-7" noValidate>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              label="Recevoir les nouveautés et les promotions"
              placeholder="votre@email.sn"
              value={email}
              error={error}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(undefined);
              }}
              iconLeft={<Mail className="h-4 w-4" aria-hidden="true" />}
            />
            <Button
              type="submit"
              variant="secondary"
              className="mt-3"
              iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              S'inscrire
            </Button>
          </form>
        </div>

        {/* Colonnes de liens */}
        {FOOTER_NAV.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-overline uppercase text-ink-tertiary">{column.title}</h2>
            <ul className="mt-5 flex flex-col gap-1">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-[44px] items-center text-body-s text-ink-secondary transition-colors duration-fast hover:text-accent-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Coordonnées */}
      <div className="border-t border-border-subtle">
        <div className="container-page flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-col gap-3 text-caption text-ink-secondary sm:flex-row sm:gap-8">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
              {STORE.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
              <a
                href={`tel:${STORE.phone.replace(/\s/g, '')}`}
                className="tap-safe transition-colors hover:text-accent-text"
              >
                {STORE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
              <a href={`mailto:${STORE.email}`} className="tap-safe transition-colors hover:text-accent-text">
                {STORE.email}
              </a>
            </li>
          </ul>

          {/* Moyens de paiement — texte plutôt que logos : pas de marques
              détournées, et lisible dans les deux thèmes. */}
          <ul className="flex flex-wrap items-center gap-2">
            {['Orange Money', 'Wave', 'Free Money', 'Visa', 'Mastercard'].map((method) => (
              <li
                key={method}
                className="rounded-sm border border-border bg-elevated px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-tertiary"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-caption text-ink-tertiary sm:flex-row">
          <p>
            © {new Date().getFullYear()} {STORE.name}. {STORE.tagline}
          </p>
          <p className="flex items-center gap-4">
            <Link to={ROUTES.about} className="tap-safe transition-colors hover:text-ink-secondary">
              Mentions légales
            </Link>
            <Link to={ROUTES.designSystem} className="tap-safe transition-colors hover:text-ink-secondary">
              Design System
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
