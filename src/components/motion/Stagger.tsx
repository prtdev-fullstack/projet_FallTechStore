import { type ElementType, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { DURATION, EASE } from '../../constants/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface StaggerProps {
  children: ReactNode;
  /** Intervalle entre deux enfants. 40–80 ms : au-delà, la grille traîne. */
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: ElementType;
  className?: string;
}

interface StaggerItemProps {
  children: ReactNode;
  distance?: number;
  as?: ElementType;
  className?: string;
}

const itemVariants = (distance: number): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.outExpo },
  },
});

/**
 * Conteneur qui décale l'apparition de ses enfants `<StaggerItem>`.
 *
 * Préféré à un `delay` calculé par index : ici un seul observateur d'intersection
 * pilote toute la grille, au lieu d'un par carte. Sur un catalogue de 24
 * produits, cela fait 1 observateur au lieu de 24.
 */
export function Stagger({
  children,
  stagger = 0.06,
  delay = 0,
  once = true,
  amount = 0.15,
  as = 'div',
  className,
}: StaggerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, distance = 24, as = 'div', className }: StaggerItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag className={className} variants={itemVariants(distance)}>
      {children}
    </MotionTag>
  );
}
