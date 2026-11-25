import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Estudiante, Paginado, Programa } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Table, Pagination } from '../../components/ui/Table';
import { EstadoBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';

interface FormState {
  email: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  programaId: string;
  puntajeIcfes: string;
}
const FORM_VACIO: FormState = { email: '', numeroDocumento: '', nombres: '', apellidos: '', programaId: '', puntajeIcfes: '' };

export default function EstudiantesPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<Estudiante | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['estudiantes', pagina],
    queryFn: () => api.get<Paginado<Estudiante>>(`/estudiantes?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, accion }: { id: string; accion: 'desactivar' | 'reactivar' }) => api.post(`/estudiantes/${id}/${accion}`),
    onSuccess: invalidar,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Estudiantes</h1>
          <p className="mt-1 text-sm text-text-muted">Poblacion estudiantil matriculada</p>
        </div>
        {esAdmin && <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nuevo estudiante</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando estudiantes..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los estudiantes" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay estudiantes registrados" />
        ) : (
          <>
            <Table<Estudiante>
              claveFila={(e) => e.id}
              datos={data.datos}
              columnas={[
                { header: 'Nombre', render: (e) => `${e.nombres} ${e.apellidos}` },
                { header: 'Documento', render: (e) => e.numeroDocumento },
                { header: 'Programa', render: (e) => e.programa?.nombre ?? '-' },
                { header: 'ICFES', render: (e) => e.puntajeIcfes ?? '-' },
                { header: 'Estado', render: (e) => <EstadoBadge estado={e.estado} /> },
                ...(esAdmin ? [{
                  header: '', className: 'text-right',
                  render: (e: Estudiante) => (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setAEditar(e)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted hover:bg-surface-alt hover:text-text"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => toggleEstadoMutation.mutate({ id: e.id, accion: e.estado === 'ACTIVO' ? 'desactivar' : 'reactivar' })}
                        disabled={toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === e.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === e.id ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando</>
                        ) : e.estado === 'ACTIVO' ? (
                          <><Ban className="h-3.5 w-3.5" /> Desactivar</>
                        ) : (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Reactivar</>
                        )}
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

      {modalAbierto && <EstudianteFormModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />}

      {aEditar && (
        <EstudianteEditModal estudiante={aEditar} onClose={() => setAEditar(null)} onSuccess={() => { invalidar(); setAEditar(null); }} />
      )}
    </div>
  );
}

function EstudianteEditModal({ estudiante, onClose, onSuccess }: { estudiante: Estudiante; onClose: () => void; onSuccess: () => void }) {
  const [nombres, setNombres] = useState(estudiante.nombres);
  const [apellidos, setApellidos] = useState(estudiante.apellidos);
  const [programaId, setProgramaId] = useState(estudiante.programaId);
  const [puntajeIcfes, setPuntajeIcfes] = useState(String(estudiante.puntajeIcfes ?? ''));
  const [error, setError] = useState<string | null>(null);

  const { data: programas } = useQuery({ queryKey: ['programas-select'], queryFn: () => api.get<Paginado<Programa>>('/programas?tamano=100') });

  const mutation = useMutation({
    mutationFn: () =>
      api.put(`/estudiantes/${estudiante.id}`, {
        nombres, apellidos, programaId,
        puntajeIcfes: puntajeIcfes ? Number(puntajeIcfes) : undefined,
      }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios'),
  });

  return (
    <Modal titulo={`Editar a ${estudiante.nombres} ${estudiante.apellidos}`} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombres" required value={nombres} onChange={(e) => setNombres(e.target.value)} />
          <Input label="Apellidos" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        </div>
        <Select label="Programa" required value={programaId} onChange={(e) => setProgramaId(e.target.value)}>
          {programas?.datos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Select>
        <Input label="Puntaje ICFES (opcional)" type="number" min={0} max={500} value={puntajeIcfes} onChange={(e) => setPuntajeIcfes(e.target.value)} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  );
}

function EstudianteFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [credenciales, setCredenciales] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: programas } = useQuery({ queryKey: ['programas-select'], queryFn: () => api.get<Paginado<Programa>>('/programas?tamano=100') });

  const mutation = useMutation({
    mutationFn: () =>
      api.post<{ passwordTemporal?: string }>('/estudiantes', {
        ...form,
        puntajeIcfes: form.puntajeIcfes ? Number(form.puntajeIcfes) : undefined,
      }),
    onSuccess: (res) => (res.passwordTemporal ? setCredenciales(res.passwordTemporal) : onSuccess()),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el estudiante'),
  });

  if (credenciales) {
    return (
      <Modal titulo="Estudiante creado" onClose={onSuccess}>
        <div className="rounded-md bg-surface-alt p-4 font-mono text-sm">
          <p>Correo: {form.email}</p>
          <p>Contrasena temporal: {credenciales}</p>
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={onSuccess}>Entendido</Button></div>
      </Modal>
    );
  }

  return (
    <Modal titulo="Nuevo estudiante" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Correo institucional" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Numero de documento" required value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
          <Input label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        </div>
        <Select label="Programa" required value={form.programaId} onChange={(e) => setForm({ ...form, programaId: e.target.value })}>
          <option value="">Seleccione un programa</option>
          {programas?.datos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Select>
        <Input label="Puntaje ICFES (opcional)" type="number" min={0} max={500} value={form.puntajeIcfes} onChange={(e) => setForm({ ...form, puntajeIcfes: e.target.value })} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear estudiante</Button>
        </div>
      </form>
    </Modal>
  );
}
