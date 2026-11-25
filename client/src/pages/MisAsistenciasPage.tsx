import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatFecha } from '../lib/format';
import { Card, CardBody, StatCard } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { CalendarCheck } from 'lucide-react';

interface DetalleAsistencia {
  id: string;
  estado: string;
  horaRegistro: string;
  origen: string;
  asistencia: {
    tema: string;
    fecha: string;
    carga: { grupo: { materia: { nombre: string } } };
  };
}

interface Resumen {
  detalles: DetalleAsistencia[];
  resumen: { total: number; presentes: number; porcentajeAsistencia: number | null };
}

export default function MisAsistenciasPage() {
  const { usuario } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    enabled: Boolean(usuario?.perfilId),
    queryKey: ['mis-asistencias', usuario?.perfilId],
    queryFn: () => api.get<Resumen>(`/asistencias/estudiantes/${usuario!.perfilId}/resumen`),
  });

  if (isLoading) return <LoadingState label="Cargando tus asistencias..." />;
  if (isError || !data) return <ErrorState message="No se pudieron cargar tus asistencias" onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Mis asistencias</h1>
        <p className="mt-1 text-sm text-text-muted">Historial de asistencia a todas tus materias</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Sesiones registradas" value={data.resumen.total} icon={<CalendarCheck className="h-4 w-4" />} />
        <StatCard label="Presentes" value={data.resumen.presentes} />
        <StatCard label="% de asistencia" value={data.resumen.porcentajeAsistencia !== null ? `${data.resumen.porcentajeAsistencia}%` : 'Sin datos'} />
      </div>

      <Card>
        <CardBody className="p-0">
          {data.detalles.length === 0 ? (
            <EmptyState title="Aun no tienes registros de asistencia" />
          ) : (
            <Table<DetalleAsistencia>
              claveFila={(d) => d.id}
              datos={data.detalles}
              columnas={[
                { header: 'Materia', render: (d) => d.asistencia.carga.grupo.materia.nombre },
                { header: 'Tema', render: (d) => d.asistencia.tema },
                { header: 'Fecha', render: (d) => formatFecha(d.asistencia.fecha) },
                { header: 'Estado', render: (d) => <EstadoBadge estado={d.estado} /> },
                { header: 'Origen', render: (d) => d.origen },
              ]}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
