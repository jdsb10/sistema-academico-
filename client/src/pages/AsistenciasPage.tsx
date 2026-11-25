import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Lock, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import { formatFecha } from '../lib/format';
import type { CargaAcademica, Paginado } from '../types/api';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';

interface Sesion {
  id: string;
  codigo: string;
  tema: string;
  fecha: string;
  estado: 'ABIERTA' | 'CERRADA';
  carga: { grupo: { materia: { nombre: string } }; aula: { nombre: string }; docente: { nombres: string; apellidos: string }; grupoId?: string };
}

interface Estudiante {
  id: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
}

const ESTADOS = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'] as const;

export default function AsistenciasPage() {
  const { usuario } = useAuth();
  const esDocente = usuario?.rol === 'DOCENTE';
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['asistencias'],
    queryFn: () => api.get<Sesion[]>('/asistencias'),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['asistencias'] });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Asistencias</h1>
          <p className="mt-1 text-sm text-text-muted">Sesiones de clase y registro de asistencia</p>
        </div>
        {esDocente && <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nueva sesion</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando sesiones..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar las sesiones" onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No hay sesiones de asistencia registradas" />
        ) : (
          <Table<Sesion>
            claveFila={(s) => s.id}
            datos={data}
            onRowClick={esDocente ? (s) => setSesionSeleccionada(s) : undefined}
            columnas={[
              { header: 'Materia', render: (s) => s.carga.grupo.materia.nombre },
              { header: 'Tema', render: (s) => s.tema },
              { header: 'Fecha', render: (s) => formatFecha(s.fecha) },
              { header: 'Aula', render: (s) => s.carga.aula.nombre },
              { header: 'Estado', render: (s) => <EstadoBadge estado={s.estado} /> },
            ]}
          />
        )}
      </Card>

      {modalAbierto && <NuevaSesionModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />}
      {sesionSeleccionada && (
        <DetalleSesionModal sesion={sesionSeleccionada} onClose={() => setSesionSeleccionada(null)} onChanged={invalidar} />
      )}
    </div>
  );
}

function NuevaSesionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { usuario } = useAuth();
  const [cargaId, setCargaId] = useState('');
  const [tema, setTema] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState('08:00');
  const [error, setError] = useState<string | null>(null);

  const { data: cargas } = useQuery({
    queryKey: ['mis-cargas', usuario?.perfilId],
    queryFn: () => api.get<CargaAcademica[]>(`/cargas-academicas?docenteId=${usuario!.perfilId}`),
  });

  const mutation = useMutation({
    mutationFn: () => api.post('/asistencias', { cargaId, tema, fecha, hora }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear la sesion'),
  });

  return (
    <Modal titulo="Nueva sesion de asistencia" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Select label="Grupo / Materia" required value={cargaId} onChange={(e) => setCargaId(e.target.value)}>
          <option value="">Seleccione una clase</option>
          {cargas?.map((c) => <option key={c.id} value={c.id}>{c.grupo.materia.nombre} - {c.dia} {c.horaInicio.slice(11, 16)}</option>)}
        </Select>
        <Input label="Tema de la clase" required value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Introduccion a..." />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <Input label="Hora" type="time" required value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Abrir sesion</Button>
        </div>
      </form>
    </Modal>
  );
}

function DetalleSesionModal({ sesion, onClose, onChanged }: { sesion: Sesion; onClose: () => void; onChanged: () => void }) {
  const queryClient = useQueryClient();

  const { data: sesionCompleta, refetch } = useQuery({
    queryKey: ['sesion', sesion.id],
    queryFn: () => api.get<Sesion & { detalles: { id: string; estado: string; estudiante: Estudiante }[]; carga: Sesion['carga'] & { grupoId: string } }>(`/asistencias/${sesion.id}`),
  });

  const { data: inscritos } = useQuery({
    enabled: Boolean(sesionCompleta?.carga.grupoId),
    queryKey: ['inscritos', sesionCompleta?.carga.grupoId],
    queryFn: () => api.get<Estudiante[]>(`/grupos/${sesionCompleta!.carga.grupoId}/estudiantes`),
  });

  const registrarMutation = useMutation({
    mutationFn: (vars: { estudianteId: string; estado: string }) => api.post(`/asistencias/${sesion.id}/detalles`, vars),
    onSuccess: () => {
      refetch();
      onChanged();
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: () => api.post(`/asistencias/${sesion.id}/cerrar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      onChanged();
      onClose();
    },
  });

  const estadoPorEstudiante = new Map((sesionCompleta?.detalles ?? []).map((d) => [d.estudiante.id, d.estado]));
  const estaCerrada = sesionCompleta?.estado === 'CERRADA';

  return (
    <Modal titulo={`Asistencia - ${sesion.carga.grupo.materia.nombre}`} onClose={onClose} ancho="max-w-2xl">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">{sesion.tema} · {formatFecha(sesion.fecha)}</p>

        {!inscritos ? (
          <LoadingState label="Cargando estudiantes inscritos..." />
        ) : inscritos.length === 0 ? (
          <EmptyState title="Este grupo aun no tiene estudiantes inscritos" />
        ) : (
          <div className="flex flex-col gap-2">
            {inscritos.map((est) => (
              <div key={est.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-text">{est.nombres} {est.apellidos}</p>
                  <p className="text-xs text-text-muted">{est.numeroDocumento}</p>
                </div>
                <span className="inline-flex items-center gap-2">
                  <select
                    disabled={estaCerrada}
                    aria-label={`Estado de ${est.nombres} ${est.apellidos}`}
                    value={estadoPorEstudiante.get(est.id) ?? ''}
                    onChange={(e) => registrarMutation.mutate({ estudianteId: est.id, estado: e.target.value })}
                    className="h-9 rounded-md border border-border bg-surface px-2 text-sm disabled:bg-surface-alt"
                  >
                    <option value="" disabled>Sin registrar</option>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {registrarMutation.isPending && registrarMutation.variables?.estudianteId === est.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-light" aria-label="Guardando asistencia" />
                  )}
                  {!registrarMutation.isPending && estadoPorEstudiante.has(est.id) && (
                    <Check className="h-4 w-4 text-success" aria-label="Asistencia guardada" />
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cerrar ventana</Button>
          {!estaCerrada && (
            <Button type="button" variante="danger" onClick={() => cerrarMutation.mutate()} cargando={cerrarMutation.isPending}>
              <Lock className="h-4 w-4" /> Cerrar sesion
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
