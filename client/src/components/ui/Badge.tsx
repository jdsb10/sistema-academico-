import clsx from 'clsx';

type Tono = 'neutral' | 'success' | 'danger' | 'warning' | 'accent';

const TONOS: Record<Tono, string> = {
  neutral: 'border-border bg-surface-alt text-text-muted',
  success: 'border-border bg-success-soft text-success',
  danger: 'border-border bg-danger-soft text-danger',
  warning: 'border-border bg-warning-soft text-warning',
  accent: 'border-border bg-accent-soft text-accent',
};

export function Badge({ tono = 'neutral', children }: { tono?: Tono; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        TONOS[tono],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

const ESTADO_TONO: Record<string, Tono> = {
  ACTIVO: 'success',
  ACTIVA: 'success',
  DISPONIBLE: 'success',
  ABIERTA: 'accent',
  INACTIVO: 'neutral',
  INACTIVA: 'neutral',
  CANCELADA: 'danger',
  RETIRADA: 'neutral',
  BLOQUEADO: 'danger',
  MANTENIMIENTO: 'warning',
  CERRADA: 'neutral',
  CERRADO: 'neutral',
  PLANEADO: 'warning',
  BORRADOR: 'warning',
  PRESENTE: 'success',
  AUSENTE: 'danger',
  TARDANZA: 'warning',
  JUSTIFICADO: 'accent',
};

export function EstadoBadge({ estado }: { estado: string }) {
  return <Badge tono={ESTADO_TONO[estado] ?? 'neutral'}>{estado}</Badge>;
}
