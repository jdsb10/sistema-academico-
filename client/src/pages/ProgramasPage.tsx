import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Facultad, Paginado, Programa } from '../types/api';
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
  nombre: string;
  numeroCreditos: string;
  facultadId: string;
}
const FORM_VACIO: FormState = { codigo: '', nombre: '', numeroCreditos: '160', facultadId: '' };

export default function ProgramasPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState<'crear' | Programa | null>(null);
  const [aEliminar, setAEliminar] = useState<Programa | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['programas', pagina],
    queryFn: () => api.get<Paginado<Programa>>(`/programas?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['programas'] });
  const eliminarMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/programas/${id}`),
    onSuccess: () => {
      invalidar();
      setAEliminar(null);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Programas academicos</h1>
          <p className="mt-1 text-sm text-text-muted">Oferta de programas por facultad</p>
        </div>
        {esAdmin && (
          <Button onClick={() => setModalAbierto('crear')}>
            <Plus className="h-4 w-4" /> Nuevo programa
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando programas..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los programas" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay programas registrados" />
        ) : (
          <>
            <Table<Programa>
              claveFila={(p) => p.id}
              datos={data.datos}
              columnas={[
                { header: 'Codigo', render: (p) => <span className="font-mono text-xs">{p.codigo}</span> },
                { header: 'Nombre', render: (p) => p.nombre },
                { header: 'Facultad', render: (p) => p.facultad?.nombre ?? '-' },
                { header: 'Creditos', render: (p) => p.numeroCreditos },
                { header: 'Coordinador', render: (p) => {
                  const coord = p.coordinadores?.[0]?.coordinador;
                  return coord ? `${coord.nombres} ${coord.apellidos}` : <span className="text-text-muted">Sin asignar</span>;
                } },
                { header: 'Estudiantes', render: (p) => p._count?.estudiantes ?? '-' },
                { header: 'Estado', render: (p) => <EstadoBadge estado={p.estado} /> },
                ...(esAdmin
                  ? [
                      {
                        header: '',
                        render: (p: Programa) => (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setModalAbierto(p)} aria-label={`Editar ${p.nombre}`} className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-text">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setAEliminar(p)} aria-label={`Eliminar ${p.nombre}`} className="rounded-md p-1.5 text-text-muted hover:bg-danger-soft hover:text-danger">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ),
                        className: 'text-right',
                      },
                    ]
                  : []),
              ]}
            />
            <Pagination pagina={data.paginacion.pagina} totalPaginas={data.paginacion.totalPaginas} onChange={setPagina} />
          </>
        )}
      </Card>

      {modalAbierto && (
        <ProgramaFormModal
          programa={modalAbierto === 'crear' ? null : modalAbierto}
          onClose={() => setModalAbierto(null)}
          onSuccess={() => {
            invalidar();
            setModalAbierto(null);
          }}
        />
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar programa"
          mensaje={`¿Eliminar "${aEliminar.nombre}"? Solo es posible si no tiene estudiantes asociados.`}
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

function ProgramaFormModal({ programa, onClose, onSuccess }: { programa: Programa | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(
    programa
      ? { codigo: programa.codigo, nombre: programa.nombre, numeroCreditos: String(programa.numeroCreditos), facultadId: programa.facultadId }
      : FORM_VACIO,
  );
  const [error, setError] = useState<string | null>(null);

  const { data: facultades } = useQuery({
    queryKey: ['facultades-select'],
    queryFn: () => api.get<Paginado<Facultad>>('/facultades?tamano=100'),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, numeroCreditos: Number(form.numeroCreditos) };
      return programa ? api.put(`/programas/${programa.id}`, payload) : api.post('/programas', payload);
    },
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo guardar el programa'),
  });

  return (
    <Modal titulo={programa ? 'Editar programa' : 'Nuevo programa'} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Codigo" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="ISW" />
        <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ingenieria de Software" />
        <Select label="Facultad" required value={form.facultadId} onChange={(e) => setForm({ ...form, facultadId: e.target.value })}>
          <option value="">Seleccione una facultad</option>
          {facultades?.datos.map((f) => (
            <option key={f.id} value={f.id}>{f.nombre}</option>
          ))}
        </Select>
        <Input label="Numero de creditos" type="number" min={1} required value={form.numeroCreditos} onChange={(e) => setForm({ ...form, numeroCreditos: e.target.value })} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>{programa ? 'Guardar cambios' : 'Crear programa'}</Button>
        </div>
      </form>
    </Modal>
  );
}
