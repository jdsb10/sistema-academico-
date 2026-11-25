import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Facultad, Paginado } from '../types/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Table, Pagination } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal, ConfirmDialog } from '../components/ui/Modal';

interface FormState {
  codigo: string;
  nombre: string;
  descripcion: string;
}

const FORM_VACIO: FormState = { codigo: '', nombre: '', descripcion: '' };

export default function FacultadesPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState<'crear' | Facultad | null>(null);
  const [aEliminar, setAEliminar] = useState<Facultad | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['facultades', pagina, busqueda],
    queryFn: () => api.get<Paginado<Facultad>>(`/facultades?pagina=${pagina}&tamano=10&q=${encodeURIComponent(busqueda)}`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['facultades'] });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/facultades/${id}`),
    onSuccess: () => {
      invalidar();
      setAEliminar(null);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Facultades</h1>
          <p className="mt-1 text-sm text-text-muted">Estructura organizacional de la institucion</p>
        </div>
        <Button onClick={() => setModalAbierto('crear')}>
          <Plus className="h-4 w-4" /> Nueva facultad
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por codigo o nombre..."
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm focus-visible:border-accent"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Cargando facultades..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar las facultades" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay facultades registradas" description="Crea la primera facultad para comenzar." />
        ) : (
          <>
            <Table<Facultad>
              claveFila={(f) => f.id}
              datos={data.datos}
              columnas={[
                { header: 'Codigo', render: (f) => <span className="font-mono text-xs">{f.codigo}</span> },
                { header: 'Nombre', render: (f) => f.nombre },
                { header: 'Programas', render: (f) => f.numeroProgramas },
                { header: 'Estado', render: (f) => <EstadoBadge estado={f.estado} /> },
                {
                  header: '',
                  render: (f) => (
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setModalAbierto(f)}
                        aria-label={`Editar ${f.nombre}`}
                        className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-text"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setAEliminar(f)}
                        aria-label={`Eliminar ${f.nombre}`}
                        className="rounded-md p-1.5 text-text-muted hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                  className: 'text-right',
                },
              ]}
            />
            <Pagination pagina={data.paginacion.pagina} totalPaginas={data.paginacion.totalPaginas} onChange={setPagina} />
          </>
        )}
      </Card>

      {modalAbierto && (
        <FacultadFormModal
          facultad={modalAbierto === 'crear' ? null : modalAbierto}
          onClose={() => setModalAbierto(null)}
          onSuccess={() => {
            invalidar();
            setModalAbierto(null);
          }}
        />
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar facultad"
          mensaje={`¿Seguro que deseas eliminar "${aEliminar.nombre}"? Esta accion no se puede deshacer y solo es posible si no tiene programas asociados.`}
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

function FacultadFormModal({ facultad, onClose, onSuccess }: { facultad: Facultad | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(
    facultad ? { codigo: facultad.codigo, nombre: facultad.nombre, descripcion: facultad.descripcion ?? '' } : FORM_VACIO,
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      facultad ? api.put(`/facultades/${facultad.id}`, form) : api.post('/facultades', form),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo guardar la facultad'),
  });

  return (
    <Modal titulo={facultad ? 'Editar facultad' : 'Nueva facultad'} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Input label="Codigo" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="FAC-ING" />
        <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Facultad de Ingenieria" />
        <Textarea label="Descripcion (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" cargando={mutation.isPending}>
            {facultad ? 'Guardar cambios' : 'Crear facultad'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
