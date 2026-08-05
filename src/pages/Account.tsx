import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { Heart, LogOut, Package, User as UserIcon } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { productBySlug } from '../data/products';
import { useAuthStore } from '../store/auth.store';
import { useWishlistStore } from '../store/wishlist.store';
import { formatDate, formatPrice } from '../utils/format';
import { cn } from '../utils/cn';
import { Badge, Breadcrumb, Button, EmptyState, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { ProductCard } from '../components/commerce/ProductCard';
import { Reveal, Stagger, StaggerItem, TextReveal } from '../components/motion';

/* ==========================================================================
   Espace compte.

   L'authentification est simulée (voir src/store/auth.store.ts). L'intérêt ici
   est l'architecture : routes imbriquées, garde de navigation, mise en page
   partagée. Brancher une vraie API ne demandera de toucher qu'au store.
   ========================================================================== */

const ACCOUNT_NAV = [
  { to: ROUTES.accountOrders, label: 'Mes commandes', icon: Package },
  { to: ROUTES.accountWishlist, label: 'Mes favoris', icon: Heart },
  { to: ROUTES.accountProfile, label: 'Mon profil', icon: UserIcon },
];

export function AccountLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Garde de navigation : la redirection vit ici, pas dans chaque sous-page.
  if (!user) return <Navigate to={ROUTES.login} replace />;

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumb items={[{ label: 'Accueil', to: ROUTES.home }, { label: 'Mon compte' }]} />

      <header className="mt-6">
        <h1 className="text-display-l text-ink">
          <TextReveal text={`Bonjour, ${user.firstName}`} immediate />
        </h1>
        <p className="mt-3 text-body-l text-ink-secondary">{user.email}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside>
          <nav aria-label="Navigation du compte">
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {ACCOUNT_NAV.map((item) => (
                <li key={item.to} className="shrink-0 lg:shrink">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-[44px] items-center gap-3 rounded-md px-3.5 text-body-s font-medium transition-colors duration-fast',
                        isActive
                          ? 'bg-elevated text-ink'
                          : 'text-ink-secondary hover:bg-elevated/60 hover:text-ink',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => {
              logout();
              toast.info('Vous êtes déconnecté');
            }}
            className="mt-6 flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-md px-3.5 text-body-s font-medium text-ink-tertiary transition-colors duration-fast hover:bg-elevated hover:text-danger"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </button>
        </aside>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* ── Commandes ─────────────────────────────────────────────────────────── */

const STATUS_LABEL = {
  'en-preparation': { label: 'En préparation', tone: 'accent' as const },
  expediee: { label: 'Expédiée', tone: 'aurora' as const },
  livree: { label: 'Livrée', tone: 'success' as const },
};

export function AccountOrders() {
  const orders = useAuthStore((state) => state.orders);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-7 w-7" aria-hidden="true" />}
        title="Aucune commande pour l’instant"
        description="Vos commandes apparaîtront ici avec leur statut de livraison et leur facture."
        action={<Button to={ROUTES.shop}>Découvrir la boutique</Button>}
      />
    );
  }

  return (
    <Stagger className="flex flex-col gap-5" stagger={0.06}>
      {orders.map((order) => (
        <StaggerItem key={order.id}>
          <article className="rounded-xl border border-border bg-elevated p-6">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <p className="font-mono text-body-s font-semibold text-ink">{order.id}</p>
                <p className="mt-1 text-caption text-ink-tertiary">{formatDate(order.date)}</p>
              </div>
              <Badge tone={STATUS_LABEL[order.status].tone}>{STATUS_LABEL[order.status].label}</Badge>
            </header>

            <ul className="mt-4 flex flex-col gap-2">
              {order.lines.map((line) => (
                <li key={line.slug} className="flex items-center justify-between gap-4 text-body-s">
                  <Link
                    to={ROUTES.product(line.slug)}
                    className="truncate text-ink-secondary transition-colors hover:text-accent-text"
                  >
                    {line.name}
                    <span className="tabular text-ink-tertiary"> × {line.quantity}</span>
                  </Link>
                  <span className="tabular shrink-0 text-ink">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="mt-4 flex items-baseline justify-between border-t border-border-subtle pt-4">
              <span className="text-body-s text-ink-secondary">Total</span>
              <span className="tabular font-display text-h4 text-ink">{formatPrice(order.total)}</span>
            </footer>
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* ── Favoris ───────────────────────────────────────────────────────────── */

export function AccountWishlist() {
  const slugs = useWishlistStore((state) => state.slugs);
  const products = slugs.map((slug) => productBySlug.get(slug)).filter(Boolean);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-7 w-7" aria-hidden="true" />}
        title="Aucun favori"
        description="Touchez le cœur sur un produit pour le retrouver ici, sur tous vos appareils."
        action={<Button to={ROUTES.shop}>Parcourir le catalogue</Button>}
      />
    );
  }

  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" stagger={0.06}>
      {products.map(
        (product) =>
          product && (
            <StaggerItem key={product.slug} className="h-full">
              <ProductCard product={product} />
            </StaggerItem>
          ),
      )}
    </Stagger>
  );
}

/* ── Profil ────────────────────────────────────────────────────────────── */

export function AccountProfile() {
  const user = useAuthStore((state) => state.user)!;
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [values, setValues] = useState(user);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile(values);
    toast.success('Profil mis à jour');
  };

  return (
    <Reveal effect="up">
      <form onSubmit={onSubmit} className="max-w-xl rounded-xl border border-border bg-elevated p-6">
        <h2 className="text-h3 text-ink">Mes informations</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input
            label="Prénom"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(event) => setValues({ ...values, firstName: event.target.value })}
          />
          <Input
            label="Nom"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(event) => setValues({ ...values, lastName: event.target.value })}
          />
          <Input
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="Téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setValues({ ...values, phone: event.target.value })}
          />
          <Input
            label="Ville"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => setValues({ ...values, city: event.target.value })}
          />
        </div>

        <Button type="submit" className="mt-7">
          Enregistrer
        </Button>
      </form>
    </Reveal>
  );
}
