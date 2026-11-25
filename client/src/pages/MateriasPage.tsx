import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Materia, Paginado } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, Pagination } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal, ConfirmDialog } from '../components/ui/Modal';

interface FormState {
  codigo: string;
  nombre: string;
  numeroCreditos: string;
  departamentoOfertante: string;
}
const FORM_VACIO: FormState = { codigo: '', nombre: '', numeroCreditos: '3', departamentoOfertante: '' };

export default function MateriasPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState<'crear' | Materia | null>(null);
  const [aEliminar, setAEliminar] = useState<Materia | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['materias', pagina],
    queryFn: () => api.get<Paginado<Materia>>(`/materias?pagina=${pagina}&tamano=10`),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['materias'] });
  const eliminarMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/materias/${id}`),
    onSuccess: () => { invalidar(); setAEliminar(null); },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Materias</h1>
          <p className="mt-1 text-sm text-text-muted">Oferta academica de la institucion</p>
        </div>
        {esAdmin && <Button onClick={() => setModalAbierto('crear')}><Plus className="h-4 w-4" /> Nueva materia</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando materias..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar las materias" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay materias registradas" />
        ) : (
          <>
            <Table<Materia>
              claveFila={(m) => m.id}
              datos={data.datos}
              columnas={[
                { header: 'Codigo', render: (m) => <span className="font-mono text-xs">{m.codigo}</span> },
                { header: 'Nombre', render: (m) => m.nombre },
                { header: 'Creditos', render: (m) => m.numeroCreditos },
                { header: 'Departamento', render: (m) => m.departamentoOfertante ?? '-' },
                { header: 'Docentes', render: (m) => m.docentes?.length ?? 0 },
                { header: 'Estado', render: (m) => <EstadoBadge estado={m.estado} /> },
                ...(esAdmin ? [{
                  header: '', className: 'text-right',
                  render: (m: Materia) => (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModalAbierto(m)} aria-label={`Editar ${m.nombre}`} className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-text"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setAEliminar(m)} aria-label={`Eliminar ${m.nombre}`} className="rounded-md p-1.5 text-text-muted hover:bg-danger-soft hover:text-danger"><Trash2 className="h-4 w-4" /></button>
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
        <MateriaFormModal
          materia={modalAbierto === 'crear' ? null : modalAbierto}
          onClose={() => setModalAbierto(null)}
          onSuccess={() => { invalidar(); setModalAbierto(null); }}
        />
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar materia"
          mensaje={`¿Eliminar "${aEliminar.nombre}"? Solo es posible si no tiene grupos creados.`}
          confirmarTexto="Eliminar" peligroso
          cargando={eliminarMutation.isPending}
          onClose={() => setAEliminar(null)}
          onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        />
      )}
    </div>
  );
}

function MateriaFormModal({ materia, onClose, onSuccess }: { materia: Materia | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(
    materia ? { codigo: materia.codigo, nombre: materia.nombre, numeroCreditos: String(materia.numeroCreditos), departamentoOfertante: materia.departamentoOfertante ?? '' } : FORM_VACIO,
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, numeroCreditos: Number(form.numeroCreditos) };
      return materia ? api.put(`/materias/${materia.id}`, payload) : api.post('/materias', payload);
    },
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo guardar la materia'),
  });

  return (
    <Modal titulo={materia ? 'Editar materia' : 'Nueva materia'} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Codigo" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="ISW-101" />
        <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Programacion I" />
        <Input label="Numero de creditos" type="number" min={1} max={10} required value={form.numeroCreditos} onChange={(e) => setForm({ ...form, numeroCreditos: e.target.value })} />
        <Input label="Departamento ofertante" value={form.departamentoOfertante} onChange={(e) => setForm({ ...form, departamentoOfertante: e.target.value })} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>{materia ? 'Guardar cambios' : 'Crear materia'}</Button>
        </div>
      </form>
    </Modal>
  );
}
