import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsTouch } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';

interface ParallaxProps {
  children: ReactNode;
  /** Amplitude en pixels sur toute la traversée de l'écran. */
  distance?: number;
  axis?: 'y' | 'x';
  /** Léger zoom en plus de la translation — réservé aux visuels de fond. */
  scaleRange?: [number, number];
  className?: string;
}

/**
 * Parallaxe douce pilotée par la progression du défilement.
 *
 * Volontairement discrète (24–80 px) : la parallaxe agressive est l'un des
 * effets qui vieillissent le plus mal et qui gênent le plus les personnes
 * sensibles au mouvement. Désactivée au tactile, où le rendu saccade parce que
 * le défilement inertiel n'émet pas d'événements en continu.
 */
export function Parallax({
  children,
  distance = 48,
  axis = 'y',
  scaleRange,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Le ressort lisse les à-coups de la molette : sans lui, la parallaxe
  // « claque » à chaque cran.
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  const translate = useTransform(smooth, [0, 1], [distance, -distance]);
  const scale = useTransform(smooth, [0, 0.5, 1], scaleRange ? [scaleRange[0], scaleRange[1], scaleRange[0]] : [1, 1, 1]);

  const disabled = prefersReducedMotion || isTouch;

  return (
    <div ref={ref} className={cn(className)}>
      <motion.div
        style={
          disabled
            ? undefined
            : {
                [axis]: translate,
                scale: scaleRange ? scale : undefined,
                willChange: 'transform',
              }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
