import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';

interface HorarioEstudianteItem {
  id: string;
  carga: { grupoId: string; grupo: { materia: { nombre: string } } };
}

interface Evaluacion {
  id: string;
  nombre: string;
  porcentaje: number;
  nota: number | null;
}
interface ResultadosEstudiante {
  evaluaciones: Evaluacion[];
  porcentajeEvaluado: number;
  notaAcumuladaParcial: number;
  notaFinal: number | null;
}

export default function MisCalificacionesPage() {
  const { usuario } = useAuth();
  const { data: horario, isLoading, isError, refetch } = useQuery({
    enabled: Boolean(usuario?.perfilId),
    queryKey: ['mi-horario-calificaciones', usuario?.perfilId],
    queryFn: () => api.get<HorarioEstudianteItem[]>(`/horarios/estudiantes/${usuario!.perfilId}`),
  });

  const grupos = Array.from(new Map((horario ?? []).map((h) => [h.carga.grupoId, h.carga.grupo.materia.nombre])));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Mis calificaciones</h1>
        <p className="mt-1 text-sm text-text-muted">Notas por materia inscrita en el periodo actual</p>
      </div>

      {isLoading ? (
        <LoadingState label="Cargando tus materias..." />
      ) : isError ? (
        <ErrorState message="No se pudieron cargar tus materias" onRetry={refetch} />
      ) : grupos.length === 0 ? (
        <EmptyState title="No tienes materias inscritas" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {grupos.map(([grupoId, materia]) => (
            <CalificacionesMateria key={grupoId} grupoId={grupoId} materia={materia} estudianteId={usuario!.perfilId!} />
          ))}
        </div>
      )}
    </div>
  );
}

function CalificacionesMateria({ grupoId, materia, estudianteId }: { grupoId: string; materia: string; estudianteId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['calificaciones', grupoId, estudianteId],
    queryFn: () => api.get<ResultadosEstudiante>(`/calificaciones/grupos/${grupoId}/estudiantes/${estudianteId}`),
  });

  return (
    <Card>
      <CardHeader title={materia} subtitle={data?.notaFinal !== null && data?.notaFinal !== undefined ? `Nota final: ${data.notaFinal}` : 'En proceso de evaluacion'} />
      <CardBody>
        {isLoading ? (
          <LoadingState label="Cargando notas..." />
        ) : isError || !data ? (
          <p className="text-sm text-text-muted">Aun no hay evaluaciones configuradas para esta materia.</p>
        ) : data.evaluaciones.length === 0 ? (
          <EmptyState title="Sin evaluaciones configuradas" />
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {data.evaluaciones.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span className="text-text">{ev.nombre} ({ev.porcentaje}%)</span>
                <span className="font-semibold text-text">{ev.nota ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
