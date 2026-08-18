import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAdminAuthStore } from '../../store/admin.store';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { Logo } from '../../components/brand/Logo';
import { Reveal, TextReveal } from '../../components/motion';
import { Seo } from '../../components/seo/Seo';

/* ==========================================================================
   Connexion admin — écran distinct du compte client, comme /wp-admin.

   Authentification réelle : le mot de passe est vérifié côté serveur contre
   un hachage bcrypt (voir server/index.mjs), pas simulée comme le compte
   client (auth.store.ts). Le seul compte existant est créé par
   server/seed.ts.
   ========================================================================== */

export function AdminLogin() {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const login = useAdminAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.admin} replace />;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Entrez une adresse e-mail valide.');
      return;
    }
    if (!password) {
      setError('Entrez votre mot de passe.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success('Connexion admin réussie');
    navigate(ROUTES.admin);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-6 py-12">
      <Seo title="Connexion admin" description="Back-office FallTech Store." noIndex />

      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo asLink={false} className="h-10" />
        </div>

        <h1 className="mt-8 text-center text-h2 text-ink">
          <TextReveal text="Espace admin" immediate />
        </h1>
        <p className="mt-2 text-center text-body-s text-ink-secondary">
          Gestion du catalogue, des commandes et des clients.
        </p>

        <Reveal effect="up" delay={0.1}>
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
            <Input
              type="email"
              inputMode="email"
              label="Adresse e-mail"
              autoComplete="email"
              required
              placeholder="admin@falltechstore.sn"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(undefined);
              }}
            />
            <Input
              type="password"
              label="Mot de passe"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              error={error}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(undefined);
              }}
            />
            <Button
              type="submit"
              size="lg"
              block
              loading={isSubmitting}
              iconLeft={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-elevated p-4">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
            <p className="text-caption leading-relaxed text-ink-secondary">
              Session protégée par mot de passe, vérifié côté serveur.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
