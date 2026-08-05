import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'promo' | 'aurora';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Occupe toute la largeur disponible. */
  block?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  to?: never;
  href?: never;
}

interface ButtonAsLink extends BaseProps {
  /** Route interne — rendue via React Router. */
  to: string;
  href?: never;
  onClick?: () => void;
  'aria-label'?: string;
}

interface ButtonAsAnchor extends BaseProps {
  /** Lien externe. */
  href: string;
  to?: never;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const base = [
  'relative inline-flex items-center justify-center gap-2 rounded-md font-semibold',
  'cursor-pointer select-none whitespace-nowrap',
  // 200 ms : dans la fenêtre 150–300 ms des micro-interactions.
  'transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-out-expo',
  'active:scale-[0.98]',
  'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
  // L'anneau global de :focus-visible s'applique déjà ; on le renforce ici.
  'focus-visible:outline-2 focus-visible:outline-offset-2',
].join(' ');

const variants: Record<ButtonVariant, string> = {
  /* ion-600 sous texte blanc : 5,2:1, seul aplat bleu qui passe AA. */
  primary: 'bg-accent-solid text-accent-fg hover:bg-accent-solid-hover hover:shadow-glow',
  secondary:
    'bg-elevated text-ink border border-border hover:border-border-strong hover:bg-elevated-hover',
  ghost: 'text-ink-secondary hover:bg-elevated hover:text-ink',
  outline: 'border border-border-strong text-ink hover:border-accent hover:text-accent-text',
  promo: 'bg-promo text-promo-fg hover:brightness-110 hover:shadow-glow-promo',
  aurora:
    'border-aurora text-ink hover:shadow-glow ' +
    'before:absolute before:inset-0 before:rounded-[inherit] before:bg-aurora-soft ' +
    'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-base',
};

/**
 * Hauteurs : `md` fait exactement 44 px, le minimum recommandé pour une cible
 * tactile. `sm` descend à 36 px mais reçoit une zone de frappe étendue sur
 * mobile via un pseudo-élément, sans modifier la mise en page.
 */
const sizes: Record<ButtonSize, string> = {
  sm: [
    'h-9 px-3.5 text-caption',
    "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']",
    'lg:after:hidden',
  ].join(' '),
  md: 'h-11 px-5 text-body-s',
  lg: 'h-[52px] px-7 text-body',
};

function Content({
  loading,
  iconLeft,
  iconRight,
  children,
}: Pick<BaseProps, 'loading' | 'iconLeft' | 'iconRight' | 'children'>) {
  return (
    <>
      {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
      {!loading && iconLeft}
      {children && <span className="relative">{children}</span>}
      {!loading && iconRight}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = 'primary',
    size = 'md',
    block = false,
    loading = false,
    iconLeft,
    iconRight,
    children,
    className,
    ...rest
  } = props as BaseProps & Record<string, unknown>;

  const classes = cn(base, variants[variant], sizes[size], block && 'w-full', className);
  const content = (
    <Content loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
      {children}
    </Content>
  );

  if ('to' in props && props.to) {
    const { to, ...linkRest } = rest as { to: string };
    return (
      <Link to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    const { href, target, ...anchorRest } = rest as { href: string; target?: string };
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={classes}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref}
      type={buttonRest.type ?? 'button'}
      className={classes}
      // Un bouton en cours de traitement reste focusable mais n'est plus
      // actionnable : `disabled` le sortirait de l'ordre de tabulation.
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      {...buttonRest}
      onClick={loading ? undefined : buttonRest.onClick}
    >
      {content}
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatoire : un bouton sans texte visible doit être nommé. */
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  className?: string;
  badge?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'ghost', size = 'md', className, badge, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        base,
        variants[variant],
        // 44 px minimum sur tactile, 40 px sur pointeur fin.
        size === 'md' ? 'h-11 w-11 lg:h-10 lg:w-10' : 'h-10 w-10 lg:h-9 lg:w-9',
        'rounded-md p-0',
        className,
      )}
      {...rest}
    >
      {icon}
      {badge}
    </button>
  );
});
