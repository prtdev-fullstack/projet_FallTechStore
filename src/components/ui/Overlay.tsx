import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DURATION, EASE } from '../../constants/motion';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';
import { IconButton } from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Piège le focus dans la surcouche et le rend à l'élément déclencheur à la
 * fermeture. Sans cela, la tabulation continue derrière le voile : l'utilisateur
 * au clavier se retrouve à naviguer dans une page qu'il ne voit plus.
 */
function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement>) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    const focusFirst = () => {
      const items = container.querySelectorAll<HTMLElement>(FOCUSABLE);
      (items[0] ?? container).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [active, containerRef]);
}

interface OverlayBaseProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Masque le titre visuellement tout en le gardant pour les lecteurs d'écran. */
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function Scrim({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] bg-[rgb(var(--overlay))] backdrop-blur-sm"
      style={{ opacity: 'var(--overlay-opacity)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: DURATION.fast }}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

/* ── Drawer latéral ────────────────────────────────────────────────────── */

interface DrawerProps extends OverlayBaseProps {
  side?: 'right' | 'left' | 'bottom';
}

export function Drawer({
  open,
  onClose,
  title,
  hideTitle,
  children,
  footer,
  side = 'right',
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLockBodyScroll(open);
  useFocusTrap(open, panelRef);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onKeyDown]);

  const offscreen =
    side === 'bottom' ? { y: '100%' } : side === 'left' ? { x: '-100%' } : { x: '100%' };

  const position =
    side === 'bottom'
      ? 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl'
      : side === 'left'
        ? 'inset-y-0 left-0 w-full max-w-[420px] sm:max-w-[440px]'
        : 'inset-y-0 right-0 w-full max-w-[420px] sm:max-w-[440px]';

  /* Enfants d'AnimatePresence : frères directs et chacun avec sa `key`, jamais
     regroupés dans un fragment — c'est la forme attendue par Framer Motion pour
     suivre la présence de chaque élément séparément.
     L'état de sortie coupe aussi `pointerEvents` : pendant les 320 ms de
     fermeture, le voile et le panneau couvrent encore la page et intercepteraient
     un clic destiné au contenu. */
  return createPortal(
    <AnimatePresence>
      {open && <Scrim key="scrim" onClose={onClose} />}
      {open && (
        <motion.div
          key="drawer-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            'fixed z-[100] flex flex-col border border-border bg-surface shadow-3',
            position,
            className,
          )}
          initial={prefersReducedMotion ? { opacity: 0 } : offscreen}
          animate={prefersReducedMotion ? { opacity: 1 } : { x: 0, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0, pointerEvents: 'none' } : { ...offscreen, pointerEvents: 'none' }}
          transition={{ duration: DURATION.base, ease: EASE.outExpo }}
        >
          {title && (
            <header
              className={cn(
                'flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-5 py-4',
                hideTitle && 'sr-only',
              )}
            >
              <h2 className="text-h4 text-ink">{title}</h2>
              <IconButton
                label="Fermer"
                variant="ghost"
                size="sm"
                icon={<X className="h-5 w-5" />}
                onClick={onClose}
              />
            </header>
          )}

          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

          {footer && (
            <footer className="shrink-0 border-t border-border-subtle bg-elevated p-5">
              {footer}
            </footer>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ── Modale centrée ────────────────────────────────────────────────────── */

export function Modal({ open, onClose, title, children, footer, className }: OverlayBaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLockBodyScroll(open);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && <Scrim key="scrim" onClose={onClose} />}
      {open && (
        <motion.div
          key="modal-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            'fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-3',
            'mb-4 sm:bottom-auto sm:top-1/2 sm:mb-0 sm:-translate-y-1/2',
            className,
          )}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0, pointerEvents: 'none' } : { opacity: 0, y: 16, scale: 0.98, pointerEvents: 'none' }}
          transition={{ duration: DURATION.base, ease: EASE.outExpo }}
        >
          {title && (
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-6 py-4">
              <h2 className="text-h4 text-ink">{title}</h2>
              <IconButton
                label="Fermer"
                variant="ghost"
                size="sm"
                icon={<X className="h-5 w-5" />}
                onClick={onClose}
              />
            </header>
          )}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
          {footer && (
            <footer className="shrink-0 border-t border-border-subtle bg-elevated px-6 py-4">
              {footer}
            </footer>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
