import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Administrador, Paginado } from '../../types/api';
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

export default function AdministradoresPage() {
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<Administrador | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['administradores', pagina],
    queryFn: () => api.get<Paginado<Administrador>>(`/administradores?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['administradores'] });

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, accion }: { id: string; accion: 'desactivar' | 'reactivar' }) => api.post(`/administradores/${id}/${accion}`),
    onSuccess: invalidar,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Administradores</h1>
          <p className="mt-1 text-sm text-text-muted">Usuarios con acceso completo al sistema</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nuevo administrador</Button>
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando administradores..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los administradores" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay administradores registrados" />
        ) : (
          <>
            <Table<Administrador>
              claveFila={(a) => a.id}
              datos={data.datos}
              columnas={[
                { header: 'Nombre', render: (a) => `${a.nombres} ${a.apellidos}` },
                { header: 'Documento', render: (a) => a.numeroDocumento },
                { header: 'Correo', render: (a) => a.usuario?.email ?? '-' },
                { header: 'Estado', render: (a) => <EstadoBadge estado={a.estado} /> },
                {
                  header: '', className: 'text-right',
                  render: (a) => (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setAEditar(a)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted hover:bg-surface-alt hover:text-text"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => toggleEstadoMutation.mutate({ id: a.id, accion: a.estado === 'ACTIVO' ? 'desactivar' : 'reactivar' })}
                        disabled={toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === a.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toggleEstadoMutation.isPending && toggleEstadoMutation.variables?.id === a.id ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando</>
                        ) : a.estado === 'ACTIVO' ? (
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

      {modalAbierto && (
        <AdministradorFormModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />
      )}

      {aEditar && (
        <EditarPersonaModal
          titulo={`Editar a ${aEditar.nombres} ${aEditar.apellidos}`}
          endpoint={`/administradores/${aEditar.id}`}
          valoresIniciales={{ nombres: aEditar.nombres, apellidos: aEditar.apellidos, celular: aEditar.celular ?? '' }}
          onClose={() => setAEditar(null)}
          onSuccess={() => { invalidar(); setAEditar(null); }}
        />
      )}
    </div>
  );
}

function AdministradorFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [credenciales, setCredenciales] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.post<{ passwordTemporal?: string }>('/administradores', form),
    onSuccess: (res) => {
      if (res.passwordTemporal) {
        setCredenciales(res.passwordTemporal);
      } else {
        onSuccess();
      }
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el administrador'),
  });

  if (credenciales) {
    return (
      <Modal titulo="Administrador creado" onClose={onSuccess}>
        <p className="text-sm text-text">Comparte estas credenciales temporales de forma segura. El usuario debera cambiar la contrasena en su primer acceso.</p>
        <div className="mt-4 rounded-md bg-surface-alt p-4 font-mono text-sm">
          <p>Correo: {form.email}</p>
          <p>Contrasena temporal: {credenciales}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onSuccess}>Entendido</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal titulo="Nuevo administrador" onClose={onClose}>
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
          <Button type="submit" cargando={mutation.isPending}>Crear administrador</Button>
        </div>
      </form>
    </Modal>
  );
}
