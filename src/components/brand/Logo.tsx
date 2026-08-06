import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface LogoProps {
  /** `full` ajoute le mot-symbole, `mark` n'affiche que le monogramme. */
  variant?: 'full' | 'mark';
  className?: string;
  /** Rend un lien vers l'accueil (défaut) ou un simple bloc. */
  asLink?: boolean;
}

/**
 * Monogramme « FT » — fourni par l'utilisateur (public/logo.png), recadré et
 * optimisé en public/logo-mark.png (482×184, 18 Ko, fond transparent).
 *
 * Le mot-symbole « FallTech / STORE » reste du texte dans la couleur de
 * l'interface (`text-ink`), pas une partie de l'image : le dégradé chromé de
 * l'image d'origine perd tout contraste sur fond blanc en thème clair, alors
 * que du texte theme-adaptatif reste lisible dans les deux thèmes.
 */
export function Logo({ variant = 'full', className, asLink = true }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src="/logo-mark.png"
        alt=""
        aria-hidden="true"
        width={482}
        height={184}
        className="h-7 w-auto shrink-0"
      />
      {variant === 'full' && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-body font-semibold tracking-tight text-ink">
            FallTech
          </span>
          <span className="mt-0.5 text-[0.625rem] font-semibold tracking-[0.22em] text-ink-tertiary">
            STORE
          </span>
        </span>
      )}
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
