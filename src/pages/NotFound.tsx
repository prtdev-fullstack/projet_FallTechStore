import { ROUTES } from '../constants/routes';
import { products } from '../data/products';
import { Button } from '../components/ui';
import { ProductCard } from '../components/commerce/ProductCard';
import { Reveal, Stagger, StaggerItem, TextReveal } from '../components/motion';
import { Seo } from '../components/seo/Seo';

/**
 * Page 404.
 *
 * Elle n'existait pas dans la version d'origine : toute URL inconnue affichait
 * une page blanche, sans en-tête ni moyen de repartir. Ici, on propose une
 * sortie immédiate et quatre produits, plutôt qu'un cul-de-sac.
 */
export default function NotFound() {
  const suggestions = products.filter((product) => product.featured).slice(0, 4);

  return (
    <div className="container-page py-20 md:py-28">
      <Seo title="Page introuvable" description="Cette page n'existe pas ou n'est plus disponible." noIndex />
      <div className="relative mx-auto max-w-2xl text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/4 animate-aurora-drift rounded-full bg-aurora-radial blur-3xl"
        />
        <div className="relative">
          <p className="font-display text-display-xl leading-none text-aurora">404</p>
          <h1 className="mt-6 text-h2 text-ink">
            <TextReveal text="Cette page n’existe pas" immediate />
          </h1>
          <Reveal effect="up" delay={0.2}>
            <p className="mx-auto mt-5 max-w-md text-balance text-body-l text-ink-secondary">
              Le lien est peut-être périmé, ou le produit n'est plus au catalogue. Voici par où
              repartir.
            </p>
          </Reveal>
          <Reveal effect="up" delay={0.3}>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to={ROUTES.shop} size="lg">
                Voir le catalogue
              </Button>
              <Button to={ROUTES.home} size="lg" variant="secondary">
                Retour à l'accueil
              </Button>
            </div>
          </Reveal>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="mb-8 text-h3 text-ink">Nos meilleures ventes</h2>
        <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
          {suggestions.map((product) => (
            <StaggerItem key={product.slug} className="h-full">
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
