/* ==========================================================================
   Constantes de mouvement — source unique partagée par Framer Motion et le CSS.
   Les valeurs reflètent exactement les tokens de src/styles/tokens.css.
   ========================================================================== */

import type { Transition, Variants } from 'framer-motion';

/** Courbes de Bézier, identiques aux --ease-* du CSS. */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  spring: [0.34, 1.56, 0.64, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** Durées en secondes (Framer Motion), miroir des --duration-* en ms. */
export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.56,
  cinematic: 0.9,
} as const;

/** Transition par défaut du projet. */
export const transition: Transition = {
  duration: DURATION.base,
  ease: EASE.outExpo,
};

/** Ressort utilisé pour les micro-interactions (hover, tap, magnétisme). */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
  mass: 0.7,
};

/* ── Variantes réutilisables ─────────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.outExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE.outExpo } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE.outExpo },
  },
};

/** Conteneur qui décale l'apparition de ses enfants. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** Transition de page — utilisée par <PageTransition>. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE.outExpo },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.fast, ease: EASE.inOut },
  },
};

/** Seuil d'apparition au scroll, commun à tous les <Reveal>. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;
