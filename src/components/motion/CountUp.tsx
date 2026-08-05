import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

interface CountUpProps {
  to: number;
  from?: number;
  /** Durée en millisecondes. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Décélération exponentielle — même famille que --ease-out-expo. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Compteur animé au premier passage dans le champ.
 *
 * Le nombre final est présent dès le départ pour les lecteurs d'écran et les
 * moteurs d'indexation (`aria-label` + fragment visuellement masqué) : un
 * chiffre clé de la page d'accueil ne doit pas exister uniquement en JavaScript.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(prefersReducedMotion ? to : from);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(from + (to - from) * easeOutExpo(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [inView, prefersReducedMotion, from, to, duration]);

  const display =
    decimals > 0 ? value.toFixed(decimals).replace('.', ',') : formatNumber(Math.round(value));
  const final = decimals > 0 ? to.toFixed(decimals).replace('.', ',') : formatNumber(to);

  return (
    <span ref={ref} className={cn('tabular', className)}>
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
      <span className="sr-only">{`${prefix}${final}${suffix}`}</span>
    </span>
  );
}
