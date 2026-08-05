import { useState } from 'react';
import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { ROUTES, STORE } from '../constants/routes';
import { Breadcrumb, Button, Input, Select, Textarea } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { Reveal, TextReveal } from '../components/motion';
import { Seo } from '../components/seo/Seo';

const SUBJECTS = [
  { value: 'conseil', label: "Un conseil avant d'acheter" },
  { value: 'commande', label: 'Suivi de commande' },
  { value: 'garantie', label: 'Garantie ou réparation' },
  { value: 'retour', label: 'Retour ou remboursement' },
  { value: 'autre', label: 'Autre demande' },
];

interface Values {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type Errors = Partial<Record<keyof Values, string>>;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Indiquez votre nom.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    errors.email = 'Adresse e-mail invalide, par exemple nom@exemple.sn.';
  }
  if (values.phone && !/^(221)?(7[05678])\d{7}$/.test(values.phone.replace(/\D/g, ''))) {
    errors.phone = 'Numéro sénégalais attendu, ou laissez vide.';
  }
  if (values.message.trim().length < 12) {
    errors.message = 'Décrivez votre demande en quelques mots (12 caractères minimum).';
  }
  return errors;
}

export default function Contact() {
  const [values, setValues] = useState<Values>({
    name: '',
    email: '',
    phone: '',
    subject: 'conseil',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<keyof Values>>(new Set());
  const [isSending, setSending] = useState(false);

  const setField = (key: keyof Values, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched.has(key)) setErrors(validate(next));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched(new Set(Object.keys(values) as (keyof Values)[]));

    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(`contact-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }

    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setValues({ name: '', email: '', phone: '', subject: 'conseil', message: '' });
      setTouched(new Set());
      toast.success('Message envoyé', {
        description: 'Nous répondons sous 24 h ouvrées.',
      });
    }, 1100);
  };

  return (
    <div className="container-page py-8 md:py-12">
      <Seo
        title="Nous contacter"
        description={`Une question sur un produit, une commande ou une garantie ? Écrivez-nous ou passez en boutique à ${STORE.address}. Réponse sous 24 h ouvrées.`}
        path="/contact"
      />
      <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'Contact' }]} />

      <header className="mt-6 max-w-2xl">
        <h1 className="text-display-l text-ink">
          <TextReveal text="Nous contacter" immediate />
        </h1>
        <Reveal effect="up" delay={0.1}>
          <p className="mt-4 text-body-l text-ink-secondary">
            Une question sur un produit, une commande ou une garantie ? Écrivez-nous, appelez-nous
            ou passez en boutique. Nous répondons sous 24 heures ouvrées.
          </p>
        </Reveal>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        {/* Formulaire */}
        <Reveal effect="up" delay={0.15}>
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
            <Input
              id="contact-name"
              label="Nom complet"
              required
              autoComplete="name"
              value={values.name}
              error={touched.has('name') ? errors.name : undefined}
              onChange={(event) => setField('name', event.target.value)}
              onBlur={() => {
                setTouched((current) => new Set(current).add('name'));
                setErrors(validate(values));
              }}
            />
            <Input
              id="contact-email"
              type="email"
              inputMode="email"
              label="Adresse e-mail"
              required
              autoComplete="email"
              placeholder="nom@exemple.sn"
              value={values.email}
              error={touched.has('email') ? errors.email : undefined}
              onChange={(event) => setField('email', event.target.value)}
              onBlur={() => {
                setTouched((current) => new Set(current).add('email'));
                setErrors(validate(values));
              }}
            />
            <Input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              label="Téléphone"
              autoComplete="tel"
              placeholder="77 123 45 67"
              hint="Facultatif — pour un rappel plus rapide."
              value={values.phone}
              error={touched.has('phone') ? errors.phone : undefined}
              onChange={(event) => setField('phone', event.target.value)}
              onBlur={() => {
                setTouched((current) => new Set(current).add('phone'));
                setErrors(validate(values));
              }}
            />
            <Select
              id="contact-subject"
              label="Objet"
              value={values.subject}
              onChange={(event) => setField('subject', event.target.value)}
              options={SUBJECTS}
            />
            <Textarea
              id="contact-message"
              label="Votre message"
              required
              rows={7}
              placeholder="Décrivez votre demande : modèle concerné, numéro de commande, symptôme…"
              value={values.message}
              error={touched.has('message') ? errors.message : undefined}
              onChange={(event) => setField('message', event.target.value)}
              onBlur={() => {
                setTouched((current) => new Set(current).add('message'));
                setErrors(validate(values));
              }}
              wrapperClassName="sm:col-span-2"
            />

            <Button
              type="submit"
              size="lg"
              loading={isSending}
              className="sm:col-span-2 sm:justify-self-start"
              iconRight={!isSending ? <Send className="h-4 w-4" aria-hidden="true" /> : undefined}
            >
              {isSending ? 'Envoi en cours…' : 'Envoyer le message'}
            </Button>
          </form>
        </Reveal>

        {/* Coordonnées */}
        <Reveal effect="up" delay={0.2}>
          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-elevated p-6">
              <h2 className="text-h4 text-ink">Nous trouver</h2>
              <ul className="mt-5 flex flex-col gap-5">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <div>
                    <p className="text-body-s text-ink">{STORE.address}</p>
                    <p className="mt-0.5 text-caption text-ink-tertiary">
                      {STORE.city}, {STORE.country}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <a
                    href={`tel:${STORE.phone.replace(/\s/g, '')}`}
                    className="text-body-s text-ink transition-colors hover:text-accent-text"
                  >
                    {STORE.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <a
                    href={`mailto:${STORE.email}`}
                    className="break-all text-body-s text-ink transition-colors hover:text-accent-text"
                  >
                    {STORE.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <p className="text-body-s text-ink">{STORE.hours}</p>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-elevated p-6">
              <MessageSquare className="h-5 w-5 text-accent-text" aria-hidden="true" />
              <h2 className="mt-4 text-h4 text-ink">Réponse sous 24 h</h2>
              <p className="mt-2 text-body-s leading-relaxed text-ink-secondary">
                Nos messages sont traités par les mêmes personnes qui tiennent la boutique. Pas de
                centre d'appel, pas de réponse automatique.
              </p>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
