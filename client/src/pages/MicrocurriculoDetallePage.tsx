import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import type { Docente, Paginado, Periodo } from '../types/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { EstadoBadge, Badge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';

interface Microcurriculo {
  id: string;
  codigo: string;
  numeroCreditos: number;
  materia: { id: string; nombre: string };
  programa: { id: string; nombre: string };
  estado: string;
}

interface Competencia {
  id: string;
  codigo: string;
  unidadTematica: string;
  resultadosAprendizaje: string;
  orden: number;
}

interface DetallePlan {
  id: string;
  avance: 'PENDIENTE' | 'EN_CURSO' | 'DESARROLLADO';
  porcentajeAvance: number;
  contenido: { id: string; unidadTematica: string; orden: number };
}

interface Plan {
  id: string;
  codigo: string;
  anioLectivo: number;
  estado: string;
  microcurriculo: { id: string };
  docente: { id: string; nombres: string; apellidos: string };
  periodo: { id: string; nombre: string };
  detalles: DetallePlan[];
}

export default function MicrocurriculoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const puedeGestionar = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR';
  const [modalCompetencia, setModalCompetencia] = useState(false);
  const [modalPlan, setModalPlan] = useState(false);
  const [planSeguimiento, setPlanSeguimiento] = useState<Plan | null>(null);
  const queryClient = useQueryClient();

  const { data: microcurriculo, isLoading, isError, refetch } = useQuery({
    queryKey: ['microcurriculo', id],
    queryFn: () => api.get<Microcurriculo>(`/microcurriculos/${id}`),
  });

  const { data: competencias } = useQuery({
    queryKey: ['competencias', id],
    queryFn: () => api.get<Competencia[]>(`/competencias?microcurriculoId=${id}`),
  });

  const { data: planesDelMicro, refetch: refetchPlanesDelMicro } = useQuery({
    queryKey: ['planes-micro', id],
    queryFn: async () => {
      const todos = await api.get<Plan[]>('/planes-microcurriculares');
      return todos.filter((p) => p.microcurriculo.id === id);
    },
  });

  if (isLoading) return <LoadingState label="Cargando microcurriculo..." />;
  if (isError || !microcurriculo) return <ErrorState message="No se pudo cargar el microcurriculo" onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">{microcurriculo.materia.nombre}</h1>
        <p className="mt-1 text-sm text-text-muted">
          <span className="font-mono text-xs">{microcurriculo.codigo}</span> · {microcurriculo.programa.nombre} · {microcurriculo.numeroCreditos} creditos
        </p>
      </div>

      <Card>
        <CardHeader
          title="Competencias especificas"
          subtitle="Contenido programatico por unidad tematica"
          action={puedeGestionar && <Button tamano="sm" onClick={() => setModalCompetencia(true)}><Plus className="h-4 w-4" /> Nueva unidad</Button>}
        />
        <CardBody className="p-0">
          {!competencias || competencias.length === 0 ? (
            <EmptyState title="Aun no hay unidades tematicas registradas" />
          ) : (
            <Table<Competencia>
              claveFila={(c) => c.id}
              datos={competencias}
              columnas={[
                { header: 'Orden', render: (c) => c.orden },
                { header: 'Codigo', render: (c) => <span className="font-mono text-xs">{c.codigo}</span> },
                { header: 'Unidad tematica', render: (c) => c.unidadTematica },
                { header: 'Resultados de aprendizaje', render: (c) => <span className="line-clamp-2 text-sm text-text-muted">{c.resultadosAprendizaje}</span> },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Planes de microcurriculo"
          subtitle="Seguimiento por docente y periodo academico"
          action={puedeGestionar && <Button tamano="sm" onClick={() => setModalPlan(true)}><Plus className="h-4 w-4" /> Nuevo plan</Button>}
        />
        <CardBody className="p-0">
          {!planesDelMicro || planesDelMicro.length === 0 ? (
            <EmptyState title="Aun no hay planes registrados para este microcurriculo" />
          ) : (
            <Table<Plan>
              claveFila={(p) => p.id}
              datos={planesDelMicro}
              onRowClick={(p) => setPlanSeguimiento(p)}
              columnas={[
                { header: 'Codigo', render: (p) => <span className="font-mono text-xs">{p.codigo}</span> },
                { header: 'Docente', render: (p) => `${p.docente.nombres} ${p.docente.apellidos}` },
                { header: 'Periodo', render: (p) => p.periodo.nombre },
                { header: 'Avance', render: (p) => {
                  const total = p.detalles.length || 1;
                  const promedio = Math.round(p.detalles.reduce((acc, d) => acc + d.porcentajeAvance, 0) / total);
                  return <Badge tono={promedio === 100 ? 'success' : promedio > 0 ? 'accent' : 'neutral'}>{promedio}%</Badge>;
                } },
                { header: 'Estado', render: (p) => <EstadoBadge estado={p.estado} /> },
              ]}
            />
          )}
        </CardBody>
      </Card>

      {modalCompetencia && (
        <CompetenciaFormModal
          microcurriculoId={id!}
          orden={(competencias?.length ?? 0) + 1}
          onClose={() => setModalCompetencia(false)}
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['competencias', id] }); setModalCompetencia(false); }}
        />
      )}

      {modalPlan && (
        <PlanFormModal
          microcurriculoId={id!}
          materiaId={microcurriculo.materia.id}
          programaId={microcurriculo.programa.id}
          onClose={() => setModalPlan(false)}
          onSuccess={() => { refetchPlanesDelMicro(); setModalPlan(false); }}
        />
      )}

      {planSeguimiento && (
        <SeguimientoPlanModal
          plan={planSeguimiento}
          onClose={() => setPlanSeguimiento(null)}
          onChanged={refetchPlanesDelMicro}
        />
      )}
    </div>
  );
}

function CompetenciaFormModal({
  microcurriculoId, orden, onClose, onSuccess,
}: { microcurriculoId: string; orden: number; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    codigo: '', unidadTematica: '', competenciasEspecificas: '', resultadosAprendizaje: '',
    nivelSuperior: '', nivelNormal: '', nivelBajo: '', nivelDeficiente: '',
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.post('/competencias', { ...form, microcurriculoId, orden }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear la unidad tematica'),
  });

  return (
    <Modal titulo="Nueva unidad tematica" onClose={onClose} ancho="max-w-xl">
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Codigo" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <Input label="Unidad tematica" required value={form.unidadTematica} onChange={(e) => setForm({ ...form, unidadTematica: e.target.value })} />
        </div>
        <Textarea label="Competencias especificas" required value={form.competenciasEspecificas} onChange={(e) => setForm({ ...form, competenciasEspecificas: e.target.value })} />
        <Textarea label="Resultados de aprendizaje" required value={form.resultadosAprendizaje} onChange={(e) => setForm({ ...form, resultadosAprendizaje: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Textarea label="Nivel superior" required value={form.nivelSuperior} onChange={(e) => setForm({ ...form, nivelSuperior: e.target.value })} />
          <Textarea label="Nivel normal" required value={form.nivelNormal} onChange={(e) => setForm({ ...form, nivelNormal: e.target.value })} />
          <Textarea label="Nivel bajo" required value={form.nivelBajo} onChange={(e) => setForm({ ...form, nivelBajo: e.target.value })} />
          <Textarea label="Nivel deficiente" required value={form.nivelDeficiente} onChange={(e) => setForm({ ...form, nivelDeficiente: e.target.value })} />
        </div>
        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear unidad</Button>
        </div>
      </form>
    </Modal>
  );
}

function PlanFormModal({
  microcurriculoId, materiaId, programaId, onClose, onSuccess,
}: { microcurriculoId: string; materiaId: string; programaId: string; onClose: () => void; onSuccess: () => void }) {
  const [docenteId, setDocenteId] = useState('');
  const [periodoId, setPeriodoId] = useState('');
  const [anioLectivo, setAnioLectivo] = useState('2026');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTerminacion, setFechaTerminacion] = useState('');
  const [totalHoras, setTotalHoras] = useState('48');
  const [error, setError] = useState<string | null>(null);

  const { data: docentes } = useQuery({ queryKey: ['docentes-select'], queryFn: () => api.get<Paginado<Docente>>('/docentes?tamano=100') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-select'], queryFn: () => api.get<Periodo[]>('/periodos') });

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/planes-microcurriculares', {
        microcurriculoId, materiaId, programaId, docenteId, periodoId,
        anioLectivo: Number(anioLectivo), fechaInicio, fechaTerminacion, totalHoras: Number(totalHoras),
      }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el plan'),
  });

  return (
    <Modal titulo="Nuevo plan de microcurriculo" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Select label="Docente" required value={docenteId} onChange={(e) => setDocenteId(e.target.value)}>
          <option value="">Seleccione...</option>
          {docentes?.datos.map((d) => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
        </Select>
        <Select label="Periodo academico" required value={periodoId} onChange={(e) => setPeriodoId(e.target.value)}>
          <option value="">Seleccione...</option>
          {periodos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Año lectivo" type="number" required value={anioLectivo} onChange={(e) => setAnioLectivo(e.target.value)} />
          <Input label="Total de horas" type="number" required value={totalHoras} onChange={(e) => setTotalHoras(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha de inicio" type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <Input label="Fecha de terminacion" type="date" required value={fechaTerminacion} onChange={(e) => setFechaTerminacion(e.target.value)} />
        </div>
        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear plan</Button>
        </div>
      </form>
    </Modal>
  );
}

function SeguimientoPlanModal({ plan, onClose, onChanged }: { plan: Plan; onClose: () => void; onChanged: () => void }) {
  const { usuario } = useAuth();
  const puedeEditar = usuario?.rol === 'DOCENTE' && usuario.perfilId === plan.docente.id;

  return (
    <Modal titulo={`Seguimiento - ${plan.codigo}`} onClose={onClose} ancho="max-w-xl">
      <p className="mb-4 text-sm text-text-muted">
        Docente: {plan.docente.nombres} {plan.docente.apellidos} · Periodo: {plan.periodo.nombre}
      </p>
      <div className="flex flex-col gap-3">
        {plan.detalles.sort((a, b) => a.contenido.orden - b.contenido.orden).map((detalle) => (
          <DetalleAvanceRow key={detalle.id} planId={plan.id} detalle={detalle} editable={puedeEditar} onChanged={onChanged} />
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" variante="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
}

function DetalleAvanceRow({
  planId, detalle, editable, onChanged,
}: { planId: string; detalle: DetallePlan; editable: boolean; onChanged: () => void }) {
  const [avance, setAvance] = useState(detalle.avance);
  const [porcentaje, setPorcentaje] = useState(detalle.porcentajeAvance);

  const mutation = useMutation({
    mutationFn: () =>
      api.put(`/planes-microcurriculares/${planId}/contenidos/${detalle.contenido.id}/avance`, { avance, porcentajeAvance: porcentaje }),
    onSuccess: onChanged,
  });

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text">{detalle.contenido.orden}. {detalle.contenido.unidadTematica}</p>
        <Badge tono={porcentaje === 100 ? 'success' : porcentaje > 0 ? 'accent' : 'neutral'}>{porcentaje}%</Badge>
      </div>
      {editable && (
        <div className="mt-3 flex items-center gap-3">
          <select
            value={avance}
            onChange={(e) => setAvance(e.target.value as DetallePlan['avance'])}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_CURSO">En curso</option>
            <option value="DESARROLLADO">Desarrollado</option>
          </select>
          <input
            type="range" min={0} max={100} step={5}
            value={porcentaje}
            onChange={(e) => setPorcentaje(Number(e.target.value))}
            className="flex-1"
          />
          <Button tamano="sm" onClick={() => mutation.mutate()} cargando={mutation.isPending}>Guardar</Button>
        </div>
      )}
    </div>
  );
}
