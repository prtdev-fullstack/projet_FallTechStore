import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import { RootLayout } from './layouts/RootLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { RouteLoader } from './components/brand/Loader';

/* ==========================================================================
   Routage.

   Chaque page est chargée à la demande. L'accueil, le catalogue et la fiche
   produit représentent l'essentiel du trafic ; le tunnel de commande, l'espace
   compte et le design system ne sont téléchargés que si on y va. Sans ce
   découpage, un premier visiteur payait le poids du checkout complet avant
   même de voir le héros.
   ========================================================================== */

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DesignSystem = lazy(() => import('./pages/DesignSystem'));

const Login = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Register })));
const AccountLayout = lazy(() =>
  import('./pages/Account').then((m) => ({ default: m.AccountLayout })),
);
const AccountOrders = lazy(() =>
  import('./pages/Account').then((m) => ({ default: m.AccountOrders })),
);
const AccountWishlist = lazy(() =>
  import('./pages/Account').then((m) => ({ default: m.AccountWishlist })),
);
const AccountProfile = lazy(() =>
  import('./pages/Account').then((m) => ({ default: m.AccountProfile })),
);

const AdminLogin = lazy(() =>
  import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })),
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const AdminProducts = lazy(() =>
  import('./pages/admin/AdminProducts').then((m) => ({ default: m.AdminProducts })),
);
const AdminProductForm = lazy(() =>
  import('./pages/admin/AdminProductForm').then((m) => ({ default: m.AdminProductForm })),
);
const AdminOrders = lazy(() =>
  import('./pages/admin/AdminOrders').then((m) => ({ default: m.AdminOrders })),
);
const AdminClients = lazy(() =>
  import('./pages/admin/AdminClients').then((m) => ({ default: m.AdminClients })),
);
const AdminSettings = lazy(() =>
  import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Pages autonomes : elles portent leur propre en-tête. */}
          <Route path={ROUTES.designSystem} element={<DesignSystem />} />
          <Route path={ROUTES.adminLogin} element={<AdminLogin />} />

          {/* Back-office : coquille et navigation séparées de la boutique. */}
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.admin} element={<AdminDashboard />} />
            <Route path={ROUTES.adminProducts} element={<AdminProducts />} />
            <Route path={ROUTES.adminProductNew} element={<AdminProductForm />} />
            <Route path={ROUTES.adminProductPattern} element={<AdminProductForm />} />
            <Route path={ROUTES.adminOrders} element={<AdminOrders />} />
            <Route path={ROUTES.adminClients} element={<AdminClients />} />
            <Route path={ROUTES.adminSettings} element={<AdminSettings />} />
          </Route>

          <Route element={<RootLayout />}>
            <Route path={ROUTES.home} element={<Home />} />
            <Route path={ROUTES.shop} element={<Shop />} />
            <Route path={ROUTES.productPattern} element={<ProductDetail />} />
            <Route path={ROUTES.cart} element={<Cart />} />
            <Route path={ROUTES.checkout} element={<Checkout />} />
            <Route path={ROUTES.login} element={<Login />} />
            <Route path={ROUTES.register} element={<Register />} />

            <Route path={ROUTES.account} element={<AccountLayout />}>
              <Route index element={<Navigate to={ROUTES.accountOrders} replace />} />
              <Route path="commandes" element={<AccountOrders />} />
              <Route path="favoris" element={<AccountWishlist />} />
              <Route path="profil" element={<AccountProfile />} />
            </Route>

            {/* Anciennes URL de la version précédente : on redirige plutôt que
                de renvoyer une 404 aux liens déjà partagés. Les pages À propos
                et Contact ont été retirées : leur contenu utile (garantie,
                livraison, coordonnées) vit désormais dans le pied de page. */}
            <Route path="/boutique/*" element={<Navigate to={ROUTES.shop} replace />} />
            <Route path="/a-propos" element={<Navigate to={ROUTES.home} replace />} />
            <Route path="/contact" element={<Navigate to={ROUTES.home} replace />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
