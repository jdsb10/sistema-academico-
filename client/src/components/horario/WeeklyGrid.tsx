import { Clock3 } from 'lucide-react';

export interface BloqueHorario {
  id: string;
  dia: string;
  horaInicio: string; // "HH:MM" o ISO con hora en UTC
  horaFin: string;
  titulo: string;
  subtitulo: string;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const DIA_LABEL: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miercoles', JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sabado',
};
const HORA_INICIO = 7;
const HORA_FIN = 19;

function minutosDesde(hora: string): number {
  const hhmm = hora.includes('T') ? hora.slice(11, 16) : hora.slice(0, 5);
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function horaBonita(hora: string) {
  return hora.includes('T') ? hora.slice(11, 16) : hora.slice(0, 5);
}

export function WeeklyGrid({ bloques }: { bloques: BloqueHorario[] }) {
  const totalMinutos = (HORA_FIN - HORA_INICIO) * 60;

  return (
    <div>
      {/* Escritorio: rejilla semanal completa. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface sm:block">
        <div className="grid min-w-[800px] grid-cols-[64px_repeat(6,1fr)] gap-px bg-border">
          <div className="bg-surface" />
          {DIAS.map((dia) => (
            <div key={dia} className="bg-surface-alt px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
              {DIA_LABEL[dia]}
            </div>
          ))}

          <div className="relative bg-surface" style={{ height: `${(HORA_FIN - HORA_INICIO) * 48}px` }}>
            {Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i).map((h) => (
              <div key={h} className="absolute right-1.5 -translate-y-1/2 font-mono text-[10px] text-text-muted" style={{ top: `${((h - HORA_INICIO) * 60 / totalMinutos) * 100}%` }}>
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {DIAS.map((dia) => (
            <div key={dia} className="relative bg-surface" style={{ height: `${(HORA_FIN - HORA_INICIO) * 48}px` }}>
              {Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-border" style={{ top: `${(i * 60 / totalMinutos) * 100}%` }} />
              ))}
              {bloques
                .filter((b) => b.dia === dia)
                .map((b) => {
                  const inicio = minutosDesde(b.horaInicio) - HORA_INICIO * 60;
                  const fin = minutosDesde(b.horaFin) - HORA_INICIO * 60;
                  return (
                    <div
                      key={b.id}
                      className="absolute left-1.5 right-1.5 overflow-hidden rounded-lg border border-[rgba(185,75,39,0.25)] bg-accent-soft p-2 text-accent-strong transition-transform duration-150 hover:-translate-y-0.5"
                      style={{ top: `${(inicio / totalMinutos) * 100}%`, height: `${((fin - inicio) / totalMinutos) * 100}%` }}
                    >
                      <p className="truncate text-xs font-semibold">{b.titulo}</p>
                      <p className="truncate text-[11px]">{b.subtitulo}</p>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Móvil: agenda por día, sin scroll horizontal. */}
      <div className="space-y-3 sm:hidden">
        {DIAS.map((dia) => {
          const delDia = bloques.filter((b) => b.dia === dia);
          return (
            <section key={dia} className="surface-card overflow-hidden">
              <header className="flex items-center justify-between border-b border-border bg-surface-alt px-4 py-3">
                <h3 className="text-[13px] font-semibold text-text">{DIA_LABEL[dia]}</h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  {delDia.length} {delDia.length === 1 ? 'clase' : 'clases'}
                </span>
              </header>
              {delDia.length === 0 ? (
                <p className="px-4 py-4 text-xs text-text-muted">Sin clases programadas</p>
              ) : (
                <ul className="divide-y divide-border">
                  {delDia.map((b) => (
                    <li key={b.id} className="px-4 py-3">
                      <p className="text-sm font-semibold text-text">{b.titulo}</p>
                      <p className="mt-1 text-xs text-text-muted">{b.subtitulo}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-primary-light">
                        <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden /> {horaBonita(b.horaInicio)} – {horaBonita(b.horaFin)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
