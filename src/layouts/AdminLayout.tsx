import { useEffect } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Users } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAdminAuthStore } from '../store/admin.store';
import { useOrdersStore } from '../store/orders.store';
import { cn } from '../utils/cn';
import { Logo } from '../components/brand/Logo';
import { RouteLoader } from '../components/brand/Loader';
import { toast } from '../components/ui/Toast';

/* ==========================================================================
   Coquille de l'admin — back-office séparé de la boutique.

   Aucun Header/Footer/CartDrawer client ici : l'admin n'est pas une page du
   site, c'est un outil de gestion. Gardé par sa propre session
   (admin.store), indépendante du compte client.
   ========================================================================== */

const ADMIN_NAV = [
  { to: ROUTES.admin, label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: ROUTES.adminProducts, label: 'Produits', icon: Package },
  { to: ROUTES.adminOrders, label: 'Commandes', icon: ShoppingBag },
  { to: ROUTES.adminClients, label: 'Clients', icon: Users },
  { to: ROUTES.adminSettings, label: 'Paramètres', icon: Settings },
];

export function AdminLayout() {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isChecking = useAdminAuthStore((state) => state.isChecking);
  const email = useAdminAuthStore((state) => state.email);
  const logout = useAdminAuthStore((state) => state.logout);
  const checkSession = useAdminAuthStore((state) => state.checkSession);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);

  // La session vit dans un cookie httpOnly, invisible en JS : on ne sait si
  // elle est valide qu'en interrogeant le serveur, une fois au montage.
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Les commandes exigent la session admin (GET /api/orders) : on ne les
  // charge qu'une fois celle-ci confirmée, pour tout le back-office plutôt
  // que page par page.
  useEffect(() => {
    if (isAuthenticated) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (isChecking) return <RouteLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.adminLogin} replace />;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:flex-row">
      <aside className="shrink-0 border-b border-border-subtle bg-elevated lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:justify-start">
          <Logo asLink={false} className="h-8" />
          <span className="rounded-sm border border-border bg-sunken px-2 py-0.5 text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
            Admin
          </span>
        </div>

        <nav aria-label="Navigation admin" className="px-3 pb-3 lg:flex-1 lg:pb-0">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {ADMIN_NAV.map((item) => (
              <li key={item.to} className="shrink-0 lg:shrink">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-md px-3.5 text-body-s font-medium transition-colors duration-fast',
                      isActive
                        ? 'bg-accent/15 text-accent-text'
                        : 'text-ink-secondary hover:bg-elevated-hover hover:text-ink',
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

        <div className="border-t border-border-subtle px-3 py-3">
          <p className="truncate px-3.5 pb-2 text-caption text-ink-tertiary">{email}</p>
          <NavLink
            to={ROUTES.home}
            className="flex min-h-[44px] items-center gap-3 rounded-md px-3.5 text-body-s font-medium text-ink-secondary transition-colors duration-fast hover:bg-elevated-hover hover:text-ink"
          >
            Retour au site
          </NavLink>
          <button
            type="button"
            onClick={() => {
              logout();
              toast.info('Session admin fermée');
            }}
            className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-md px-3.5 text-body-s font-medium text-ink-tertiary transition-colors duration-fast hover:bg-elevated-hover hover:text-danger"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
