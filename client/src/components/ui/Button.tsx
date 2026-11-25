import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger';
type Tamano = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
}

const VARIANTES: Record<Variante, string> = {
  primary:
    'bg-accent text-white shadow-[0_6px_16px_-8px_rgba(185,75,39,0.9)] hover:bg-accent-hover hover:shadow-[0_10px_20px_-8px_rgba(185,75,39,0.9)] active:bg-accent-hover disabled:bg-[rgba(185,75,39,0.5)] disabled:shadow-none',
  secondary:
    'border border-border-strong bg-surface text-text hover:border-primary-light hover:bg-surface-alt active:bg-surface-alt disabled:text-text-muted',
  ghost: 'bg-transparent text-text hover:bg-surface-alt active:bg-surface-alt disabled:text-text-muted',
  danger: 'bg-danger text-white hover:bg-[#982c25] active:bg-[#982c25] disabled:bg-[rgba(179,55,47,0.5)]',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-11 gap-1.5 px-3 text-[13px]',
  md: 'h-11 gap-2 px-4 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variante = 'primary', tamano = 'md', cargando, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || cargando}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150',
        'hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none',
        VARIANTES[variante],
        TAMANOS[tamano],
        className,
      )}
      {...props}
    >
      {cargando ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Procesando…
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = 'Button';
