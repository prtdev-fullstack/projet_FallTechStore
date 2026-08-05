import { useEffect } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { DURATION, EASE } from '../../constants/motion';
import { cn } from '../../utils/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Vignette optionnelle — la miniature du produit ajouté au panier. */
  thumbnail?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const DURATION_MS = 4200;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2);
    // Plafonné à 3 : au-delà, la pile masque le contenu au lieu d'informer.
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }].slice(-3) }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Raccourcis d'appel depuis n'importe où, y compris hors composant React. */
export const toast = {
  success: (title: string, options?: Partial<Omit<Toast, 'id' | 'tone' | 'title'>>) =>
    useToastStore.getState().push({ tone: 'success', title, ...options }),
  error: (title: string, options?: Partial<Omit<Toast, 'id' | 'tone' | 'title'>>) =>
    useToastStore.getState().push({ tone: 'error', title, ...options }),
  info: (title: string, options?: Partial<Omit<Toast, 'id' | 'tone' | 'title'>>) =>
    useToastStore.getState().push({ tone: 'info', title, ...options }),
};

const toneIcon: Record<ToastTone, React.ReactNode> = {
  success: <Check className="h-4 w-4" aria-hidden="true" />,
  error: <AlertCircle className="h-4 w-4" aria-hidden="true" />,
  info: <Info className="h-4 w-4" aria-hidden="true" />,
};

const toneStyle: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-accent-text',
};

function ToastCard({ item }: { item: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const id = window.setTimeout(() => dismiss(item.id), DURATION_MS);
    return () => window.clearTimeout(id);
  }, [item.id, dismiss]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.96 }}
      transition={{ duration: DURATION.base, ease: EASE.outExpo }}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-border bg-surface/95 p-4 shadow-3 backdrop-blur-xl sm:w-[360px]"
    >
      {item.thumbnail ?? (
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-elevated',
            toneStyle[item.tone],
          )}
        >
          {toneIcon[item.tone]}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-body-s font-semibold text-ink">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-caption text-ink-secondary">{item.description}</p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              dismiss(item.id);
            }}
            className="mt-2 cursor-pointer text-caption font-semibold text-accent-text underline-offset-4 hover:underline"
          >
            {item.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Fermer la notification"
        className="-m-1 shrink-0 cursor-pointer rounded p-1 text-ink-tertiary transition-colors hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

/**
 * Pile de notifications.
 *
 * `aria-live="polite"` : la confirmation d'ajout au panier est annoncée aux
 * lecteurs d'écran sans interrompre la lecture en cours. En bas à droite sur
 * grand écran, en haut sur mobile — pour ne pas recouvrir la barre d'action
 * collante des fiches produit.
 */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-4 top-[calc(var(--header-height)+1rem)] z-[110] flex flex-col items-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:items-end"
    >
      <ul className="flex w-full flex-col gap-3 sm:w-auto">
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
