import { useRef, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsTouch } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';

interface TiltProps {
  children: ReactNode;
  /** Inclinaison maximale en degrés. 6–10 : au-delà, l'objet paraît en carton. */
  max?: number;
  /** Reflet lumineux qui suit le curseur. */
  glare?: boolean;
  className?: string;
}

/**
 * Carte qui s'incline vers le curseur, avec un reflet qui le suit.
 *
 * `transform-style: preserve-3d` et une perspective explicite : sans elles,
 * Safari aplatit l'effet. Le reflet est un simple dégradé radial en surimpression,
 * donc composé par le GPU — aucun repaint.
 */
export function Tilt({ children, max = 7, glare = true, className }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const disabled = prefersReducedMotion || isTouch;

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);

  const config = { stiffness: 240, damping: 24, mass: 0.5 };
  const srx = useSpring(rotateX, config);
  const sry = useSpring(rotateY, config);
  const sgo = useSpring(glareOpacity, { stiffness: 180, damping: 30 });

  const glareBackground = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgb(var(--white) / 0.14), transparent 60%)`;

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set(-(py - 0.5) * max * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('[perspective:1200px]', className)}>
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={reset}
        style={{
          rotateX: srx,
          rotateY: sry,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className="relative h-full"
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBackground, opacity: sgo }}
          />
        )}
      </motion.div>
    </div>
  );
}
