import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Materia, Paginado, Programa } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { EstadoBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';

interface Microcurriculo {
  id: string;
  codigo: string;
  numeroCreditos: number;
  estado: string;
  materia: { nombre: string };
  programa: { nombre: string };
  contenidos: { id: string }[];
}

const CAMPOS_LARGOS = [
  ['nivelSuperior', 'Nivel Superior'],
  ['nivelNormal', 'Nivel Normal'],
  ['nivelBajo', 'Nivel Bajo'],
  ['nivelDeficiente', 'Nivel Deficiente'],
  ['descripcionAsignatura', 'Descripcion de la asignatura'],
  ['objetivoGeneral', 'Objetivo general'],
  ['objetivosEspecificos', 'Objetivos especificos'],
  ['competenciasGenericas', 'Competencias genericas'],
  ['estrategiasPedagogicasMetodologicas', 'Estrategias pedagogicas y metodologicas'],
  ['referenciasBibliograficas', 'Referencias bibliograficas'],
  ['primerParcial', 'Primer parcial'],
  ['segundoParcial', 'Segundo parcial'],
  ['tercerParcial', 'Tercer parcial'],
] as const;

type FormState = Record<(typeof CAMPOS_LARGOS)[number][0], string> & {
  codigo: string;
  materiaId: string;
  programaId: string;
  numeroCreditos: string;
  departamentoOferente: string;
  tipoAsignatura: string;
  naturalezaAsignatura: string;
};

const FORM_VACIO: FormState = {
  codigo: '', materiaId: '', programaId: '', numeroCreditos: '3', departamentoOferente: '', tipoAsignatura: 'Teorico-practica', naturalezaAsignatura: 'Obligatoria',
  nivelSuperior: '', nivelNormal: '', nivelBajo: '', nivelDeficiente: '', descripcionAsignatura: '', objetivoGeneral: '', objetivosEspecificos: '',
  competenciasGenericas: '', estrategiasPedagogicasMetodologicas: '', referenciasBibliograficas: '', primerParcial: '', segundoParcial: '', tercerParcial: '',
};

export default function MicrocurriculosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const puedeGestionar = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR';
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['microcurriculos'],
    queryFn: () => api.get<Paginado<Microcurriculo>>('/microcurriculos?tamano=50'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Microcurriculos</h1>
          <p className="mt-1 text-sm text-text-muted">Contenido programatico de las materias</p>
        </div>
        {puedeGestionar && <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nuevo microcurriculo</Button>}
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando microcurriculos..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los microcurriculos" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay microcurriculos registrados" />
        ) : (
          <Table<Microcurriculo>
            claveFila={(m) => m.id}
            datos={data.datos}
            onRowClick={(m) => navigate(`/microcurriculos/${m.id}`)}
            columnas={[
              { header: 'Codigo', render: (m) => <span className="font-mono text-xs">{m.codigo}</span> },
              { header: 'Materia', render: (m) => m.materia.nombre },
              { header: 'Programa', render: (m) => m.programa.nombre },
              { header: 'Creditos', render: (m) => m.numeroCreditos },
              { header: 'Unidades tematicas', render: (m) => m.contenidos.length },
              { header: 'Estado', render: (m) => <EstadoBadge estado={m.estado} /> },
            ]}
          />
        )}
      </Card>

      {modalAbierto && (
        <MicrocurriculoFormModal
          onClose={() => setModalAbierto(false)}
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['microcurriculos'] }); setModalAbierto(false); }}
        />
      )}
    </div>
  );
}

function MicrocurriculoFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);

  const { data: materias } = useQuery({ queryKey: ['materias-select'], queryFn: () => api.get<Paginado<Materia>>('/materias?tamano=100') });
  const { data: programas } = useQuery({ queryKey: ['programas-select'], queryFn: () => api.get<Paginado<Programa>>('/programas?tamano=100') });

  const mutation = useMutation({
    mutationFn: () => api.post('/microcurriculos', { ...form, numeroCreditos: Number(form.numeroCreditos) }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el microcurriculo'),
  });

  return (
    <Modal titulo="Nuevo microcurriculo" onClose={onClose} ancho="max-w-2xl">
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Codigo" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <Input label="Numero de creditos" type="number" min={1} max={10} required value={form.numeroCreditos} onChange={(e) => setForm({ ...form, numeroCreditos: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Materia" required value={form.materiaId} onChange={(e) => setForm({ ...form, materiaId: e.target.value })}>
            <option value="">Seleccione...</option>
            {materias?.datos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Select>
          <Select label="Programa" required value={form.programaId} onChange={(e) => setForm({ ...form, programaId: e.target.value })}>
            <option value="">Seleccione...</option>
            {programas?.datos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Departamento oferente" required value={form.departamentoOferente} onChange={(e) => setForm({ ...form, departamentoOferente: e.target.value })} />
          <Input label="Tipo de asignatura" required value={form.tipoAsignatura} onChange={(e) => setForm({ ...form, tipoAsignatura: e.target.value })} />
          <Input label="Naturaleza" required value={form.naturalezaAsignatura} onChange={(e) => setForm({ ...form, naturalezaAsignatura: e.target.value })} />
        </div>

        {CAMPOS_LARGOS.map(([clave, etiqueta]) => (
          <Textarea key={clave} label={etiqueta} required value={form[clave]} onChange={(e) => setForm({ ...form, [clave]: e.target.value })} />
        ))}

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear microcurriculo</Button>
        </div>
      </form>
    </Modal>
  );
}
