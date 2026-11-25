import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Docente, Paginado } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, Pagination } from '../../components/ui/Table';
import { EstadoBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { EditarPersonaModal } from '../../components/personas/EditarPersonaModal';

interface FormState {
  email: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  celular: string;
}
const FORM_VACIO: FormState = { email: '', numeroDocumento: '', nombres: '', apellidos: '', celular: '' };

export default function DocentesPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<Docente | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['docentes', pagina],
    queryFn: () => api.get<Paginado<Docente>>(`/docentes?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['docentes'] });
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, accion }: { id: string; accion: 'desactivar' | 'reactivar' }) => api.post(`/docentes/${id}/${accion}`),
    onSuccess: invalidar,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Docentes</h1>
          <p className="mt-1 text-sm text-text-muted">Cuerpo docente de la institucion</p>
        </div>
        {esAdmin && <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nuevo docente</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando docentes..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los docentes" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay docentes registrados" />
        ) : (
          <>
            <Table<Docente>
              claveFila={(d) => d.id}
              datos={data.datos}
              columnas={[
                { header: 'Nombre', render: (d) => `${d.nombres} ${d.apellidos}` },
                { header: 'Documento', render: (d) => d.numeroDocumento },
                { header: 'Correo', render: (d) => d.usuario?.email ?? '-' },
                { header: 'Materias', render: (d) => d.materias?.length ?? 0 },
                { header: 'Estado', render: (d) => <EstadoBadge estado={d.estado} /> },
                ...(esAdmin ? [{
                  header: '', className: 'text-right',
                  render: (d: Docente) => (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setAEditar(d)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted hover:bg-surface-alt hover:text-text"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => toggleEstadoMutation.mutate({ id: d.id, accion: d.estado === 'ACTIVO' ? 'desactivar' : 'reactivar' })}
                        disabled={toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === d.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === d.id ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando</>
                        ) : d.estado === 'ACTIVO' ? (
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

      {modalAbierto && <DocenteFormModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />}

      {aEditar && (
        <EditarPersonaModal
          titulo={`Editar a ${aEditar.nombres} ${aEditar.apellidos}`}
          endpoint={`/docentes/${aEditar.id}`}
          valoresIniciales={{ nombres: aEditar.nombres, apellidos: aEditar.apellidos, celular: aEditar.celular ?? '' }}
          onClose={() => setAEditar(null)}
          onSuccess={() => { invalidar(); setAEditar(null); }}
        />
      )}
    </div>
  );
}

function DocenteFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [credenciales, setCredenciales] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.post<{ passwordTemporal?: string }>('/docentes', form),
    onSuccess: (res) => (res.passwordTemporal ? setCredenciales(res.passwordTemporal) : onSuccess()),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el docente'),
  });

  if (credenciales) {
    return (
      <Modal titulo="Docente creado" onClose={onSuccess}>
        <div className="rounded-md bg-surface-alt p-4 font-mono text-sm">
          <p>Correo: {form.email}</p>
          <p>Contrasena temporal: {credenciales}</p>
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={onSuccess}>Entendido</Button></div>
      </Modal>
    );
  }

  return (
    <Modal titulo="Nuevo docente" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Correo institucional" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Numero de documento" required value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
          <Input label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        </div>
        <Input label="Celular (opcional)" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear docente</Button>
        </div>
      </form>
    </Modal>
  );
}
