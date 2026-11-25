import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Paginado } from '../types/api';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Table, Pagination } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';

interface RegistroAuditoria {
  id: string;
  emailUsuario: string | null;
  rol: string | null;
  accion: string;
  entidad: string;
  registroId: string | null;
  descripcion: string | null;
  creadoEn: string;
}

const ACCIONES = ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'LOGIN', 'LOGIN_FALLIDO', 'LOGOUT', 'BLOQUEO_CUENTA', 'CAMBIO_NOTA', 'CIERRE_NOTAS', 'CAMBIO_CARGA', 'CAMBIO_HORARIO', 'RESPALDO', 'RESTAURACION', 'EXPORTACION'];

export default function AuditoriaPage() {
  const [pagina, setPagina] = useState(1);
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditoria', pagina, entidad, accion],
    queryFn: () =>
      api.get<Paginado<RegistroAuditoria>>(
        `/auditoria?pagina=${pagina}&tamano=20&entidad=${encodeURIComponent(entidad)}&accion=${accion}`,
      ),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Bitacora de auditoria</h1>
        <p className="mt-1 text-sm text-text-muted">Registro inmutable de acciones criticas del sistema</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="w-56">
            <Input placeholder="Filtrar por entidad..." value={entidad} onChange={(e) => { setEntidad(e.target.value); setPagina(1); }} />
          </div>
          <div className="w-56">
            <Select value={accion} onChange={(e) => { setAccion(e.target.value); setPagina(1); }}>
              <option value="">Todas las acciones</option>
              {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Cargando bitacora..." />
        ) : isError ? (
          <ErrorState message="No se pudo cargar la bitacora" onRetry={refetch} />
        ) : !data || data.datos.length === 0 ? (
          <EmptyState title="No hay registros con estos filtros" />
        ) : (
          <>
            <Table<RegistroAuditoria>
              claveFila={(r) => r.id}
              datos={data.datos}
              columnas={[
                { header: 'Fecha', render: (r) => new Date(r.creadoEn).toLocaleString('es-CO') },
                { header: 'Usuario', render: (r) => r.emailUsuario ?? 'Sistema' },
                { header: 'Rol', render: (r) => r.rol ?? '-' },
                { header: 'Accion', render: (r) => <Badge tono="accent">{r.accion}</Badge> },
                { header: 'Entidad', render: (r) => r.entidad },
                { header: 'Detalle', render: (r) => r.descripcion ?? '-' },
              ]}
            />
            <Pagination pagina={data.paginacion.pagina} totalPaginas={data.paginacion.totalPaginas} onChange={setPagina} />
          </>
        )}
      </Card>
    </div>
  );
}
