import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Columna<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columnas: Columna<T>[];
  datos: T[];
  claveFila: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ columnas, datos, claveFila, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((item) => (
            <tr
              key={claveFila(item)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer' : undefined}
            >
              {columnas.map((col) => (
                <td key={col.header} data-label={col.header} className={col.className}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  pagina,
  totalPaginas,
  onChange,
}: {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
        Página {pagina} de {totalPaginas}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          className="inline-flex h-11 items-center gap-1 rounded-lg border border-border-strong px-3 text-xs font-semibold text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:text-text-muted"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Anterior
        </button>
        <button
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          className="inline-flex h-11 items-center gap-1 rounded-lg border border-border-strong px-3 text-xs font-semibold text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:text-text-muted"
        >
          Siguiente <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
