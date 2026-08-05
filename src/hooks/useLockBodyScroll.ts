import { useEffect } from 'react';
import { setSmoothScrollPaused } from './useSmoothScroll';

let lockCount = 0;
let savedScrollY = 0;

/**
 * Verrouille le défilement de la page pendant qu'une surcouche est ouverte.
 *
 * Trois pièges traités, qui sont les défauts classiques d'un panier en drawer :
 *   1. `position: fixed` sur le body fait sauter la page en haut : on mémorise
 *      et on restaure la position exacte.
 *   2. Masquer la barre de défilement décale toute la mise en page : on
 *      compense par un padding de la largeur exacte de la barre.
 *   3. Lenis continue de tourner sous la surcouche : on le met en pause.
 *
 * Le compteur permet d'empiler plusieurs surcouches sans se marcher dessus.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;
    if (lockCount === 1) {
      savedScrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
      setSmoothScrollPaused(true);
    }

    return () => {
      lockCount -= 1;
      if (lockCount > 0) return;

      const body = document.body;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.paddingRight = '';
      window.scrollTo(0, savedScrollY);
      setSmoothScrollPaused(false);
    };
  }, [locked]);
}
