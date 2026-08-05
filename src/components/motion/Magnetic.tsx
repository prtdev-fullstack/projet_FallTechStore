import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsTouch } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';

interface MagneticProps {
  children: ReactNode;
  /** Amplitude du déplacement, en pixels. Au-delà de 12, l'effet devient gadget. */
  strength?: number;
  /** Le contenu suit le curseur un peu moins que le conteneur : effet de profondeur. */
  childStrength?: number;
  className?: string;
}

/**
 * Effet magnétique : l'élément est légèrement attiré par le curseur.
 *
 * Strictement réservé au pointeur fin. Au doigt, il n'y a pas de survol : le
 * calcul serait du travail pur perte et provoquerait un saut au moment du tap.
 */
export function Magnetic({ children, strength = 8, childStrength = 4, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);

  const config = { stiffness: 260, damping: 22, mass: 0.4 };
  const sx = useSpring(x, config);
  const sy = useSpring(y, config);
  const six = useSpring(innerX, config);
  const siy = useSpring(innerY, config);

  const disabled = prefersReducedMotion || isTouch;

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(relX * strength * 2);
    y.set(relY * strength * 2);
    innerX.set(relX * childStrength * 2);
    innerY.set(relY * childStrength * 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    innerX.set(0);
    innerY.set(0);
  };

  if (disabled) {
    return <div className={cn('inline-flex', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex', className)}
      style={{ x: sx, y: sy }}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
    >
      <motion.div className="inline-flex w-full" style={{ x: six, y: siy }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
