import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

const CAMPO_BASE =
  'h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text placeholder:text-[rgba(93,107,102,0.8)] ' +
  'transition-colors duration-150 hover:border-primary-light focus:border-accent disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-text-muted';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generado = useId();
    const inputId = id ?? props.name ?? generado;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="field-label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={clsx(CAMPO_BASE, error && 'border-danger focus:border-danger', className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? <span className="text-xs font-medium text-danger">{error}</span> : hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ label, error, hint, id, className, children, ...props }, ref) => {
    const generado = useId();
    const selectId = id ?? props.name ?? generado;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={selectId} className="field-label">{label}</label>}
        <select ref={ref} id={selectId} className={clsx(CAMPO_BASE, 'cursor-pointer pr-8', error && 'border-danger', className)} {...props}>
          {children}
        </select>
        {error ? <span className="text-xs font-medium text-danger">{error}</span> : hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
      </div>
    );
  },
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generado = useId();
    const areaId = id ?? props.name ?? generado;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={areaId} className="field-label">{label}</label>}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(
            'min-h-[96px] w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-text placeholder:text-[rgba(93,107,102,0.8)]',
            'transition-colors duration-150 hover:border-primary-light focus:border-accent disabled:bg-surface-alt',
            error && 'border-danger',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs font-medium text-danger">{error}</span> : hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
