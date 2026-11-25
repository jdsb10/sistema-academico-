import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Grupo, Materia, Paginado, Periodo, Programa } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Table, Pagination } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal, ConfirmDialog } from '../components/ui/Modal';

interface FormState {
  codigo: string;
  materiaId: string;
  programaId: string;
  periodoId: string;
  cupo: string;
}
const FORM_VACIO: FormState = { codigo: 'G1', materiaId: '', programaId: '', periodoId: '', cupo: '30' };

export default function GruposPage() {
  const { usuario } = useAuth();
  const puedeGestionar = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState<'crear' | Grupo | null>(null);
  const [aEliminar, setAEliminar] = useState<Grupo | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['grupos', pagina],
    queryFn: () => api.get<Paginado<Grupo>>(`/grupos?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['grupos'] });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/grupos/${id}`),
    onSuccess: () => { invalidar(); setAEliminar(null); },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Grupos</h1>
          <p className="mt-1 text-sm text-text-muted">Grupos de materia por programa y periodo</p>
        </div>
        {puedeGestionar && <Button onClick={() => setModalAbierto('crear')}><Plus className="h-4 w-4" /> Nuevo grupo</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando grupos..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los grupos" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay grupos registrados" />
        ) : (
          <>
            <Table<Grupo>
              claveFila={(g) => g.id}
              datos={data.datos}
              columnas={[
                { header: 'Codigo', render: (g) => <span className="font-mono text-xs">{g.codigo}</span> },
                { header: 'Materia', render: (g) => g.materia.nombre },
                { header: 'Programa', render: (g) => g.programa.nombre },
                { header: 'Periodo', render: (g) => g.periodo.nombre },
                { header: 'Cupo', render: (g) => g.cupo },
                { header: 'Carga asignada', render: (g) => (g._count?.cargas ?? 0) > 0 ? 'Si' : 'No' },
                { header: 'Estado', render: (g) => <EstadoBadge estado={g.estado} /> },
                ...(puedeGestionar ? [{
                  header: '', className: 'text-right',
                  render: (g: Grupo) => (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModalAbierto(g)} aria-label={`Editar ${g.codigo}`} className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-text"><Pencil className="h-4 w-4" /></button>
                      <button
                        onClick={() => setAEliminar(g)}
                        disabled={(g._count?.cargas ?? 0) > 0}
                        aria-label={`Eliminar ${g.codigo}`}
                        className="rounded-md p-1.5 text-text-muted hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                }] : []),
              ]}
            />
            <Pagination pagina={data.paginacion.pagina} totalPaginas={data.paginacion.totalPaginas} onChange={setPagina} />
          </>
        )}
      </Card>

      {modalAbierto && (
        <GrupoFormModal
          grupo={modalAbierto === 'crear' ? null : modalAbierto}
          onClose={() => setModalAbierto(null)}
          onSuccess={() => { invalidar(); setModalAbierto(null); }}
        />
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar grupo"
          mensaje={`¿Eliminar el grupo "${aEliminar.codigo}" de ${aEliminar.materia.nombre}? Esta accion no se puede deshacer.`}
          confirmarTexto="Eliminar"
          peligroso
          cargando={eliminarMutation.isPending}
          onClose={() => setAEliminar(null)}
          onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        />
      )}
    </div>
  );
}

function GrupoFormModal({ grupo, onClose, onSuccess }: { grupo: Grupo | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(
    grupo
      ? { codigo: grupo.codigo, materiaId: grupo.materia.id, programaId: grupo.programa.id, periodoId: grupo.periodo.id, cupo: String(grupo.cupo) }
      : FORM_VACIO,
  );
  const [error, setError] = useState<string | null>(null);
  const tieneCargaAsignada = (grupo?._count?.cargas ?? 0) > 0;

  const { data: materias } = useQuery({ queryKey: ['materias-select'], queryFn: () => api.get<Paginado<Materia>>('/materias?tamano=100') });
  const { data: programas } = useQuery({ queryKey: ['programas-select'], queryFn: () => api.get<Paginado<Programa>>('/programas?tamano=100') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-select'], queryFn: () => api.get<Periodo[]>('/periodos') });

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, cupo: Number(form.cupo) };
      return grupo ? api.put(`/grupos/${grupo.id}`, payload) : api.post('/grupos', payload);
    },
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo guardar el grupo'),
  });

  return (
    <Modal titulo={grupo ? 'Editar grupo' : 'Nuevo grupo'} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Codigo de grupo" required disabled={tieneCargaAsignada} value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="G1" />
        <Select label="Materia" required disabled={tieneCargaAsignada} value={form.materiaId} onChange={(e) => setForm({ ...form, materiaId: e.target.value })}>
          <option value="">Seleccione una materia</option>
          {materias?.datos.map((m) => <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>)}
        </Select>
        <Select label="Programa" required disabled={tieneCargaAsignada} value={form.programaId} onChange={(e) => setForm({ ...form, programaId: e.target.value })}>
          <option value="">Seleccione un programa</option>
          {programas?.datos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Select>
        <Select label="Periodo academico" required disabled={tieneCargaAsignada} value={form.periodoId} onChange={(e) => setForm({ ...form, periodoId: e.target.value })}>
          <option value="">Seleccione un periodo</option>
          {periodos?.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>)}
        </Select>
        <Input label="Cupo" type="number" min={1} required value={form.cupo} onChange={(e) => setForm({ ...form, cupo: e.target.value })} />
        {tieneCargaAsignada && (
          <p className="text-xs text-text-muted">
            Este grupo ya tiene carga academica asignada: materia, programa y periodo quedan bloqueados para no romper los horarios existentes. Solo puedes ajustar el cupo.
          </p>
        )}

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>{grupo ? 'Guardar cambios' : 'Crear grupo'}</Button>
        </div>
      </form>
    </Modal>
  );
}
