import { type ElementType } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../../constants/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';

interface TextRevealProps {
  text: string;
  /** Découpage de l'animation : par mot (défaut) ou par ligne. */
  by?: 'word' | 'line';
  delay?: number;
  stagger?: number;
  once?: boolean;
  as?: ElementType;
  className?: string;
  /** Se déclenche au montage plutôt qu'à l'entrée dans le champ (héros). */
  immediate?: boolean;
}

/**
 * Titre qui se révèle mot à mot, chaque mot montant derrière un volet.
 *
 * Le texte reste un seul nœud lisible pour les lecteurs d'écran (`aria-label`
 * sur le conteneur, `aria-hidden` sur les fragments) : découper un titre en
 * `<span>` sans cette précaution le fait épeler mot par mot.
 */
export function TextReveal({
  text,
  by = 'word',
  delay = 0,
  stagger = 0.05,
  once = true,
  as = 'span',
  className,
  immediate = false,
}: TextRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Tag = as;

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const parts = by === 'word' ? text.split(' ') : text.split('\n');
  const animationProps = immediate
    ? { initial: 'hidden' as const, animate: 'visible' as const }
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once, amount: 0.4, margin: '0px 0px -10% 0px' },
      };

  return (
    <Tag className={cn(className)} aria-label={text}>
      <motion.span
        aria-hidden="true"
        className="inline"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
        {...animationProps}
      >
        {parts.map((part, index) => (
          <span
            key={`${part}-${index}`}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: '110%', opacity: 0 },
                visible: {
                  y: '0%',
                  opacity: 1,
                  transition: { duration: 0.72, ease: EASE.outExpo },
                },
              }}
            >
              {part}
              {by === 'word' && index < parts.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
