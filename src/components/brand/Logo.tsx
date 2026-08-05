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
 * Monogramme « F/ » : le F de FallTech, la barre oblique pour la vitesse et le
 * chemin de fichier. La barre porte le dégradé Aurora — c'est le seul endroit
 * du site où le dégradé apparaît en permanence.
 */
export function Logo({ variant = 'full', className, asLink = true }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="font-display text-[1.375rem] font-bold leading-none text-ink"
      >
        F<span className="text-aurora">/</span>
      </span>
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
