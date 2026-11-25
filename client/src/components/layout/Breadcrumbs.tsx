import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ETIQUETAS: Record<string, string> = {
  facultades: 'Facultades',
  programas: 'Programas',
  materias: 'Materias',
  aulas: 'Aulas',
  administradores: 'Administradores',
  coordinadores: 'Coordinadores',
  docentes: 'Docentes',
  estudiantes: 'Estudiantes',
  grupos: 'Grupos',
  'cargas-academicas': 'Carga academica',
  asistencias: 'Asistencias',
  sensores: 'Sensores',
  microcurriculos: 'Microcurriculos',
  reportes: 'Reportes',
  auditoria: 'Auditoria',
  respaldos: 'Respaldos',
  'mi-horario': 'Mi horario',
  'mis-asistencias': 'Mis asistencias',
  'mis-calificaciones': 'Mis calificaciones',
  calificaciones: 'Calificaciones',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segmentos = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Ruta de navegacion" className="flex items-center gap-1.5 text-sm text-text-muted">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1 hover:text-text">
        <Home className="h-3.5 w-3.5" />
        Inicio
      </Link>
      {segmentos.map((seg, i) => {
        const ruta = '/' + segmentos.slice(0, i + 1).join('/');
        const esUltimo = i === segmentos.length - 1;
        const etiqueta = ETIQUETAS[seg] ?? seg;
        return (
          <span key={ruta} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {esUltimo ? <span className="font-medium text-text">{etiqueta}</span> : <Link to={ruta} className="inline-flex min-h-11 items-center hover:text-text">{etiqueta}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
