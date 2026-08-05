import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import { RootLayout } from './layouts/RootLayout';
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
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Page autonome : elle porte son propre en-tête. */}
          <Route path={ROUTES.designSystem} element={<DesignSystem />} />

          <Route element={<RootLayout />}>
            <Route path={ROUTES.home} element={<Home />} />
            <Route path={ROUTES.shop} element={<Shop />} />
            <Route path={ROUTES.productPattern} element={<ProductDetail />} />
            <Route path={ROUTES.cart} element={<Cart />} />
            <Route path={ROUTES.checkout} element={<Checkout />} />
            <Route path={ROUTES.about} element={<About />} />
            <Route path={ROUTES.contact} element={<Contact />} />
            <Route path={ROUTES.login} element={<Login />} />
            <Route path={ROUTES.register} element={<Register />} />

            <Route path={ROUTES.account} element={<AccountLayout />}>
              <Route index element={<Navigate to={ROUTES.accountOrders} replace />} />
              <Route path="commandes" element={<AccountOrders />} />
              <Route path="favoris" element={<AccountWishlist />} />
              <Route path="profil" element={<AccountProfile />} />
            </Route>

            {/* Anciennes URL de la version précédente : on redirige plutôt que
                de renvoyer une 404 aux liens déjà partagés. */}
            <Route path="/boutique/*" element={<Navigate to={ROUTES.shop} replace />} />
            <Route path="/a-propos/*" element={<Navigate to={ROUTES.about} replace />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
