import { useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, MapPin, Smartphone, Wallet } from 'lucide-react';
import type { PaymentMethodId, ShippingMethodId } from '../types';
import { DURATION, EASE } from '../constants/motion';
import { ROUTES } from '../constants/routes';
import { paymentMethods, shippingMethods } from '../data/catalog';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { getLenis } from '../hooks/useSmoothScroll';
import { useCartStore, resolveLines } from '../store/cart.store';
import { useCatalogStore } from '../store/catalog.store';
import { useSettingsStore } from '../store/settings.store';
import { useAuthStore } from '../store/auth.store';
import { useOrdersStore } from '../store/orders.store';
import { formatOrderNumber, formatPrice, formatPriceShort } from '../utils/format';
import { cn } from '../utils/cn';
import { Breadcrumb, Button, Input, RadioCard, Select, toast } from '../components/ui';
import { ProductImage } from '../components/commerce/ProductImage';
import { Seo } from '../components/seo/Seo';

/* ==========================================================================
   Tunnel de commande en trois étapes.

   L'ancienne version empilait identité, adresse, paiement et récapitulatif sur
   une seule page de 539 lignes, sans validation, et se terminait par un
   `alert()` natif. Trois corrections : un découpage lisible, une validation au
   champ, et une vraie page de confirmation avec un numéro de commande.
   ========================================================================== */

const STEPS = ['Livraison', 'Paiement', 'Confirmation'] as const;

// Logos affichés à côté de chaque moyen de paiement (voir
// scripts/import-payment-logos.mjs) — absent de la liste, ou fichier
// manquant : la carte garde simplement son intitulé, sans casser l'affichage.
const PAYMENT_LOGOS: Partial<Record<PaymentMethodId, string[]>> = {
  'orange-money': ['orange-money'],
  wave: ['wave'],
  visa: ['visa'],
  mastercard: ['mastercard'],
};

function PaymentLogos({ slugs }: { slugs: string[] }) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {slugs.map((slug) =>
        failed[slug] ? null : (
          <img
            key={slug}
            src={`/payments/${slug}.webp`}
            alt=""
            aria-hidden="true"
            width={160}
            height={80}
            onError={() => setFailed((current) => ({ ...current, [slug]: true }))}
            className="h-6 w-auto object-contain"
          />
        ),
      )}
    </span>
  );
}

const REGIONS = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Diourbel',
  'Kaolack',
  'Ziguinchor',
  'Louga',
  'Fatick',
  'Kolda',
  'Matam',
  'Tambacounda',
  'Kaffrine',
  'Kédougou',
  'Sédhiou',
];

// Selon le moyen choisi, l'étape paiement demande soit les infos de carte,
// soit un numéro pour la demande de confirmation mobile — jamais les deux,
// jamais rien pour le paiement à la livraison.
const CARD_METHODS: PaymentMethodId[] = ['visa', 'mastercard'];
const MOBILE_METHODS: PaymentMethodId[] = ['orange-money', 'wave', 'free-money'];

interface PaymentDetailsState {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  mobileNumber: string;
}

type PaymentErrors = Partial<Record<keyof PaymentDetailsState, string>>;

/** Regroupe les chiffres par 4 au fil de la frappe — « 4242 4242 4242 4242 »
 *  plutôt qu'un bloc illisible, jusqu'à 19 chiffres (longueur maximale d'un
 *  numéro de carte réel). */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return (digits.match(/.{1,4}/g) ?? []).join(' ');
}

/** « MM/AA » au fil de la frappe, sans que l'utilisateur ait à taper le
 *  séparateur lui-même. */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Somme de contrôle standard des numéros de carte — un numéro qui échoue ce
 *  test est structurellement invalide, quelle que soit la carte. Ne prouve
 *  pas qu'une carte existe ou est débitable : seulement que sa forme est
 *  plausible, comme le ferait tout formulaire de paiement réel côté client. */
function passesLuhnCheck(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function validatePayment(payment: PaymentMethodId, details: PaymentDetailsState): PaymentErrors {
  const errors: PaymentErrors = {};

  if (CARD_METHODS.includes(payment)) {
    if (details.cardName.trim().length < 2) errors.cardName = 'Indiquez le nom inscrit sur la carte.';

    const digits = details.cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19 || !passesLuhnCheck(digits)) {
      errors.cardNumber = 'Numéro de carte invalide.';
    }

    const match = details.cardExpiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      errors.cardExpiry = 'Format attendu : MM/AA.';
    } else {
      const month = Number(match[1]);
      const expiry = new Date(2000 + Number(match[2]), month, 1);
      if (month < 1 || month > 12) errors.cardExpiry = 'Mois invalide.';
      else if (expiry <= new Date()) errors.cardExpiry = 'Cette carte est expirée.';
    }

    if (!/^\d{3,4}$/.test(details.cardCvv)) errors.cardCvv = 'CVV à 3 ou 4 chiffres.';
  }

  if (MOBILE_METHODS.includes(payment)) {
    const digits = details.mobileNumber.replace(/\D/g, '');
    if (!/^(221)?(7[05678])\d{7}$/.test(digits)) {
      errors.mobileNumber = 'Numéro sénégalais attendu, par exemple 77 123 45 67.';
    }
  }

  return errors;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

/** Validation par champ — messages explicites, jamais « champ invalide ». */
function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (values.firstName.trim().length < 2) errors.firstName = 'Indiquez votre prénom.';
  if (values.lastName.trim().length < 2) errors.lastName = 'Indiquez votre nom.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    errors.email = 'Adresse e-mail invalide, par exemple nom@exemple.sn.';
  }

  // Numéros sénégalais : 77, 78, 76, 70 ou 75, suivis de 7 chiffres.
  const digits = values.phone.replace(/\D/g, '');
  if (!/^(221)?(7[05678])\d{7}$/.test(digits)) {
    errors.phone = 'Numéro sénégalais attendu, par exemple 77 123 45 67.';
  }

  if (values.address.trim().length < 5) errors.address = 'Indiquez une adresse de livraison.';
  if (values.city.trim().length < 2) errors.city = 'Indiquez votre ville ou quartier.';

  return errors;
}

export default function Checkout() {
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);
  const catalog = useCatalogStore((state) => state.products);
  const settings = useSettingsStore((state) => state.settings);
  const user = useAuthStore((state) => state.user);
  const createOrder = useOrdersStore((state) => state.createOrder);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: '',
    city: user?.city ?? 'Dakar',
    region: 'Dakar',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());
  const [shipping, setShipping] = useState<ShippingMethodId>('domicile');
  const [payment, setPayment] = useState<PaymentMethodId>('wave');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsState>({
    cardName: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    mobileNumber: user?.phone ?? '',
  });
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});
  const [paymentTouched, setPaymentTouched] = useState<Set<keyof PaymentDetailsState>>(new Set());
  // `wave` est présélectionné par défaut, mais tant que rien n'a été
  // explicitement cliqué, on montre toute la liste pour laisser le choix.
  const [paymentExpanded, setPaymentExpanded] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  // `clear()` (Zustand) et `setOrderNumber` (React) peuvent se rendre dans des
  // passes séparées malgré le batching automatique : une ref, mise à jour de
  // façon synchrone, garde la garde ci-dessous fiable même si le panier vidé
  // se rend avant que `orderNumber` n'ait rattrapé — sans quoi la commande
  // qui vient d'être validée renvoie l'utilisateur vers un panier vide.
  const orderPlacedRef = useRef(false);

  const resolved = resolveLines(lines, catalog);
  const subtotal = resolved.reduce((total, line) => total + line.lineTotal, 0);
  const shippingMethod = shippingMethods.find((method) => method.id === shipping)!;
  const shippingCost =
    subtotal >= settings.freeShippingThreshold && shipping !== 'retrait' ? 0 : shippingMethod.price;
  const total = subtotal + shippingCost;

  const summary = useMemo(
    () => resolved.map((line) => ({ ...line })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines],
  );

  /* Panier vide et commande non encore passée : il n'y a rien à régler. */
  if (resolved.length === 0 && !orderNumber && !orderPlacedRef.current) {
    return <Navigate to={ROUTES.cart} replace />;
  }

  const setField = (key: keyof FormState, value: string) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Revalide en direct uniquement les champs déjà quittés : afficher une
      // erreur pendant la première frappe est agressif et contre-productif.
      if (touched.has(key)) setErrors(validate(next));
      return next;
    });
  };

  const blurField = (key: keyof FormState) => {
    setTouched((current) => new Set(current).add(key));
    setErrors(validate(values));
  };

  const selectPayment = (method: PaymentMethodId) => {
    setPayment(method);
    // Les champs affichés changent avec le moyen choisi : les erreurs et
    // l'historique de saisie de l'ancien formulaire n'ont plus de sens.
    setPaymentErrors({});
    setPaymentTouched(new Set());
    // Une fois un choix fait, on replie la liste sur ce seul moyen plutôt que
    // de garder les 6 options affichées en même temps à côté de son
    // formulaire — « Changer » la ré-ouvre.
    setPaymentExpanded(false);
  };

  const setPaymentField = (key: keyof PaymentDetailsState, value: string) => {
    setPaymentDetails((current) => {
      const next = { ...current, [key]: value };
      if (paymentTouched.has(key)) setPaymentErrors(validatePayment(payment, next));
      return next;
    });
  };

  const blurPaymentField = (key: keyof PaymentDetailsState) => {
    setPaymentTouched((current) => new Set(current).add(key));
    setPaymentErrors(validatePayment(payment, paymentDetails));
  };

  const goToPayment = () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched(new Set(Object.keys(values) as (keyof FormState)[]));

    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(`champ-${firstField}`)?.focus();
      return;
    }
    setStep(1);
  };

  const submitOrder = () => {
    const nextPaymentErrors = validatePayment(payment, paymentDetails);
    setPaymentErrors(nextPaymentErrors);
    setPaymentTouched(new Set(Object.keys(paymentDetails) as (keyof PaymentDetailsState)[]));

    if (Object.keys(nextPaymentErrors).length > 0) {
      const firstField = Object.keys(nextPaymentErrors)[0];
      document.getElementById(`paiement-${firstField}`)?.focus();
      return;
    }

    setSubmitting(true);
    // Le délai simule une passerelle de paiement. La commande est ensuite
    // enregistrée localement (voir orders.store.ts) : elle apparaîtra dans
    // « Mes commandes » et dans l'admin de ce navigateur. Les informations de
    // carte / numéro mobile, elles, ne sont ni transmises ni conservées.
    window.setTimeout(async () => {
      const reference = formatOrderNumber(Math.floor(100 + Math.random() * 8900));

      try {
        await createOrder({
          id: reference,
          total,
          lines: summary.map((line) => ({
            slug: line.slug,
            name: line.product.name,
            quantity: line.quantity,
            price: line.unitPrice,
          })),
          customer: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            address: values.address,
            city: values.city,
            region: values.region,
          },
        });
      } catch {
        setSubmitting(false);
        toast.error('Échec du paiement', {
          description: 'La commande n’a pas pu être enregistrée. Réessayez.',
        });
        return;
      }

      orderPlacedRef.current = true;
      setOrderNumber(reference);
      clear();
      setSubmitting(false);
      setStep(2);
      // `window.scrollTo` seul ne suffit pas : Lenis réimpose sa propre
      // position au prochain tick s'il n'est pas prévenu (voir ScrollToTop).
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    }, 1400);
  };

  /* ── Confirmation ────────────────────────────────────────────────────── */
  if (step === 2 && orderNumber) {
    return (
      <div className="container-page flex min-h-[70dvh] items-center justify-center py-16">
        <div className="w-full max-w-lg text-center">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: DURATION.slow, ease: EASE.spring }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-success/40 bg-success/15"
          >
            {/* La coche se trace : le seul moment du site où une animation
                dure volontairement plus de 600 ms. */}
            <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
              <motion.path
                d="M4 12.5 L9.5 18 L20 6.5"
                fill="none"
                stroke="rgb(var(--success))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: EASE.outExpo }}
              />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, delay: 0.4, ease: EASE.outExpo }}
          >
            <h1 className="mt-8 text-display-m text-ink">Commande confirmée</h1>
            <p className="mt-4 text-body-l text-ink-secondary">
              Merci {values.firstName}. Nous préparons votre colis et vous appelons avant la
              livraison.
            </p>

            <dl className="mt-8 divide-y divide-border-subtle rounded-xl border border-border bg-elevated text-left">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-body-s text-ink-secondary">Numéro de commande</dt>
                <dd className="font-mono text-body-s font-semibold text-ink">{orderNumber}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-body-s text-ink-secondary">Total réglé</dt>
                <dd className="tabular text-body-s font-semibold text-ink">{formatPrice(total)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-body-s text-ink-secondary">Livraison</dt>
                <dd className="text-right text-body-s text-ink">
                  {shippingMethod.label}
                  <span className="block text-caption text-ink-tertiary">{shippingMethod.delay}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-body-s text-ink-secondary">Paiement</dt>
                <dd className="text-body-s text-ink">
                  {paymentMethods.find((method) => method.id === payment)?.label}
                </dd>
              </div>
            </dl>

            <p className="mt-5 text-caption text-ink-tertiary">
              Un e-mail de confirmation a été envoyé à {values.email}.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to={ROUTES.accountOrders} size="lg">
                Suivre ma commande
              </Button>
              <Button to={ROUTES.shop} size="lg" variant="secondary">
                Continuer mes achats
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Récapitulatif latéral ───────────────────────────────────────────── */
  const orderSummary = (
    <div className="rounded-xl border border-border bg-elevated p-6">
      <h2 className="text-h4 text-ink">Votre commande</h2>

      <ul className="mt-5 flex flex-col gap-4">
        {summary.map((line) => (
          <li key={line.key} className="flex items-center gap-3">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-sunken">
              <ProductImage product={line.product} size="thumb" />
              <span className="tabular absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-solid px-1 text-[0.625rem] font-bold text-accent-fg">
                {line.quantity}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-s font-medium text-ink">
                {line.product.name}
              </span>
              {line.variantLabels.length > 0 && (
                <span className="block truncate text-caption text-ink-tertiary">
                  {line.variantLabels.join(' · ')}
                </span>
              )}
            </span>
            <span className="tabular shrink-0 text-body-s text-ink">
              {formatPriceShort(line.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-5">
        <div className="flex justify-between text-body-s">
          <dt className="text-ink-secondary">Sous-total</dt>
          <dd className="tabular text-ink">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-body-s">
          <dt className="text-ink-secondary">Livraison</dt>
          <dd className={cn('tabular', shippingCost === 0 ? 'text-success' : 'text-ink')}>
            {shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}
          </dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-border-subtle pt-4">
          <dt className="text-body font-semibold text-ink">Total</dt>
          <dd className="tabular font-display text-h3 text-ink">{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: 'Accueil', to: ROUTES.home },
          { label: 'Panier', to: ROUTES.cart },
          { label: 'Commande' },
        ]}
      />

      <Seo title="Finaliser ma commande" description="Livraison, paiement et confirmation." path="/commande" noIndex />
      <h1 className="mt-6 text-display-l text-ink">Finaliser ma commande</h1>

      {/* Étapes visuelles */}
      <ol className="mt-10 flex items-center gap-2 sm:gap-4" aria-label="Progression de la commande">
        {STEPS.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  'tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-caption font-semibold transition-colors duration-base',
                  isDone
                    ? 'border-success bg-success text-carbon-950'
                    : isCurrent
                      ? 'border-accent bg-accent/15 text-accent-text'
                      : 'border-border text-ink-tertiary',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-body-s font-medium sm:block',
                  isCurrent ? 'text-ink' : 'text-ink-tertiary',
                )}
              >
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-border" aria-hidden="true">
                  <motion.span
                    className="block h-full origin-left bg-success"
                    initial={false}
                    animate={{ scaleX: isDone ? 1 : 0 }}
                    transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div>
          <AnimatePresence>
            {step === 0 && (
              <motion.div
                key="livraison"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                transition={{ duration: DURATION.base, ease: EASE.outExpo }}
              >
                <section>
                  <h2 className="text-h3 text-ink">Vos coordonnées</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Input
                      id="champ-firstName"
                      label="Prénom"
                      required
                      autoComplete="given-name"
                      value={values.firstName}
                      error={touched.has('firstName') ? errors.firstName : undefined}
                      onChange={(event) => setField('firstName', event.target.value)}
                      onBlur={() => blurField('firstName')}
                    />
                    <Input
                      id="champ-lastName"
                      label="Nom"
                      required
                      autoComplete="family-name"
                      value={values.lastName}
                      error={touched.has('lastName') ? errors.lastName : undefined}
                      onChange={(event) => setField('lastName', event.target.value)}
                      onBlur={() => blurField('lastName')}
                    />
                    <Input
                      id="champ-email"
                      type="email"
                      inputMode="email"
                      label="E-mail"
                      required
                      autoComplete="email"
                      placeholder="nom@exemple.sn"
                      value={values.email}
                      error={touched.has('email') ? errors.email : undefined}
                      onChange={(event) => setField('email', event.target.value)}
                      onBlur={() => blurField('email')}
                    />
                    <Input
                      id="champ-phone"
                      type="tel"
                      inputMode="tel"
                      label="Téléphone"
                      required
                      autoComplete="tel"
                      placeholder="77 123 45 67"
                      hint="Pour vous prévenir avant la livraison."
                      value={values.phone}
                      error={touched.has('phone') ? errors.phone : undefined}
                      onChange={(event) => setField('phone', event.target.value)}
                      onBlur={() => blurField('phone')}
                    />
                  </div>
                </section>

                <section className="mt-12">
                  <h2 className="flex items-center gap-2 text-h3 text-ink">
                    <MapPin className="h-5 w-5 text-accent-text" aria-hidden="true" />
                    Adresse de livraison
                  </h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Input
                      id="champ-address"
                      label="Adresse"
                      required
                      autoComplete="street-address"
                      placeholder="Rue, immeuble, repère"
                      value={values.address}
                      error={touched.has('address') ? errors.address : undefined}
                      onChange={(event) => setField('address', event.target.value)}
                      onBlur={() => blurField('address')}
                      wrapperClassName="sm:col-span-2"
                    />
                    <Input
                      id="champ-city"
                      label="Ville ou quartier"
                      required
                      autoComplete="address-level2"
                      value={values.city}
                      error={touched.has('city') ? errors.city : undefined}
                      onChange={(event) => setField('city', event.target.value)}
                      onBlur={() => blurField('city')}
                    />
                    <Select
                      id="champ-region"
                      label="Région"
                      value={values.region}
                      onChange={(event) => setField('region', event.target.value)}
                      options={REGIONS.map((region) => ({ value: region, label: region }))}
                    />
                    <Input
                      id="champ-notes"
                      label="Instructions de livraison"
                      placeholder="Étage, code, point de repère…"
                      value={values.notes}
                      onChange={(event) => setField('notes', event.target.value)}
                      wrapperClassName="sm:col-span-2"
                    />
                  </div>
                </section>

                <section className="mt-12">
                  <h2 className="text-h3 text-ink">Mode de livraison</h2>
                  <div className="mt-6 flex flex-col gap-3">
                    {shippingMethods.map((method) => (
                      <RadioCard
                        key={method.id}
                        name="livraison"
                        value={method.id}
                        checked={shipping === method.id}
                        onChange={() => setShipping(method.id)}
                        label={method.label}
                        description={`${method.description} · ${method.delay}`}
                        trailing={
                          <span
                            className={cn(
                              'tabular shrink-0 text-body-s font-semibold',
                              method.price === 0 ? 'text-success' : 'text-ink',
                            )}
                          >
                            {method.price === 0 ? 'Offert' : formatPriceShort(method.price)}
                          </span>
                        }
                      />
                    ))}
                  </div>
                </section>

                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    to={ROUTES.cart}
                    variant="ghost"
                    iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                  >
                    Retour au panier
                  </Button>
                  <Button
                    onClick={goToPayment}
                    size="lg"
                    iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  >
                    Continuer vers le paiement
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="paiement"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                transition={{ duration: DURATION.base, ease: EASE.outExpo }}
              >
                <section>
                  <h2 className="flex items-center gap-2 text-h3 text-ink">
                    <Wallet className="h-5 w-5 text-accent-text" aria-hidden="true" />
                    Moyen de paiement
                  </h2>

                  {paymentExpanded ? (
                    <div className="mt-6 flex flex-col gap-3">
                      {paymentMethods.map((method) => {
                        const logoSlugs = PAYMENT_LOGOS[method.id];
                        return (
                          <RadioCard
                            key={method.id}
                            name="paiement"
                            value={method.id}
                            checked={payment === method.id}
                            onChange={() => selectPayment(method.id)}
                            onClick={() => selectPayment(method.id)}
                            label={method.label}
                            description={method.description}
                            disabled={method.id === 'livraison' && values.region !== 'Dakar'}
                            trailing={logoSlugs ? <PaymentLogos slugs={logoSlugs} /> : undefined}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    (() => {
                      const selected = paymentMethods.find((method) => method.id === payment)!;
                      const logoSlugs = PAYMENT_LOGOS[selected.id];
                      return (
                        <div className="mt-6 flex items-center gap-4 rounded-md border border-accent bg-accent/[0.07] p-4 shadow-glow">
                          {logoSlugs && <PaymentLogos slugs={logoSlugs} />}
                          <span className="flex-1">
                            <span className="block text-body-s font-semibold text-ink">{selected.label}</span>
                            <span className="mt-0.5 block text-caption text-ink-tertiary">
                              {selected.description}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaymentExpanded(true)}
                            className="shrink-0 cursor-pointer text-caption font-semibold text-accent-text underline-offset-4 hover:underline"
                          >
                            Changer
                          </button>
                        </div>
                      );
                    })()
                  )}

                  {paymentExpanded && values.region !== 'Dakar' && (
                    <p className="mt-4 text-caption text-ink-tertiary">
                      Le paiement à la livraison n'est disponible qu'à Dakar et en banlieue.
                    </p>
                  )}

                  {/* Formulaire propre au moyen choisi — carte pour Visa /
                      Mastercard, numéro mobile pour les portefeuilles. Affiché
                      seulement une fois la liste repliée sur un choix, pour ne
                      pas s'ajouter aux 6 options encore visibles pendant la
                      sélection. Rien n'est envoyé à l'API ni enregistré : voir
                      submitOrder. */}
                  {!paymentExpanded && CARD_METHODS.includes(payment) && (
                    <div className="mt-8">
                      <h3 className="flex items-center gap-2 text-body font-semibold text-ink">
                        <CreditCard className="h-4 w-4 text-accent-text" aria-hidden="true" />
                        Détails de la carte
                      </h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <Input
                          id="paiement-cardName"
                          label="Nom sur la carte"
                          required
                          autoComplete="cc-name"
                          placeholder="MARC FALL"
                          value={paymentDetails.cardName}
                          error={paymentTouched.has('cardName') ? paymentErrors.cardName : undefined}
                          onChange={(event) => setPaymentField('cardName', event.target.value)}
                          onBlur={() => blurPaymentField('cardName')}
                          wrapperClassName="sm:col-span-2"
                        />
                        <Input
                          id="paiement-cardNumber"
                          label="Numéro de carte"
                          required
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="4242 4242 4242 4242"
                          value={paymentDetails.cardNumber}
                          error={paymentTouched.has('cardNumber') ? paymentErrors.cardNumber : undefined}
                          onChange={(event) => setPaymentField('cardNumber', formatCardNumber(event.target.value))}
                          onBlur={() => blurPaymentField('cardNumber')}
                          wrapperClassName="sm:col-span-2"
                        />
                        <Input
                          id="paiement-cardExpiry"
                          label="Expiration"
                          required
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/AA"
                          value={paymentDetails.cardExpiry}
                          error={paymentTouched.has('cardExpiry') ? paymentErrors.cardExpiry : undefined}
                          onChange={(event) => setPaymentField('cardExpiry', formatExpiry(event.target.value))}
                          onBlur={() => blurPaymentField('cardExpiry')}
                        />
                        <Input
                          id="paiement-cardCvv"
                          type="password"
                          label="CVV"
                          required
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          value={paymentDetails.cardCvv}
                          error={paymentTouched.has('cardCvv') ? paymentErrors.cardCvv : undefined}
                          onChange={(event) =>
                            setPaymentField('cardCvv', event.target.value.replace(/\D/g, '').slice(0, 4))
                          }
                          onBlur={() => blurPaymentField('cardCvv')}
                        />
                      </div>
                    </div>
                  )}

                  {!paymentExpanded && MOBILE_METHODS.includes(payment) && (
                    <div className="mt-8">
                      <h3 className="flex items-center gap-2 text-body font-semibold text-ink">
                        <Smartphone className="h-4 w-4 text-accent-text" aria-hidden="true" />
                        Numéro {paymentMethods.find((method) => method.id === payment)?.label}
                      </h3>
                      <div className="mt-4">
                        <Input
                          id="paiement-mobileNumber"
                          type="tel"
                          inputMode="tel"
                          label="Numéro de téléphone"
                          required
                          autoComplete="tel"
                          placeholder="77 123 45 67"
                          hint="Une demande de confirmation sera envoyée sur ce numéro."
                          value={paymentDetails.mobileNumber}
                          error={paymentTouched.has('mobileNumber') ? paymentErrors.mobileNumber : undefined}
                          onChange={(event) => setPaymentField('mobileNumber', event.target.value)}
                          onBlur={() => blurPaymentField('mobileNumber')}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-start gap-3 rounded-md border border-border bg-elevated p-4">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                    <p className="text-caption leading-relaxed text-ink-secondary">
                      Projet de démonstration : ces informations ne sont ni transmises ni enregistrées
                      — aucun paiement réel n'est effectué. Sur la boutique réelle, cette étape
                      redirige vers la passerelle sécurisée de l'opérateur choisi.
                    </p>
                  </div>
                </section>

                <section className="mt-12">
                  <h2 className="text-h3 text-ink">Livraison à</h2>
                  <div className="mt-5 rounded-md border border-border bg-elevated p-5">
                    <p className="text-body-s font-semibold text-ink">
                      {values.firstName} {values.lastName}
                    </p>
                    <p className="mt-1 text-body-s text-ink-secondary">{values.address}</p>
                    <p className="text-body-s text-ink-secondary">
                      {values.city}, {values.region}
                    </p>
                    <p className="mt-2 text-caption text-ink-tertiary">
                      {values.phone} · {values.email}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="mt-3 cursor-pointer text-caption font-semibold text-accent-text underline-offset-4 hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                </section>

                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    onClick={() => setStep(0)}
                    variant="ghost"
                    iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                  >
                    Retour
                  </Button>
                  <Button onClick={submitOrder} loading={isSubmitting} size="lg">
                    {isSubmitting ? 'Traitement en cours…' : `Payer ${formatPrice(total)}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-height-compact)+2rem)] lg:self-start">
          {orderSummary}
          <p className="mt-4 text-center text-caption text-ink-tertiary">
            Besoin d'aide ?{' '}
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="text-accent-text underline-offset-4 hover:underline"
            >
              {settings.phone}
            </a>
          </p>
        </aside>
      </div>
    </div>
  );
}
