import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('surface-card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug text-text">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('p-5 sm:p-6', className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="stat-card animate-enter">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-text-muted">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary-light">
            {icon}
          </span>
        )}
      </div>
      <strong className="stat-value">{value}</strong>
      {hint && <p className="mt-2 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
