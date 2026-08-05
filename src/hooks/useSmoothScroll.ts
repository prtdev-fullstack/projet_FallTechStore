import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useIsTouch } from './useMediaQuery';

let lenisInstance: Lenis | null = null;

/** Accès à l'instance courante — utilisée par scrollTo() et les ancres. */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Défilement fluide global (Lenis), monté une seule fois par RootLayout.
 *
 * Deux cas où il n'est volontairement PAS activé :
 *   - `prefers-reduced-motion` : détourner le défilement natif est l'une des
 *     premières causes de gêne vestibulaire.
 *   - Appareils tactiles : le défilement natif de iOS et Android est déjà
 *     inertiel et parfaitement calibré ; Lenis le rend au contraire flottant
 *     et casse le « rubber band ».
 */
export function useSmoothScroll(): void {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const rafRef = useRef<number>();

  useEffect(() => {
    if (prefersReducedMotion || isTouch) {
      document.documentElement.classList.add('no-smooth-scroll');
      return;
    }
    document.documentElement.classList.remove('no-smooth-scroll');

    const lenis = new Lenis({
      duration: 1.05,
      // Même famille de courbe que --ease-out-expo : le défilement et les
      // animations d'interface partagent le même « toucher ».
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      lerp: 0.1,
    });
    lenisInstance = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [prefersReducedMotion, isTouch]);
}

/**
 * Défile vers une cible en respectant Lenis s'il est actif, et en retombant
 * sur l'API native sinon (mobile, mouvement réduit).
 */
export function scrollTo(target: string | HTMLElement | number, offset = 0): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, behavior: 'smooth' });
    return;
  }
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/** Suspend le défilement fluide — indispensable quand un drawer est ouvert. */
export function setSmoothScrollPaused(paused: boolean): void {
  const lenis = getLenis();
  if (!lenis) return;
  if (paused) lenis.stop();
  else lenis.start();
}
