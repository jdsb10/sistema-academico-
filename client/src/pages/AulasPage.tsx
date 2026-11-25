import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Aula, Paginado } from '../types/api';
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
  capacidad: string;
  estado: 'DISPONIBLE' | 'MANTENIMIENTO' | 'INACTIVA';
}
const FORM_VACIO: FormState = { codigo: '', nombre: '', capacidad: '30', estado: 'DISPONIBLE' };

export default function AulasPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState<'crear' | Aula | null>(null);
  const [aEliminar, setAEliminar] = useState<Aula | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['aulas', pagina],
    queryFn: () => api.get<Paginado<Aula>>(`/aulas?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['aulas'] });
  const eliminarMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/aulas/${id}`),
    onSuccess: () => { invalidar(); setAEliminar(null); },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Aulas</h1>
          <p className="mt-1 text-sm text-text-muted">Espacios fisicos disponibles para clases</p>
        </div>
        {esAdmin && <Button onClick={() => setModalAbierto('crear')}><Plus className="h-4 w-4" /> Nueva aula</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando aulas..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar las aulas" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay aulas registradas" />
        ) : (
          <>
            <Table<Aula>
              claveFila={(a) => a.id}
              datos={data.datos}
              columnas={[
                { header: 'Codigo', render: (a) => <span className="font-mono text-xs">{a.codigo}</span> },
                { header: 'Nombre', render: (a) => a.nombre },
                { header: 'Sede', render: (a) => a.sede?.nombre ?? '-' },
                { header: 'Capacidad', render: (a) => a.capacidad },
                { header: 'Estado', render: (a) => <EstadoBadge estado={a.estado} /> },
                ...(esAdmin ? [{
                  header: '', className: 'text-right',
                  render: (a: Aula) => (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModalAbierto(a)} aria-label={`Editar ${a.nombre}`} className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-text"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setAEliminar(a)} aria-label={`Eliminar ${a.nombre}`} className="rounded-md p-1.5 text-text-muted hover:bg-danger-soft hover:text-danger"><Trash2 className="h-4 w-4" /></button>
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
        <AulaFormModal
          aula={modalAbierto === 'crear' ? null : modalAbierto}
          onClose={() => setModalAbierto(null)}
          onSuccess={() => { invalidar(); setModalAbierto(null); }}
        />
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar aula"
          mensaje={`¿Eliminar "${aEliminar.nombre}"? Solo es posible si no tiene horarios asignados.`}
          confirmarTexto="Eliminar" peligroso
          cargando={eliminarMutation.isPending}
          onClose={() => setAEliminar(null)}
          onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        />
      )}
    </div>
  );
}

function AulaFormModal({ aula, onClose, onSuccess }: { aula: Aula | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(
    aula ? { codigo: aula.codigo, nombre: aula.nombre, capacidad: String(aula.capacidad), estado: aula.estado } : FORM_VACIO,
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, capacidad: Number(form.capacidad) };
      return aula ? api.put(`/aulas/${aula.id}`, payload) : api.post('/aulas', payload);
    },
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo guardar el aula'),
  });

  return (
    <Modal titulo={aula ? 'Editar aula' : 'Nueva aula'} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Codigo" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="A101" />
        <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Aula 101" />
        <Input label="Capacidad" type="number" min={0} value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} />
        {aula && (
          <Select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as FormState['estado'] })}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="INACTIVA">Inactiva</option>
          </Select>
        )}

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>{aula ? 'Guardar cambios' : 'Crear aula'}</Button>
        </div>
      </form>
    </Modal>
  );
}
