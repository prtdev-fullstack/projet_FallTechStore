import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronRight as Sep } from 'lucide-react';
import { DURATION, EASE } from '../../constants/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';

/* ── Fil d'Ariane ──────────────────────────────────────────────────────── */

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; to?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-ink-tertiary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="tap-safe rounded transition-colors duration-fast hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && 'text-ink-secondary')} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <Sep className="h-3 w-3 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Onglets ───────────────────────────────────────────────────────────── */

interface TabsProps {
  tabs: { id: string; label: string; badge?: ReactNode; content: ReactNode }[];
  defaultTab?: string;
  className?: string;
}

/**
 * Onglets accessibles au clavier (flèches, Home/End), avec un indicateur qui
 * glisse d'un onglet à l'autre via `layoutId` — une seule animation partagée
 * plutôt qu'un calcul de position à la main.
 */
export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const groupId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === active);
    if (index < 0) return;
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    setActive(tabs[next].id);
    document.getElementById(`${groupId}-tab-${tabs[next].id}`)?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Sections du produit"
        onKeyDown={onKeyDown}
        className="mask-fade-x -mx-5 flex gap-1 overflow-x-auto border-b border-border-subtle px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`${groupId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${groupId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={cn(
                'relative shrink-0 cursor-pointer whitespace-nowrap px-4 py-3.5 text-body-s font-semibold',
                'transition-colors duration-fast',
                isActive ? 'text-ink' : 'text-ink-tertiary hover:text-ink-secondary',
              )}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}
                {tab.badge}
              </span>
              {isActive && (
                <motion.span
                  layoutId={`${groupId}-indicator`}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: DURATION.base, ease: EASE.outExpo }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${groupId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${groupId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="pt-8 focus-visible:outline-none"
        >
          {tab.id === active && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.outExpo }}
            >
              {tab.content}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Accordéon ─────────────────────────────────────────────────────────── */

export function Accordion({
  items,
  className,
}: {
  items: { id: string; question: string; answer: ReactNode }[];
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn('divide-y divide-border-subtle border-y border-border-subtle', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left transition-colors duration-fast hover:text-accent-text"
              >
                <span className="text-body font-semibold text-ink">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-ink-tertiary transition-transform duration-base ease-out-expo',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`panel-${item.id}`}
                  id={`panel-${item.id}`}
                  initial={prefersReducedMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={prefersReducedMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE.outExpo }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pr-10 text-body-s leading-relaxed text-ink-secondary">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ── Pagination ────────────────────────────────────────────────────────── */

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  // Fenêtre glissante : on n'affiche jamais plus de 5 numéros, quel que soit
  // le nombre de pages — sinon la barre déborde sur mobile.
  const window_ = 2;
  const pages: (number | 'gap')[] = [];
  for (let index = 1; index <= totalPages; index += 1) {
    if (index === 1 || index === totalPages || Math.abs(index - page) <= window_) {
      pages.push(index);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  const itemClass =
    'inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-md px-3 text-body-s font-semibold transition-colors duration-fast';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Page précédente"
        className={cn(itemClass, 'text-ink-secondary hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-30')}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pages.map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-ink-tertiary" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              itemClass,
              'tabular',
              item === page
                ? 'bg-accent-solid text-accent-fg'
                : 'text-ink-secondary hover:bg-elevated hover:text-ink',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Page suivante"
        className={cn(itemClass, 'text-ink-secondary hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-30')}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
