import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Coordinador, Paginado, Programa } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
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
  programaId: string;
}
const FORM_VACIO: FormState = { email: '', numeroDocumento: '', nombres: '', apellidos: '', programaId: '' };

export default function CoordinadoresPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<Coordinador | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['coordinadores', pagina],
    queryFn: () => api.get<Paginado<Coordinador>>(`/coordinadores?pagina=${pagina}&tamano=10`),
    enabled: esAdmin,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['coordinadores'] });
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, accion }: { id: string; accion: 'desactivar' | 'reactivar' }) => api.post(`/coordinadores/${id}/${accion}`),
    onSuccess: invalidar,
  });

  if (!esAdmin) return <EmptyState title="Sin acceso" description="Solo un administrador gestiona coordinadores." />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Coordinadores</h1>
          <p className="mt-1 text-sm text-text-muted">Responsables de programa academico</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nuevo coordinador</Button>
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando coordinadores..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los coordinadores" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay coordinadores registrados" />
        ) : (
          <>
            <Table<Coordinador>
              claveFila={(c) => c.id}
              datos={data.datos}
              columnas={[
                { header: 'Nombre', render: (c) => `${c.nombres} ${c.apellidos}` },
                { header: 'Correo', render: (c) => c.usuario?.email ?? '-' },
                { header: 'Programa(s)', render: (c) => c.programas?.map((p) => p.programa.nombre).join(', ') || <span className="text-text-muted">Sin asignar</span> },
                { header: 'Estado', render: (c) => <EstadoBadge estado={c.estado} /> },
                {
                  header: '', className: 'text-right',
                  render: (c) => (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setAEditar(c)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted hover:bg-surface-alt hover:text-text"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => toggleEstadoMutation.mutate({ id: c.id, accion: c.estado === 'ACTIVO' ? 'desactivar' : 'reactivar' })}
                        disabled={toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === c.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === c.id ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando</>
                        ) : c.estado === 'ACTIVO' ? (
                          <><Ban className="h-3.5 w-3.5" /> Desactivar</>
                        ) : (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Reactivar</>
                        )}
                      </button>
                    </div>
                  ),
                },
              ]}
            />
            <Pagination pagina={data.paginacion.pagina} totalPaginas={data.paginacion.totalPaginas} onChange={setPagina} />
          </>
        )}
      </Card>

      {modalAbierto && <CoordinadorFormModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />}

      {aEditar && (
        <EditarPersonaModal
          titulo={`Editar a ${aEditar.nombres} ${aEditar.apellidos}`}
          endpoint={`/coordinadores/${aEditar.id}`}
          valoresIniciales={{ nombres: aEditar.nombres, apellidos: aEditar.apellidos, celular: aEditar.celular ?? '' }}
          onClose={() => setAEditar(null)}
          onSuccess={() => { invalidar(); setAEditar(null); }}
        />
      )}
    </div>
  );
}

function CoordinadorFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [credenciales, setCredenciales] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: programas } = useQuery({ queryKey: ['programas-select'], queryFn: () => api.get<Paginado<Programa>>('/programas?tamano=100') });

  const mutation = useMutation({
    mutationFn: () => api.post<{ passwordTemporal?: string }>('/coordinadores', { ...form, programaId: form.programaId || undefined }),
    onSuccess: (res) => (res.passwordTemporal ? setCredenciales(res.passwordTemporal) : onSuccess()),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el coordinador'),
  });

  if (credenciales) {
    return (
      <Modal titulo="Coordinador creado" onClose={onSuccess}>
        <div className="rounded-md bg-surface-alt p-4 font-mono text-sm">
          <p>Correo: {form.email}</p>
          <p>Contrasena temporal: {credenciales}</p>
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={onSuccess}>Entendido</Button></div>
      </Modal>
    );
  }

  return (
    <Modal titulo="Nuevo coordinador" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Correo institucional" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Numero de documento" required value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
          <Input label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        </div>
        <Select label="Programa a cargo (opcional)" value={form.programaId} onChange={(e) => setForm({ ...form, programaId: e.target.value })}>
          <option value="">Sin asignar por ahora</option>
          {programas?.datos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Select>

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear coordinador</Button>
        </div>
      </form>
    </Modal>
  );
}
