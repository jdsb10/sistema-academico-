import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseBackup, RotateCcw, FileJson, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useFeedback } from '../context/FeedbackContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { ConfirmDialog } from '../components/ui/Modal';

interface Respaldo {
  id: string;
  nombreArchivo: string;
  tamanoBytes: string;
  estado: string;
  duracionSegundos: number;
  creadoEn: string;
}

export default function RespaldosPage() {
  const [aRestaurar, setARestaurar] = useState<Respaldo | null>(null);
  const queryClient = useQueryClient();
  const { ejecutar } = useFeedback();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['respaldos'],
    queryFn: () => api.get<Respaldo[]>('/respaldos'),
  });

  const generarMutation = useMutation({
    mutationFn: () =>
      ejecutar({
        titulo: 'Generando respaldo',
        descripcion: 'Recorriendo las tablas y escribiendo el archivo de copia de seguridad…',
        tituloExito: 'Respaldo listo',
        mensajeExito: 'Se guardó una copia real de todos los datos académicos.',
        accion: () => api.post<{ id: string; nombreArchivo: string }>('/respaldos'),
      }),
    meta: { silenciarToast: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['respaldos'] }),
  });

  const restaurarMutation = useMutation({
    mutationFn: (id: string) =>
      ejecutar({
        titulo: 'Restaurando respaldo',
        descripcion: 'Reemplazando los datos actuales por los del archivo seleccionado…',
        tituloExito: 'Restauración completada',
        mensajeExito: 'Los datos académicos volvieron al estado del respaldo.',
        accion: () => api.post(`/respaldos/${id}/restaurar`),
      }),
    meta: { silenciarToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setARestaurar(null);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Respaldos</h1>
          <p className="mt-1 text-sm text-text-muted">Copias de seguridad lógicas de la base de datos (HU-24)</p>
        </div>
        <Button onClick={() => generarMutation.mutate()} cargando={generarMutation.isPending}>
          <DatabaseBackup className="h-4 w-4" /> Generar respaldo
        </Button>
      </div>

      <Card>
        <CardBody className="border-b border-border bg-primary-soft !p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface text-primary-light">
              <FileJson className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <p className="text-[13px] leading-relaxed text-text">
              <span className="font-semibold">Copias reales, no simuladas.</span> Cada respaldo serializa las tablas de la base de datos en un archivo JSON y registra su tamaño y duración. Restaurar vuelve a cargar ese contenido en la base de datos.
            </p>
          </div>
        </CardBody>
        <CardBody className="border-b border-border bg-warning-soft !p-4 text-sm text-warning">
          <span className="inline-flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
            Restaurar reemplaza los datos actuales. Usalo solo en el ambiente de pruebas o ante una pérdida real de información.
          </span>
        </CardBody>

        {isLoading ? (
          <LoadingState label="Cargando respaldos..." />
        ) : isError ? (
          <ErrorState message="No se pudieron cargar los respaldos" onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="Aún no se ha generado ningún respaldo"
            description="Genera el primero para poder restaurar la base de datos cuando lo necesites."
          />
        ) : (
          <Table<Respaldo>
            claveFila={(r) => r.id}
            datos={data}
            columnas={[
              { header: 'Archivo', render: (r) => <span className="font-mono text-xs">{r.nombreArchivo}</span> },
              { header: 'Tamaño', render: (r) => `${(Number(r.tamanoBytes) / 1024).toFixed(1)} KB` },
              { header: 'Duración', render: (r) => `${r.duracionSegundos}s` },
              { header: 'Estado', render: (r) => <Badge tono={r.estado === 'COMPLETADO' ? 'success' : 'danger'}>{r.estado}</Badge> },
              { header: 'Fecha', render: (r) => new Date(r.creadoEn).toLocaleString('es-CO') },
              {
                header: 'Acción', className: 'text-right',
                render: (r) =>
                  r.estado === 'COMPLETADO' && (
                    <Button tamano="sm" variante="secondary" onClick={() => setARestaurar(r)}>
                      <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                    </Button>
                  ),
              },
            ]}
          />
        )}
      </Card>

      {aRestaurar && (
        <ConfirmDialog
          titulo="Restaurar respaldo"
          mensaje={`¿Restaurar "${aRestaurar.nombreArchivo}"? Esto reemplazará los datos académicos actuales con los del respaldo.`}
          confirmarTexto="Restaurar"
          peligroso
          cargando={restaurarMutation.isPending}
          onClose={() => setARestaurar(null)}
          onConfirm={() => restaurarMutation.mutate(aRestaurar.id)}
        />
      )}
    </div>
  );
}
