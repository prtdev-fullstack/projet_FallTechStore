import { useEffect, useState } from 'react';

type Direction = 'up' | 'down';

interface ScrollState {
  direction: Direction;
  /** Vrai dès que la page a quitté le tout début — sert à contracter l'en-tête. */
  isScrolled: boolean;
  /** Vrai quand on descend en étant déjà loin du haut — sert à masquer l'en-tête. */
  isHidden: boolean;
}

/**
 * État de défilement dérivé, calculé dans un rAF pour ne jamais bloquer le
 * thread principal pendant le scroll.
 *
 * On expose des booléens et non la position continue : un composant abonné à
 * `scrollY` se rendrait à chaque pixel, alors qu'ici il ne se rend que lorsque
 * l'état change réellement.
 */
export function useScrollDirection(threshold = 12): ScrollState {
  const [state, setState] = useState<ScrollState>({
    direction: 'up',
    isScrolled: false,
    isHidden: false,
  });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;

      if (Math.abs(delta) >= threshold) {
        const direction: Direction = delta > 0 ? 'down' : 'up';
        lastY = y;
        setState((prev) => {
          const next: ScrollState = {
            direction,
            isScrolled: y > 8,
            // On ne masque l'en-tête qu'au-delà d'une pleine hauteur d'en-tête,
            // sinon il disparaîtrait au moindre soubresaut en haut de page.
            isHidden: direction === 'down' && y > 160,
          };
          if (
            prev.direction === next.direction &&
            prev.isScrolled === next.isScrolled &&
            prev.isHidden === next.isHidden
          ) {
            return prev;
          }
          return next;
        });
      } else {
        setState((prev) => {
          const isScrolled = y > 8;
          return prev.isScrolled === isScrolled ? prev : { ...prev, isScrolled };
        });
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return state;
}
