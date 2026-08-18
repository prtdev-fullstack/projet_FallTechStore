import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface LogoProps {
  className?: string;
  /** Rend un lien vers l'accueil (défaut) ou un simple bloc. */
  asLink?: boolean;
}

/**
 * Logo fourni par l'utilisateur (public/logo.png) : icône sac + ticket et
 * mot-symbole « FALL TECH STORE » déjà intégrés à l'image — aucun texte
 * séparé n'est donc rendu à côté.
 *
 * Variante recolorée à partir du tracé d'origine (public/logo-mark-light.png,
 * générée depuis public/logo.png) : le texte marine d'origine a un contraste
 * trop faible sur certains fonds, cette version le corrige. Le site n'ayant
 * qu'un seul thème (clair), c'est la seule variante nécessaire.
 */
export function Logo({ className, asLink = true }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src="/logo-mark-light.png"
        alt=""
        aria-hidden="true"
        width={416}
        height={220}
        className="block h-12 w-auto shrink-0"
      />
      <span className="sr-only">FallTech Store, retour à l'accueil</span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      to="/"
      className="group inline-flex min-h-[44px] shrink-0 items-center rounded transition-opacity duration-fast hover:opacity-80"
      aria-label="FallTech Store, retour à l'accueil"
    >
      {content}
    </Link>
  );
}
