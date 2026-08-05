import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Check, ChevronDown, Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

/* ==========================================================================
   Champs de formulaire.

   Règles tenues partout dans ce fichier :
     - un <label for> réel, jamais un simple placeholder ;
     - le message d'erreur est adjacent au champ et relié par aria-describedby ;
     - aria-invalid en plus de la couleur : l'erreur ne repose jamais sur le
       seul rouge ;
     - hauteur 44 px minimum, la cible tactile de référence.
   ========================================================================== */

const fieldBase = [
  'w-full rounded-md border bg-elevated px-4 text-body-s text-ink',
  'placeholder:text-ink-tertiary',
  'transition-colors duration-fast ease-out-expo',
  'hover:border-border-strong',
  'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={id} className="text-body-s font-medium text-ink">
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-caption text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-caption text-ink-tertiary">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/* ── Input ─────────────────────────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, iconLeft, className, wrapperClassName, id, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <div className="relative">
        {iconLeft && (
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary"
            aria-hidden="true"
          >
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            fieldBase,
            'h-11',
            iconLeft && 'pl-11',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...rest}
        />
      </div>
    </FieldShell>
  );
});

/* ── Textarea ──────────────────────────────────────────────────────────── */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, wrapperClassName, id, required, rows = 5, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(
          fieldBase,
          'resize-y py-3 leading-relaxed',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  );
});

/* ── Select ────────────────────────────────────────────────────────────── */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, className, wrapperClassName, id, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            fieldBase,
            'h-11 cursor-pointer appearance-none pr-11',
            error && 'border-danger',
            className,
          )}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
});

/* ── Checkbox ──────────────────────────────────────────────────────────── */

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  count?: number;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, count, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        'group flex min-h-[44px] cursor-pointer select-none items-center gap-3 rounded-md px-2 py-1.5',
        'transition-colors duration-fast hover:bg-elevated',
        className,
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-[6px] border border-border-strong bg-elevated transition-colors duration-fast checked:border-accent-solid checked:bg-accent-solid focus-visible:outline-2 focus-visible:outline-offset-2"
          {...rest}
        />
        <Check
          className="pointer-events-none absolute h-3.5 w-3.5 scale-50 text-accent-fg opacity-0 transition-all duration-fast ease-spring peer-checked:scale-100 peer-checked:opacity-100"
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-1 items-center justify-between gap-2 text-body-s text-ink-secondary transition-colors group-hover:text-ink">
        <span>{label}</span>
        {typeof count === 'number' && (
          <span className="tabular text-caption text-ink-tertiary">{count}</span>
        )}
      </span>
    </label>
  );
});

/* ── Carte-radio (mode de livraison, moyen de paiement) ────────────────── */

interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  { label, description, icon, trailing, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        'group relative flex cursor-pointer items-center gap-4 rounded-md border border-border bg-elevated p-4',
        'transition-all duration-fast ease-out-expo hover:border-border-strong',
        'has-[:checked]:border-accent has-[:checked]:bg-accent/[0.07] has-[:checked]:shadow-glow',
        className,
      )}
    >
      <input ref={ref} id={fieldId} type="radio" className="sr-only" {...rest} />
      {/* La pastille est un descendant, pas un frère, de l'input : on passe donc
          par group-has-[:checked] et non par peer-checked, qui exige une
          relation de fratrie directe. */}
      <span
        aria-hidden="true"
        className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong transition-colors duration-fast group-has-[:checked]:border-accent"
      >
        <span className="h-2.5 w-2.5 scale-0 rounded-full bg-accent transition-transform duration-fast ease-spring group-has-[:checked]:scale-100" />
      </span>
      {icon && <span className="shrink-0 text-ink-secondary">{icon}</span>}
      <span className="flex-1">
        <span className="block text-body-s font-semibold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-caption text-ink-tertiary">{description}</span>}
      </span>
      {trailing}
    </label>
  );
});

/* ── Sélecteur de quantité ─────────────────────────────────────────────── */

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label = 'Quantité',
  size = 'md',
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const buttonSize = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

  return (
    <div
      className={cn('inline-flex items-center rounded-md border border-border bg-elevated', className)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className={cn(
          buttonSize,
          'flex cursor-pointer items-center justify-center rounded-l-md text-ink-secondary',
          'transition-colors duration-fast hover:bg-elevated-hover hover:text-ink',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        aria-label={`${label} : ${value}`}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value.replace(/\D/g, ''), 10);
          if (!Number.isNaN(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
        className={cn(
          'tabular w-10 border-x border-border bg-transparent text-center text-body-s font-semibold text-ink',
          'focus:outline-none focus-visible:bg-elevated-hover',
          size === 'sm' ? 'h-9' : 'h-11',
        )}
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className={cn(
          buttonSize,
          'flex cursor-pointer items-center justify-center rounded-r-md text-ink-secondary',
          'transition-colors duration-fast hover:bg-elevated-hover hover:text-ink',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
