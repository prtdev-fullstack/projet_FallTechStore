import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge ne connaît que l'échelle Tailwind par défaut. Sans cette
 * configuration, il range `text-body-s` (une taille) et `text-ink` (une
 * couleur) dans le même groupe et supprime la première — le texte des boutons
 * perdait sa taille dès qu'on lui appliquait une couleur.
 *
 * On lui déclare donc nos groupes maison : ils doivent rester alignés sur
 * tailwind.config.js.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-l',
            'display-m',
            'h2',
            'h3',
            'h4',
            'body-l',
            'body',
            'body-s',
            'caption',
            'overline',
          ],
        },
      ],
      'font-family': [{ font: ['display', 'sans', 'mono'] }],
    },
  },
});

/**
 * Fusionne des classes Tailwind en résolvant les conflits.
 * `cn('px-4', condition && 'px-6')` renvoie `px-6` — et non les deux.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
