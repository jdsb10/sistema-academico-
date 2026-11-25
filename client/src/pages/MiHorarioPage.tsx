import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import type { Grupo, Paginado } from '../types/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';
import { WeeklyGrid, type BloqueHorario } from '../components/horario/WeeklyGrid';

interface CargaDocente {
  codigo_horario_docente: string;
  nombre_materia: string;
  nombre_aula: string;
  grupo: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface HorarioEstudianteItem {
  id: string;
  carga: {
    grupoId: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
    grupo: { materia: { nombre: string } };
    aula: { nombre: string };
  };
}

export default function MiHorarioPage() {
  const { usuario } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();
  const esDocente = usuario?.rol === 'DOCENTE';

  const { data, isLoading, isError, refetch } = useQuery<CargaDocente[] | HorarioEstudianteItem[]>({
    enabled: Boolean(usuario?.perfilId),
    queryKey: ['mi-horario', usuario?.perfilId],
    queryFn: () =>
      esDocente
        ? api.get<CargaDocente[]>(`/horarios/docentes/${usuario!.perfilId}`)
        : api.get<HorarioEstudianteItem[]>(`/horarios/estudiantes/${usuario!.perfilId}`),
  });

  const bloques: BloqueHorario[] = esDocente
    ? ((data as CargaDocente[] | undefined) ?? []).map((c) => ({
        id: c.codigo_horario_docente,
        dia: c.dia,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin,
        titulo: c.nombre_materia,
        subtitulo: `${c.grupo} · ${c.nombre_aula}`,
      }))
    : ((data as HorarioEstudianteItem[] | undefined) ?? []).map((h) => ({
        id: h.id,
        dia: h.carga.dia,
        horaInicio: h.carga.horaInicio,
        horaFin: h.carga.horaFin,
        titulo: h.carga.grupo.materia.nombre,
        subtitulo: h.carga.aula.nombre,
      }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Mi horario</h1>
          <p className="mt-1 text-sm text-text-muted">Vista semanal de lunes a sabado</p>
        </div>
        {!esDocente && <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Inscribir grupo</Button>}
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <LoadingState label="Cargando horario..." />
          ) : isError ? (
            <ErrorState message="No se pudo cargar el horario" onRetry={refetch} />
          ) : bloques.length === 0 ? (
            <EmptyState title="Aun no tienes clases en el horario" />
          ) : (
            <WeeklyGrid bloques={bloques} />
          )}
        </CardBody>
      </Card>

      {!esDocente && modalAbierto && (
        <InscribirGrupoModal
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['mi-horario'] });
            setModalAbierto(false);
          }}
        />
      )}
    </div>
  );
}

function InscribirGrupoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { usuario } = useAuth();
  const [grupoId, setGrupoId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: grupos } = useQuery({ queryKey: ['grupos-select'], queryFn: () => api.get<Paginado<Grupo>>('/grupos?tamano=100') });

  const mutation = useMutation({
    mutationFn: () => api.post(`/horarios/estudiantes/${usuario!.perfilId}/grupos`, { grupoId }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo inscribir el grupo'),
  });

  return (
    <Modal titulo="Inscribir grupo" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Select label="Grupo" required value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
          <option value="">Seleccione un grupo</option>
          {grupos?.datos.map((g) => <option key={g.id} value={g.id}>{g.materia.nombre} - {g.codigo}</option>)}
        </Select>
        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Inscribir</Button>
        </div>
      </form>
    </Modal>
  );
}
