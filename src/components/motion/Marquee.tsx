import { type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';

interface MarqueeProps {
  children: ReactNode;
  /** Durée d'un cycle complet, en secondes. Plus c'est long, plus c'est calme. */
  speed?: number;
  reverse?: boolean;
  /** Suspend le défilement au survol, pour laisser lire. */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Bandeau défilant en continu (marques partenaires).
 *
 * Le contenu est dupliqué et la piste translate de -50 % : la boucle est donc
 * parfaitement raccordée, sans saut. Le second exemplaire est `aria-hidden`
 * pour ne pas faire lire deux fois la même liste.
 *
 * Sous `prefers-reduced-motion`, le bandeau devient une liste statique
 * défilable à la main — l'information reste accessible.
 */
export function Marquee({
  children,
  speed = 38,
  reverse = false,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={cn('mask-fade-x overflow-x-auto', className)}>
        <div className="flex w-max items-center gap-12">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn('mask-fade-x group relative overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max animate-marquee items-center gap-12',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="flex shrink-0 items-center gap-12 pr-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12 pr-12" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
