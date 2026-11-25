import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Lock, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import type { CargaAcademica, Periodo } from '../types/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { LoadingState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';

interface Estudiante {
  id: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
}
interface Evaluacion {
  id: string;
  nombre: string;
  porcentaje: string;
  orden: number;
  calificaciones: { estudianteId: string; valor: string }[];
}
interface Configuracion {
  id: string;
  estado: 'ABIERTA' | 'CERRADA';
  evaluaciones: Evaluacion[];
}

export default function CalificacionesDocentePage() {
  const { usuario } = useAuth();
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<{ id: string; materia: string } | null>(null);
  const [modalEvaluacion, setModalEvaluacion] = useState(false);

  const { data: cargas } = useQuery({
    queryKey: ['mis-cargas-calificaciones', usuario?.perfilId],
    queryFn: () => api.get<CargaAcademica[]>(`/cargas-academicas?docenteId=${usuario!.perfilId}`),
  });
  const { data: periodos } = useQuery({ queryKey: ['periodos-select'], queryFn: () => api.get<Periodo[]>('/periodos') });
  const periodoActivo = periodos?.find((p) => p.estado === 'ACTIVO') ?? periodos?.[0];

  const { data: configuracion, refetch } = useQuery({
    enabled: Boolean(grupoSeleccionado && periodoActivo),
    queryKey: ['configuracion-evaluacion', grupoSeleccionado?.id, periodoActivo?.id],
    queryFn: () => api.get<Configuracion>(`/calificaciones/grupos/${grupoSeleccionado!.id}/configuracion?periodoId=${periodoActivo!.id}`),
  });

  const { data: estudiantes } = useQuery({
    enabled: Boolean(grupoSeleccionado),
    queryKey: ['estudiantes-grupo', grupoSeleccionado?.id],
    queryFn: () => api.get<Estudiante[]>(`/grupos/${grupoSeleccionado!.id}/estudiantes`),
  });

  const crearConfigMutation = useMutation({
    mutationFn: () => api.post('/calificaciones/configuraciones', { grupoId: grupoSeleccionado!.id, periodoId: periodoActivo!.id }),
    onSuccess: () => refetch(),
  });

  const cerrarConfigMutation = useMutation({
    mutationFn: () => api.post(`/calificaciones/configuraciones/${configuracion!.id}/cerrar`),
    onSuccess: () => refetch(),
  });

  const sumaPorcentajes = configuracion?.evaluaciones.reduce((acc, e) => acc + Number(e.porcentaje), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Calificaciones</h1>
        <p className="mt-1 text-sm text-text-muted">Configura evaluaciones y registra notas de tus grupos</p>
      </div>

      <Card>
        <CardBody>
          <Select
            label="Selecciona un grupo"
            value={grupoSeleccionado?.id ?? ''}
            onChange={(e) => {
              const carga = cargas?.find((c) => c.id === e.target.value);
              setGrupoSeleccionado(carga ? { id: (carga as unknown as { grupo: { id: string } }).grupo.id, materia: carga.grupo.materia.nombre } : null);
            }}
          >
            <option value="">Seleccione...</option>
            {cargas?.map((c) => (
              <option key={c.id} value={c.id}>{c.grupo.materia.nombre} - {c.dia} {c.horaInicio.slice(11, 16)}</option>
            ))}
          </Select>
        </CardBody>
      </Card>

      {grupoSeleccionado && (
        <Card>
          <CardHeader
            title={`Evaluaciones - ${grupoSeleccionado.materia}`}
            subtitle={configuracion ? `Suma de porcentajes: ${sumaPorcentajes}%` : 'Aun no se ha configurado la evaluacion de este grupo'}
            action={
              configuracion ? (
                configuracion.estado === 'ABIERTA' && (
                  <div className="flex gap-2">
                    <Button variante="secondary" tamano="sm" onClick={() => setModalEvaluacion(true)}><Plus className="h-4 w-4" /> Evaluacion</Button>
                    <Button
                      tamano="sm"
                      disabled={sumaPorcentajes !== 100}
                      onClick={() => cerrarConfigMutation.mutate()}
                      cargando={cerrarConfigMutation.isPending}
                    >
                      <Lock className="h-4 w-4" /> Cerrar notas
                    </Button>
                  </div>
                )
              ) : (
                <Button tamano="sm" onClick={() => crearConfigMutation.mutate()} cargando={crearConfigMutation.isPending}>Configurar evaluacion</Button>
              )
            }
          />
          <CardBody>
            {!configuracion ? (
              <EmptyState title="Configura la evaluacion para empezar a registrar notas" />
            ) : !estudiantes || estudiantes.length === 0 ? (
              <EmptyState title="Este grupo aun no tiene estudiantes inscritos" />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      {configuracion.evaluaciones.map((ev) => (
                        <th key={ev.id}>{ev.nombre} ({ev.porcentaje}%)</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map((est) => (
                      <tr key={est.id}>
                        <td data-label="Estudiante">{est.nombres} {est.apellidos}</td>
                        {configuracion.evaluaciones.map((ev) => (
                          <NotaCell
                            key={ev.id}
                            label={`${ev.nombre} (${ev.porcentaje}%)`}
                            evaluacionId={ev.id}
                            estudianteId={est.id}
                            nota={ev.calificaciones.find((c) => c.estudianteId === est.id)?.valor}
                            onSaved={refetch}
                            disabled={configuracion.estado === 'CERRADA'}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {modalEvaluacion && configuracion && (
        <NuevaEvaluacionModal configuracionId={configuracion.id} onClose={() => setModalEvaluacion(false)} onSuccess={() => { refetch(); setModalEvaluacion(false); }} />
      )}
    </div>
  );
}

function NotaCell({ label, evaluacionId, estudianteId, nota, onSaved, disabled }: { label: string; evaluacionId: string; estudianteId: string; nota?: string; onSaved: () => void; disabled: boolean }) {
  const [valor, setValor] = useState(nota ?? '');
  const [guardado, setGuardado] = useState(false);
  const mutation = useMutation({
    mutationFn: () => api.post(`/calificaciones/evaluaciones/${evaluacionId}/notas`, { estudianteId, valor: Number(valor) }),
    meta: { silenciarToast: true },
    onSuccess: () => {
      onSaved();
      setGuardado(true);
      window.setTimeout(() => setGuardado(false), 2200);
    },
  });

  return (
    <td data-label={label}>
      <span className="inline-flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          disabled={disabled}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={() => valor !== '' && valor !== nota && mutation.mutate()}
          className="h-9 w-20 rounded-lg border border-border-strong bg-surface px-2 text-sm font-semibold text-text focus:border-accent disabled:bg-surface-alt"
          aria-label={label}
        />
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-primary-light" aria-label="Guardando nota" />}
        {guardado && !mutation.isPending && <Check className="h-4 w-4 text-success" aria-label="Nota guardada" />}
      </span>
    </td>
  );
}

function NuevaEvaluacionModal({ configuracionId, onClose, onSuccess }: { configuracionId: string; onClose: () => void; onSuccess: () => void }) {
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState('30');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.post(`/calificaciones/configuraciones/${configuracionId}/evaluaciones`, { nombre, porcentaje: Number(porcentaje) }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear la evaluacion'),
  });

  return (
    <Modal titulo="Nueva evaluacion" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Parcial 1" />
        <Input label="Porcentaje" type="number" min={1} max={100} required value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} />
        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Agregar</Button>
        </div>
      </form>
    </Modal>
  );
}
