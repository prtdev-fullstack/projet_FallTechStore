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
 * Deux variantes recolorées à partir du même tracé (public/logo-mark-light.png
 * et -dark.png, générées depuis public/logo.png) : le texte marine d'origine
 * a un contraste de ~1,2:1 sur notre fond sombre quasi noir — pratiquement
 * invisible. La variante sombre reprend exactement les mêmes formes avec le
 * marine remplacé par l'ink clair du thème ; l'ambre, déjà lisible sur les
 * deux fonds, reste inchangé dans les deux fichiers. Le bon fichier s'affiche
 * via la variante `dark:` de Tailwind, câblée sur `data-theme`.
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
        className="block h-9 w-auto shrink-0 dark:hidden"
      />
      <img
        src="/logo-mark-dark.png"
        alt=""
        aria-hidden="true"
        width={416}
        height={220}
        className="hidden h-9 w-auto shrink-0 dark:block"
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
