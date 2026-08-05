import { motion, useScroll, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Fine barre de progression de lecture, collée sous l'en-tête.
 *
 * `scaleX` plutôt que `width` : c'est une propriété composée par le GPU, donc
 * animée sans déclencher de mise en page à chaque pixel de défilement.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-aurora"
      style={{ scaleX }}
    />
  );
}
