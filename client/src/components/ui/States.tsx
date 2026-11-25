import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-text-muted" role="status">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
        <Loader2 className="h-5 w-5 animate-spin text-primary-light" aria-hidden />
      </span>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-border bg-surface-alt text-text-muted">
        <Inbox className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-danger-soft text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-text">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-border-strong px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
