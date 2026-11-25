import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { ApiError, api, getTokens } from '../lib/api';
import { useFeedback } from '../context/FeedbackContext';
import type { Paginado, Periodo, Programa } from '../types/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';

const REPORTES = [
  { key: 'asistencia', label: 'Asistencia por programa' },
  { key: 'carga-academica', label: 'Carga académica' },
  { key: 'desempeno-academico', label: 'Desempeño académico' },
] as const;

export default function ReportesPage() {
  const [periodoId, setPeriodoId] = useState('');
  const [programaId, setProgramaId] = useState('');
  const { ejecutar } = useFeedback();

  const { data: periodos, isLoading: cargandoPeriodos } = useQuery({
    queryKey: ['periodos-select'],
    queryFn: () => api.get<Periodo[]>('/periodos'),
  });
  const { data: programas, isLoading: cargandoProgramas } = useQuery({
    queryKey: ['programas-select'],
    queryFn: () => api.get<Paginado<Programa>>('/programas?tamano=100'),
  });

  function params(formato: string) {
    return new URLSearchParams({ periodoId, formato, ...(programaId ? { programaId } : {}) }).toString();
  }

  async function descargar(tipo: string, etiqueta: string, formato: 'pdf' | 'excel') {
    if (!periodoId) return;
    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    await ejecutar({
      titulo: 'Generando reporte',
      descripcion: `Preparando "${etiqueta}" en ${formato.toUpperCase()} con los filtros seleccionados…`,
      tituloExito: 'Reporte descargado',
      mensajeExito: (tamano: number) =>
        `${etiqueta} se generó correctamente (${(tamano / 1024).toFixed(1)} KB) y se descargó en ${extension.toUpperCase()}.`,
      accion: async () => {
        const tokens = getTokens();
        const respuesta = await fetch(`/api/reportes/${tipo}?${params(formato)}`, {
          headers: { Authorization: `Bearer ${tokens?.accessToken}` },
        });
        if (!respuesta.ok) {
          const cuerpo = (await respuesta.json().catch(() => null)) as { error?: { message?: string } } | null;
          throw new ApiError(
            respuesta.status,
            cuerpo?.error ? 'ERROR_REPORTE' : 'ERROR',
            cuerpo?.error?.message ?? 'No se pudo generar el reporte',
          );
        }
        const blob = await respuesta.blob();
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-${tipo}.${extension}`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        return blob.size;
      },
    });
  }

  async function verJson(tipo: string, etiqueta: string) {
    if (!periodoId) return;
    await ejecutar({
      titulo: 'Consultando reporte',
      descripcion: `Reuniendo los datos de "${etiqueta}"…`,
      tituloExito: 'Reporte listo',
      mensajeExito: (registros: number) =>
        registros === 0
          ? 'El reporte no encontró registros con los filtros seleccionados.'
          : `Se consultaron ${registros} ${registros === 1 ? 'registro' : 'registros'} correctamente.`,
      accion: async () => {
        const datos = await api.get<unknown[]>(`/reportes/${tipo}?${params('json')}`);
        return Array.isArray(datos) ? datos.length : 0;
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Reportes</h1>
        <p className="mt-1 text-sm text-text-muted">Genera reportes con datos reales, exportables a PDF y Excel</p>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Periodo académico" required value={periodoId} onChange={(e) => setPeriodoId(e.target.value)}>
              <option value="" disabled={cargandoPeriodos}>{cargandoPeriodos ? 'Cargando periodos…' : 'Seleccione un periodo'}</option>
              {periodos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
            <Select label="Programa (opcional)" value={programaId} onChange={(e) => setProgramaId(e.target.value)}>
              <option value="" disabled={cargandoProgramas}>{cargandoProgramas ? 'Cargando programas…' : 'Todos los programas'}</option>
              {programas?.datos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </div>
          {!periodoId && (
            <p className="mt-4 rounded-lg bg-surface-alt px-3 py-2 text-xs text-text-muted">
              Selecciona un periodo académico para habilitar la generación de reportes.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {REPORTES.map((r) => (
          <Card key={r.key}>
            <CardHeader title={r.label} />
            <CardBody className="flex flex-col gap-2">
              <Button variante="secondary" disabled={!periodoId} onClick={() => verJson(r.key, r.label)}>
                <FileJson className="h-4 w-4" /> Ver datos
              </Button>
              <Button variante="secondary" disabled={!periodoId} onClick={() => descargar(r.key, r.label, 'excel')}>
                <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
              </Button>
              <Button disabled={!periodoId} onClick={() => descargar(r.key, r.label, 'pdf')}>
                <FileText className="h-4 w-4" /> Exportar PDF
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
