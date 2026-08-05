import { type ElementType, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { DURATION, EASE } from '../../constants/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';

export type RevealEffect = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'blur' | 'mask';

interface RevealProps {
  children: ReactNode;
  /** Nature de l'apparition. `mask` révèle le contenu derrière un volet. */
  effect?: RevealEffect;
  /** Décalage en pixels du point de départ (ignoré par `fade` et `scale`). */
  distance?: number;
  delay?: number;
  duration?: number;
  /** Rejouer à chaque passage, ou une seule fois (défaut). */
  once?: boolean;
  /** Part de l'élément qui doit être visible pour déclencher. */
  amount?: number;
  as?: ElementType;
  className?: string;
}

function buildVariants(effect: RevealEffect, distance: number, duration: number): Variants {
  const transition = { duration, ease: EASE.outExpo };

  switch (effect) {
    case 'down':
      return { hidden: { opacity: 0, y: -distance }, visible: { opacity: 1, y: 0, transition } };
    case 'left':
      return { hidden: { opacity: 0, x: -distance }, visible: { opacity: 1, x: 0, transition } };
    case 'right':
      return { hidden: { opacity: 0, x: distance }, visible: { opacity: 1, x: 0, transition } };
    case 'fade':
      return { hidden: { opacity: 0 }, visible: { opacity: 1, transition } };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.94 },
        visible: { opacity: 1, scale: 1, transition },
      };
    case 'blur':
      return {
        hidden: { opacity: 0, y: distance * 0.5, filter: 'blur(12px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition },
      };
    case 'mask':
      return {
        hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
        visible: { clipPath: 'inset(0 0 0% 0)', opacity: 1, transition },
      };
    case 'up':
    default:
      return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0, transition } };
  }
}

/**
 * Apparition au défilement.
 *
 * Deux garde-fous volontaires :
 *   - `prefers-reduced-motion` rend le contenu immédiatement visible, sans
 *     animation ni décalage : le contenu ne doit jamais dépendre du mouvement
 *     pour être lisible.
 *   - `margin: -8%` déclenche légèrement avant l'entrée réelle dans le champ,
 *     pour que l'élément soit déjà en place quand l'œil l'atteint. Sans cela,
 *     un défilement rapide donne une page qui « rattrape » son contenu.
 */
export function Reveal({
  children,
  effect = 'up',
  distance = 28,
  delay = 0,
  duration = DURATION.slow,
  once = true,
  amount = 0.2,
  as = 'div',
  className,
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={buildVariants(effect, distance, duration)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
      transition={{ delay }}
      style={effect === 'mask' ? { willChange: 'clip-path, opacity' } : undefined}
    >
      {children}
    </MotionTag>
  );
}
