import { motion } from 'framer-motion';
import { EASE } from '../../constants/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Écran d'attente affiché pendant le chargement d'une route découpée
 * (`React.lazy`). Le monogramme se trace, puis la barre Aurora balaie —
 * l'attente devient un moment de marque plutôt qu'un vide.
 */
export function RouteLoader() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="flex min-h-[60dvh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Chargement de la page</span>

      <div className="flex flex-col items-center gap-6">
        <span aria-hidden="true" className="font-display text-5xl font-bold leading-none text-ink">
          F
          <motion.span
            className="inline-block text-aurora"
            animate={prefersReducedMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: EASE.inOut }}
          >
            /
          </motion.span>
        </span>

        <span
          aria-hidden="true"
          className="relative h-0.5 w-28 overflow-hidden rounded-full bg-border"
        >
          {!prefersReducedMotion && (
            <motion.span
              className="absolute inset-y-0 w-1/2 rounded-full bg-aurora"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: EASE.inOut }}
            />
          )}
        </span>
      </div>
    </div>
  );
}
