import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RadioTower, RefreshCw } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useFeedback } from '../context/FeedbackContext';
import type { Aula, Paginado } from '../types/api';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';

interface Sensor {
  id: string;
  codigo: string;
  estado: 'ACTIVO' | 'INACTIVO';
  online: boolean;
  aula: { codigo: string; nombre: string };
}

export default function SensoresPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [simulando, setSimulando] = useState<Sensor | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sensores'],
    queryFn: () => api.get<Paginado<Sensor>>('/sensores?tamano=50'),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['sensores'] });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Sensores de asistencia</h1>
          <p className="mt-1 text-sm text-text-muted">Simulador del dispositivo que registra asistencia por aula</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" /> Nuevo sensor</Button>
      </div>

      <Card>
        {isLoading ? (
          <LoadingState label="Cargando sensores..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los sensores" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay sensores registrados" />
        ) : (
          <Table<Sensor>
            claveFila={(s) => s.id}
            datos={data.datos}
            columnas={[
              { header: 'Codigo', render: (s) => <span className="font-mono text-xs">{s.codigo}</span> },
              { header: 'Aula', render: (s) => s.aula.nombre },
              { header: 'Estado', render: (s) => <Badge tono={s.estado === 'ACTIVO' ? 'success' : 'neutral'}>{s.estado}</Badge> },
              { header: 'Conexion', render: (s) => <Badge tono={s.online ? 'accent' : 'warning'}>{s.online ? 'En linea' : 'Sin conexion'}</Badge> },
              {
                header: '', className: 'text-right',
                render: (s) => (
                  <Button tamano="sm" variante="secondary" onClick={() => setSimulando(s)}>
                    <RadioTower className="h-3.5 w-3.5" /> Simular lectura
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>

      {modalAbierto && <NuevoSensorModal onClose={() => setModalAbierto(false)} onSuccess={() => { invalidar(); setModalAbierto(false); }} />}
      {simulando && <SimularLecturaModal sensor={simulando} onClose={() => setSimulando(null)} onSuccess={invalidar} />}
    </div>
  );
}

function NuevoSensorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [aulaId, setAulaId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data: aulas } = useQuery({ queryKey: ['aulas-select'], queryFn: () => api.get<Paginado<Aula>>('/aulas?tamano=100') });

  const mutation = useMutation({
    mutationFn: () => api.post('/sensores', { codigo, aulaId }),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo crear el sensor'),
  });

  return (
    <Modal titulo="Nuevo sensor" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Codigo" required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="SNS-A101" />
        <Select label="Aula" required value={aulaId} onChange={(e) => setAulaId(e.target.value)}>
          <option value="">Seleccione un aula</option>
          {aulas?.datos.map((a) => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
        </Select>
        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Crear sensor</Button>
        </div>
      </form>
    </Modal>
  );
}

function SimularLecturaModal({ sensor, onClose, onSuccess }: { sensor: Sensor; onClose: () => void; onSuccess: () => void }) {
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [conectado, setConectado] = useState(true);
  const [resultado, setResultado] = useState<{ resultado: string; mensaje: string } | null>(null);
  const { ejecutar } = useFeedback();

  const mutation = useMutation({
    mutationFn: () => api.post<{ resultado: string; mensaje: string }>(`/sensores/${sensor.id}/lecturas`, { numeroDocumento, conectado }),
    onSuccess: (res) => {
      setResultado(res);
      onSuccess();
    },
  });

  const sincronizarMutation = useMutation({
    mutationFn: () =>
      ejecutar({
        titulo: 'Sincronizando lecturas',
        descripcion: 'Enviando las lecturas guardadas mientras el sensor estuvo sin conexión…',
        tituloExito: 'Sincronización completada',
        mensajeExito: 'Las lecturas pendientes ya están registradas en el sistema.',
        accion: () => api.post(`/sensores/${sensor.id}/sincronizar`),
      }),
    meta: { silenciarToast: true },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <Modal titulo={`Simular lectura - ${sensor.aula.nombre}`} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <Input label="Numero de documento leido" required value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} placeholder="1000000020" />
        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" checked={conectado} onChange={(e) => setConectado(e.target.checked)} />
          Sensor conectado a la red
        </label>

        {resultado && (
          <div className={`rounded-md px-3 py-2 text-sm ${resultado.resultado === 'REGISTRADO' || resultado.resultado === 'GUARDADO_LOCAL' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>
            {resultado.mensaje}
          </div>
        )}

        <CardBody className="rounded-md bg-surface-alt p-3">
          <p className="text-xs text-text-muted">Si el sensor queda sin conexion, la lectura se guarda localmente y puedes sincronizarla despues.</p>
        </CardBody>

        <div className="mt-2 flex justify-between gap-3">
          <Button type="button" variante="secondary" onClick={() => sincronizarMutation.mutate()} cargando={sincronizarMutation.isPending}>
            <RefreshCw className="h-4 w-4" /> Sincronizar pendientes
          </Button>
          <div className="flex gap-3">
            <Button type="button" variante="ghost" onClick={onClose}>Cerrar</Button>
            <Button type="submit" cargando={mutation.isPending}>Simular lectura</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
