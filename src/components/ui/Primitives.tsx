import { type ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatPrice, formatPriceShort, formatRating, discountPercent } from '../../utils/format';

/* ==========================================================================
   Primitives d'affichage — sans état, sans dépendance métier.
   ========================================================================== */

/* ── Badge ─────────────────────────────────────────────────────────────── */

type BadgeTone = 'neutral' | 'accent' | 'promo' | 'success' | 'danger' | 'aurora';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-elevated text-ink-secondary border border-border',
  accent: 'bg-accent/15 text-accent-text border border-accent/30',
  promo: 'bg-promo text-promo-fg',
  success: 'bg-success/15 text-success border border-success/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
  aurora: 'bg-aurora text-carbon-950',
};

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-caption font-semibold leading-none',
        badgeTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ── Chip (filtre actif, sélection) ────────────────────────────────────── */

export function Chip({
  children,
  active = false,
  onClick,
  className,
  count,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-body-s font-medium',
        'transition-colors duration-fast ease-out-expo',
        active
          ? 'border-accent bg-accent/15 text-accent-text'
          : 'border-border bg-elevated text-ink-secondary hover:border-border-strong hover:text-ink',
        className,
      )}
    >
      {children}
      {typeof count === 'number' && (
        <span className="tabular text-caption text-ink-tertiary">{count}</span>
      )}
    </button>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative overflow-hidden rounded-md bg-elevated', className)}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-sheen" />
    </div>
  );
}

/* ── Note ──────────────────────────────────────────────────────────────── */

export function Rating({
  value,
  count,
  size = 'sm',
  showValue = true,
  className,
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}) {
  const starSize = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const label = count
    ? `Note de ${formatRating(value)} sur 5, basée sur ${count} avis`
    : `Note de ${formatRating(value)} sur 5`;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={label}>
      <span className="flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => {
          const filled = value - index;
          return (
            <span key={index} className="relative">
              <Star className={cn(starSize, 'text-border-strong')} />
              {filled > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${Math.min(1, filled) * 100}%` }}
                >
                  <Star className={cn(starSize, 'fill-promo text-promo')} />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span aria-hidden="true" className="tabular text-caption text-ink-secondary">
          {formatRating(value)}
          {count !== undefined && ` · ${count} avis`}
        </span>
      )}
    </span>
  );
}

/* ── Prix ──────────────────────────────────────────────────────────────── */

export function PriceTag({
  price,
  originalPrice,
  size = 'md',
  short = false,
  className,
}: {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  short?: boolean;
  className?: string;
}) {
  const format = short ? formatPriceShort : formatPrice;
  const discount = originalPrice ? discountPercent(originalPrice, price) : 0;

  const sizeClasses = {
    sm: 'text-body-s',
    md: 'text-h4',
    lg: 'text-h3',
  }[size];

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('tabular font-display font-semibold text-ink', sizeClasses)}>
        {format(price)}
      </span>
      {discount > 0 && originalPrice && (
        <>
          <s className="tabular text-caption text-ink-tertiary">{formatPriceShort(originalPrice)}</s>
          <span className="sr-only">soit {discount} % de remise</span>
        </>
      )}
    </span>
  );
}

/* ── Séparateur ────────────────────────────────────────────────────────── */

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (!label) {
    return <hr className={cn('border-0 border-t border-border-subtle', className)} />;
  }
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <hr className="flex-1 border-0 border-t border-border-subtle" />
      <span className="text-overline uppercase text-ink-tertiary">{label}</span>
      <hr className="flex-1 border-0 border-t border-border-subtle" />
    </div>
  );
}

/* ── État vide ─────────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  /**
   * Niveau du titre. Quand l'état vide occupe toute une page — un panier vide,
   * par exemple — il devient le titre principal et doit être un `h1` : sans
   * cela, la page n'a aucun titre de niveau 1 et la hiérarchie est cassée.
   */
  titleAs: Title = 'h3',
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  titleAs?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-20 text-center', className)}>
      {icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-elevated text-ink-tertiary">
          {icon}
        </div>
      )}
      <Title className="text-h3 text-ink">{title}</Title>
      {description && (
        <p className="mt-3 max-w-md text-balance text-body text-ink-secondary">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
