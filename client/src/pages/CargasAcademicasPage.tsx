import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Aula, CargaAcademica, Docente, Grupo, Paginado, Periodo } from '../types/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal, ConfirmDialog } from '../components/ui/Modal';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'] as const;
const HORAS = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 07:00 .. 19:00

interface FormState {
  grupoId: string;
  docenteId: string;
  aulaId: string;
  periodoId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}
const FORM_VACIO: FormState = { grupoId: '', docenteId: '', aulaId: '', periodoId: '', dia: 'LUNES', horaInicio: '08:00', horaFin: '10:00' };

export default function CargasAcademicasPage() {
  const [periodoFiltro, setPeriodoFiltro] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aCancelar, setACancelar] = useState<CargaAcademica | null>(null);
  const queryClient = useQueryClient();

  const { data: periodos } = useQuery({ queryKey: ['periodos-select'], queryFn: () => api.get<Periodo[]>('/periodos') });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cargas-academicas', periodoFiltro],
    queryFn: () => api.get<CargaAcademica[]>(`/cargas-academicas${periodoFiltro ? `?periodoId=${periodoFiltro}` : ''}`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['cargas-academicas'] });
  const cancelarMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cargas-academicas/${id}`),
    onSuccess: () => { invalidar(); setACancelar(null); },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Carga academica</h1>
          <p className="mt-1 text-sm text-text-muted">Asignacion de docentes, aulas y horarios por grupo</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nueva asignacion</Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="w-64">
            <Select value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value)}>
              <option value="">Todos los periodos</option>
              {periodos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Cargando carga academica..." />
        ) : isError ? (
          <ErrorState message="No se pudo cargar la carga academica" onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No hay asignaciones registradas" description="Crea la primera asignacion de carga academica." />
        ) : (
          <Table<CargaAcademica>
            claveFila={(c) => c.id}
            datos={data}
            columnas={[
              { header: 'Materia', render: (c) => c.grupo.materia.nombre },
              { header: 'Programa', render: (c) => c.grupo.programa.nombre },
              { header: 'Docente', render: (c) => `${c.docente.nombres} ${c.docente.apellidos}` },
              { header: 'Aula', render: (c) => c.aula.nombre },
              { header: 'Dia', render: (c) => c.dia },
              { header: 'Horario', render: (c) => `${c.horaInicio.slice(11, 16)} - ${c.horaFin.slice(11, 16)}` },
              { header: 'Estado', render: (c) => <EstadoBadge estado={c.estado} /> },
              {
                header: '', className: 'text-right',
                render: (c) =>
                  c.estado === 'ACTIVA' && (
                    <button onClick={() => setACancelar(c)} aria-label="Cancelar asignacion" className="rounded-md p-1.5 text-text-muted hover:bg-danger-soft hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ),
              },
            ]}
          />
        )}
      </Card>

      {modalAbierto && <CargaFormModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />}

      {aCancelar && (
        <ConfirmDialog
          titulo="Cancelar asignacion"
          mensaje="¿Deseas cancelar esta asignacion de carga academica? El horario y las asistencias relacionadas se conservan como historial."
          confirmarTexto="Cancelar asignacion"
          peligroso
          cargando={cancelarMutation.isPending}
          onClose={() => setACancelar(null)}
          onConfirm={() => cancelarMutation.mutate(aCancelar.id)}
        />
      )}
    </div>
  );
}

function CargaFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);

  const { data: grupos } = useQuery({ queryKey: ['grupos-select'], queryFn: () => api.get<Paginado<Grupo>>('/grupos?tamano=100') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-select'], queryFn: () => api.get<Paginado<Docente>>('/docentes?tamano=100') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-select'], queryFn: () => api.get<Paginado<Aula>>('/aulas?tamano=100') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-select'], queryFn: () => api.get<Periodo[]>('/periodos') });

  const mutation = useMutation({
    mutationFn: () => api.post('/cargas-academicas', form),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear la asignacion'),
  });

  return (
    <Modal titulo="Nueva asignacion de carga academica" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Select label="Grupo" required value={form.grupoId} onChange={(e) => setForm({ ...form, grupoId: e.target.value })}>
          <option value="">Seleccione un grupo</option>
          {grupos?.datos.map((g) => <option key={g.id} value={g.id}>{g.materia.nombre} - {g.codigo} ({g.programa.nombre})</option>)}
        </Select>
        <Select label="Docente" required value={form.docenteId} onChange={(e) => setForm({ ...form, docenteId: e.target.value })}>
          <option value="">Seleccione un docente</option>
          {docentes?.datos.map((d) => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
        </Select>
        <Select label="Aula" required value={form.aulaId} onChange={(e) => setForm({ ...form, aulaId: e.target.value })}>
          <option value="">Seleccione un aula</option>
          {aulas?.datos.map((a) => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
        </Select>
        <Select label="Periodo academico" required value={form.periodoId} onChange={(e) => setForm({ ...form, periodoId: e.target.value })}>
          <option value="">Seleccione un periodo</option>
          {periodos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Select>
        <Select label="Dia" required value={form.dia} onChange={(e) => setForm({ ...form, dia: e.target.value })}>
          {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Hora de inicio" required value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}>
            {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
          </Select>
          <Select label="Hora de fin" required value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })}>
            {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
          </Select>
        </div>

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear asignacion</Button>
        </div>
      </form>
    </Modal>
  );
}
