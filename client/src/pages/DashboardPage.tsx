import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, Building2, BookOpen, DoorOpen, UserCog, CalendarClock,
  ArrowUpRight, ClipboardCheck, Award, NotebookPen, FileBarChart,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { StatCard, Card, CardHeader, CardBody } from '../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { NAV_POR_ROL } from '../components/layout/nav';
import type { DashboardAdministrador, DashboardCoordinador, DashboardDocente, DashboardEstudiante, Rol } from '../types/api';

const COLORES = ['#b94b27', '#24584f', '#0f2e2a', '#26704f', '#916018'];
const TOOLTIP = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: 12,
    boxShadow: 'var(--shadow-popover)',
  },
};

export default function DashboardPage() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  switch (usuario.rol) {
    case 'ADMINISTRADOR': return <DashboardAdministradorView />;
    case 'COORDINADOR': return <DashboardCoordinadorView />;
    case 'DOCENTE': return <DashboardDocenteView />;
    case 'ESTUDIANTE': return <DashboardEstudianteView />;
  }
}

function useDashboard<T>() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => api.get<T>('/dashboard') });
}

function Hero({ kicker, titulo, descripcion, children }: { kicker: string; titulo: string; descripcion: string; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-5 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="animate-enter">
        <span className="page-kicker">{kicker}</span>
        <h1>{titulo}</h1>
        <p className="mt-3 text-sm text-text-muted">{descripcion}</p>
      </div>
      {children && <div className="animate-enter-delay w-full flex-shrink-0 xl:w-auto">{children}</div>}
    </div>
  );
}

function AccesosRapidos({ rol, rutas }: { rol: Rol; rutas: string[] }) {
  const items = rutas
    .map((ruta) => NAV_POR_ROL[rol].find((item) => item.to === ruta))
    .filter((item): item is (typeof NAV_POR_ROL)[Rol][number] => Boolean(item));
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="group surface-card flex items-center justify-between gap-3 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-light hover:shadow-popover"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-soft text-primary-light transition-colors group-hover:bg-accent-soft group-hover:text-accent">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="text-[13px] font-semibold text-text">{label}</span>
          </span>
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

function ListaClases({ clases }: { clases: { materia: string; dia: string; aula: string }[] }) {
  if (clases.length === 0) return <EmptyState title="No hay clases próximas" description="Cuando tengas sesiones programadas aparecerán aquí." />;
  return (
    <ul className="divide-y divide-border">
      {clases.map((c, i) => (
        <li key={i} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-soft text-accent">
              <CalendarClock className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-text">{c.materia}</span>
          </span>
          <span className="pl-11 text-xs font-medium uppercase tracking-[0.08em] text-text-muted sm:pl-0">
            {c.dia} · {c.aula}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DashboardAdministradorView() {
  const { data, isLoading, isError, refetch } = useDashboard<DashboardAdministrador>();
  if (isLoading) return <LoadingState label="Cargando panel administrativo..." />;
  if (isError || !data) return <ErrorState message="No se pudo cargar el dashboard" onRetry={refetch} />;
  const { totales } = data;

  return (
    <div>
      <Hero
        kicker="Vista institucional"
        titulo="Panel administrativo"
        descripcion="Una lectura clara de la operación académica en tiempo real."
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-muted">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden /> Sistema operativo
        </div>
      </Hero>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Estudiantes" value={totales.totalEstudiantes} icon={<Users className="h-[18px] w-[18px]" />} />
        <StatCard label="Docentes" value={totales.totalDocentes} icon={<Users className="h-[18px] w-[18px]" />} />
        <StatCard label="Coordinadores" value={totales.totalCoordinadores} icon={<UserCog className="h-[18px] w-[18px]" />} />
        <StatCard label="Facultades" value={totales.totalFacultades} icon={<Building2 className="h-[18px] w-[18px]" />} />
        <StatCard label="Programas" value={totales.totalProgramas} icon={<GraduationCap className="h-[18px] w-[18px]" />} />
        <StatCard label="Materias" value={totales.totalMaterias} icon={<BookOpen className="h-[18px] w-[18px]" />} />
        <StatCard label="Aulas" value={totales.totalAulas} icon={<DoorOpen className="h-[18px] w-[18px]" />} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Estudiantes por facultad" subtitle="Distribución de la población activa" />
          <CardBody>
            {data.distribucionEstudiantesPorFacultad.length === 0 ? (
              <EmptyState title="Sin datos todavía" description="Registra facultades y estudiantes para ver esta gráfica." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.distribucionEstudiantesPorFacultad} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="facultad" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip {...TOOLTIP} cursor={{ fill: 'var(--color-surface-alt)' }} />
                  <Bar dataKey="estudiantes" fill="#b94b27" radius={[5, 5, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Asistencia (últimos 30 días)" subtitle="Registros por estado" />
          <CardBody>
            {data.estadisticasAsistencia.length === 0 ? (
              <EmptyState title="Sin asistencias registradas" description="Los docentes aún no han registrado sesiones." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.estadisticasAsistencia} dataKey="total" nameKey="estado" outerRadius={90} innerRadius={54} paddingAngle={3} label>
                    {data.estadisticasAsistencia.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Estudiantes por programa" subtitle="Comparativa del periodo vigente" />
        <CardBody>
          {data.distribucionEstudiantesPorPrograma.length === 0 ? (
            <EmptyState title="Sin programas con estudiantes" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.distribucionEstudiantesPorPrograma} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 6" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="programa" width={140} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP} cursor={{ fill: 'var(--color-surface-alt)' }} />
                <Bar dataKey="estudiantes" fill="#24584f" radius={[0, 5, 5, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      <section className="mt-8">
        <p className="page-kicker">Accesos rápidos</p>
        <AccesosRapidos rol="ADMINISTRADOR" rutas={['/estudiantes', '/cargas-academicas', '/asistencias', '/reportes']} />
      </section>
    </div>
  );
}

function DashboardCoordinadorView() {
  const { data, isLoading, isError, refetch } = useDashboard<DashboardCoordinador>();
  if (isLoading) return <LoadingState label="Cargando panel del coordinador..." />;
  if (isError || !data) return <ErrorState message="No se pudo cargar el dashboard" onRetry={refetch} />;

  return (
    <div>
      <Hero kicker="Coordinación" titulo="Panel del coordinador" descripcion={`Programa(s): ${data.programas.map((p) => p.nombre).join(', ')}`} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Estudiantes" value={data.totales.estudiantes} icon={<Users className="h-[18px] w-[18px]" />} />
        <StatCard label="Docentes" value={data.totales.docentes} icon={<Users className="h-[18px] w-[18px]" />} />
        <StatCard label="Materias" value={data.totales.materias} icon={<BookOpen className="h-[18px] w-[18px]" />} />
        <StatCard label="Cargas activas" value={data.totales.cargasAcademicas} icon={<CalendarClock className="h-[18px] w-[18px]" />} />
      </div>
      <Card className="mt-6">
        <CardHeader title="Microcurrículos" subtitle="Estado del contenido programático de tu programa" action={<NotebookPen className="h-5 w-5 text-text-muted" aria-hidden />} />
        <CardBody>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-4xl font-semibold tracking-tight text-text">{data.microcurriculos.activos}</span>
            <span className="pb-1 text-sm text-text-muted">activos de {data.microcurriculos.total} registrados</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${data.microcurriculos.total ? (data.microcurriculos.activos / data.microcurriculos.total) * 100 : 0}%` }}
            />
          </div>
        </CardBody>
      </Card>
      <section className="mt-8">
        <p className="page-kicker">Accesos rápidos</p>
        <AccesosRapidos rol="COORDINADOR" rutas={['/estudiantes', '/grupos', '/microcurriculos', '/reportes']} />
      </section>
    </div>
  );
}

function DashboardDocenteView() {
  const { data, isLoading, isError, refetch } = useDashboard<DashboardDocente>();
  if (isLoading) return <LoadingState label="Cargando tu panel..." />;
  if (isError || !data) return <ErrorState message="No se pudo cargar el dashboard" onRetry={refetch} />;

  return (
    <div>
      <Hero kicker="Espacio docente" titulo="Mi panel" descripcion="Resumen de tus materias, grupos y próximas sesiones." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Materias asignadas" value={data.totales.materias} icon={<BookOpen className="h-[18px] w-[18px]" />} />
        <StatCard label="Grupos" value={data.totales.grupos} icon={<CalendarClock className="h-[18px] w-[18px]" />} />
        <StatCard label="Estudiantes" value={data.totales.estudiantes} icon={<Users className="h-[18px] w-[18px]" />} />
      </div>
      <Card className="mt-6">
        <CardHeader title="Próximas clases" subtitle="Tu agenda más cercana" />
        <CardBody><ListaClases clases={data.proximasClases} /></CardBody>
      </Card>
      <section className="mt-8">
        <p className="page-kicker">Accesos rápidos</p>
        <AccesosRapidos rol="DOCENTE" rutas={['/mi-horario', '/asistencias', '/calificaciones', '/microcurriculos']} />
      </section>
    </div>
  );
}

function DashboardEstudianteView() {
  const { data, isLoading, isError, refetch } = useDashboard<DashboardEstudiante>();
  if (isLoading) return <LoadingState label="Cargando tu información académica..." />;
  if (isError || !data) return <ErrorState message="No se pudo cargar el dashboard" onRetry={refetch} />;

  return (
    <div>
      <Hero kicker="Espacio estudiantil" titulo={`Hola, ${data.programa}`} descripcion={`${data.facultad} · Tu semestre en un vistazo.`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <StatCard label="Materias inscritas" value={data.totales.materiasInscritas} icon={<BookOpen className="h-[18px] w-[18px]" />} />
        <StatCard
          label="Porcentaje de asistencia"
          value={data.totales.porcentajeAsistencia !== null ? `${data.totales.porcentajeAsistencia}%` : 'Sin datos'}
          icon={<ClipboardCheck className="h-[18px] w-[18px]" />}
        />
      </div>
      <Card className="mt-6">
        <CardHeader title="Próximas clases" subtitle="Tu agenda de la semana" />
        <CardBody><ListaClases clases={data.proximasClases} /></CardBody>
      </Card>
      <section className="mt-8">
        <p className="page-kicker">Accesos rápidos</p>
        <AccesosRapidos rol="ESTUDIANTE" rutas={['/mi-horario', '/mis-asistencias', '/mis-calificaciones', '/microcurriculos']} />
      </section>
    </div>
  );
}
