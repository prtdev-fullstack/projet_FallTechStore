import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuthStore } from '../store/auth.store';
import { Breadcrumb, Button, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { Reveal, TextReveal } from '../components/motion';

/* ==========================================================================
   Connexion et inscription.

   Authentification simulée : aucun mot de passe n'est transmis ni conservé.
   Le champ est marqué `autoComplete="off"` et l'encadré le dit explicitement —
   il ne faut jamais laisser croire à un visiteur qu'un vrai identifiant est
   attendu dans un projet de démonstration.
   ========================================================================== */

function DemoNotice() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-elevated p-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
      <p className="text-caption leading-relaxed text-ink-secondary">
        Démonstration : l'authentification est simulée. N'utilisez pas un vrai mot de passe — aucune
        donnée n'est vérifiée ni envoyée à un serveur.
      </p>
    </div>
  );
}

export function Login() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  if (user) return <Navigate to={ROUTES.accountOrders} replace />;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Entrez une adresse e-mail valide.');
      return;
    }
    login(email);
    toast.success('Connexion réussie');
    navigate(ROUTES.accountOrders);
  };

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'Connexion' }]} />

      <div className="mx-auto mt-10 max-w-md">
        <h1 className="text-display-m text-ink">
          <TextReveal text="Se connecter" immediate />
        </h1>

        <Reveal effect="up" delay={0.1}>
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
            <Input
              type="email"
              inputMode="email"
              label="Adresse e-mail"
              autoComplete="email"
              required
              placeholder="nom@exemple.sn"
              value={email}
              error={error}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(undefined);
              }}
            />
            <Input
              type="password"
              label="Mot de passe"
              autoComplete="off"
              placeholder="••••••••"
              hint="Non vérifié dans cette démonstration."
            />
            <Button type="submit" size="lg" block>
              Se connecter
            </Button>
          </form>

          <DemoNotice />

          <p className="mt-6 text-center text-body-s text-ink-secondary">
            Pas encore de compte ?{' '}
            <Link
              to={ROUTES.register}
              className="font-semibold text-accent-text underline-offset-4 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  );
}

export function Register() {
  const user = useAuthStore((state) => state.user);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Dakar',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Navigate to={ROUTES.accountOrders} replace />;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (values.firstName.trim().length < 2) next.firstName = 'Indiquez votre prénom.';
    if (values.lastName.trim().length < 2) next.lastName = 'Indiquez votre nom.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next.email = 'Adresse e-mail invalide.';
    if (!/^(221)?(7[05678])\d{7}$/.test(values.phone.replace(/\D/g, ''))) {
      next.phone = 'Numéro sénégalais attendu, par exemple 77 123 45 67.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    register(values);
    toast.success('Compte créé', { description: `Bienvenue, ${values.firstName}.` });
    navigate(ROUTES.accountProfile);
  };

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'Inscription' }]} />

      <div className="mx-auto mt-10 max-w-md">
        <h1 className="text-display-m text-ink">
          <TextReveal text="Créer un compte" immediate />
        </h1>

        <Reveal effect="up" delay={0.1}>
          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2" noValidate>
            <Input
              label="Prénom"
              required
              autoComplete="given-name"
              value={values.firstName}
              error={errors.firstName}
              onChange={(event) => setValues({ ...values, firstName: event.target.value })}
            />
            <Input
              label="Nom"
              required
              autoComplete="family-name"
              value={values.lastName}
              error={errors.lastName}
              onChange={(event) => setValues({ ...values, lastName: event.target.value })}
            />
            <Input
              type="email"
              inputMode="email"
              label="Adresse e-mail"
              required
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(event) => setValues({ ...values, email: event.target.value })}
              wrapperClassName="sm:col-span-2"
            />
            <Input
              type="tel"
              inputMode="tel"
              label="Téléphone"
              required
              autoComplete="tel"
              placeholder="77 123 45 67"
              value={values.phone}
              error={errors.phone}
              onChange={(event) => setValues({ ...values, phone: event.target.value })}
            />
            <Input
              label="Ville"
              autoComplete="address-level2"
              value={values.city}
              onChange={(event) => setValues({ ...values, city: event.target.value })}
            />
            <Button type="submit" size="lg" block className="sm:col-span-2">
              Créer mon compte
            </Button>
          </form>

          <DemoNotice />

          <p className="mt-6 text-center text-body-s text-ink-secondary">
            Déjà client ?{' '}
            <Link
              to={ROUTES.login}
              className="font-semibold text-accent-text underline-offset-4 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
