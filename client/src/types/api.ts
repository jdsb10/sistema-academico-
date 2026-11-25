export type Rol = 'ADMINISTRADOR' | 'COORDINADOR' | 'DOCENTE' | 'ESTUDIANTE';

export interface UsuarioSesion {
  id: string;
  email: string;
  rol: Rol;
  perfilId: string | null;
  debeCambiarPassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSesion;
}

export interface Paginacion {
  pagina: number;
  tamano: number;
  total: number;
  totalPaginas: number;
}

export interface Paginado<T> {
  datos: T[];
  paginacion: Paginacion;
}

export interface Periodo {
  id: string;
  codigo: string;
  nombre: string;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'PLANEADO' | 'ACTIVO' | 'CERRADO';
}

export interface Facultad {
  id: string;
  codigo: string;
  nombre: string;
  numeroProgramas: number;
  descripcion?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  programas?: { id: string; codigo: string; nombre: string; estado: string }[];
}

export interface Programa {
  id: string;
  codigo: string;
  nombre: string;
  numeroCreditos: number;
  facultadId: string;
  estado: 'ACTIVO' | 'INACTIVO';
  facultad?: { id: string; codigo: string; nombre: string };
  coordinadores?: { coordinador: { id: string; nombres: string; apellidos: string } }[];
  _count?: { estudiantes: number; materias: number; microcurriculos: number };
}

export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  numeroCreditos: number;
  departamentoOfertante?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  programas?: { programa: { id: string; codigo: string; nombre: string } }[];
  docentes?: { docente: { id: string; nombres: string; apellidos: string } }[];
}

export interface Aula {
  id: string;
  codigo: string;
  nombre: string;
  capacidad: number;
  estado: 'DISPONIBLE' | 'MANTENIMIENTO' | 'INACTIVA';
  sede?: { id: string; nombre: string } | null;
}

interface PersonaBase {
  id: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  celular?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  usuario?: { email: string; estado: string; ultimoAcceso: string | null };
}

export interface Docente extends PersonaBase {
  materias?: { materia: { id: string; codigo: string; nombre: string } }[];
}

export interface Coordinador extends PersonaBase {
  programas?: { programa: { id: string; codigo: string; nombre: string } }[];
}

export interface Administrador extends PersonaBase {
  nivel: string;
}

export interface Estudiante extends PersonaBase {
  programaId: string;
  puntajeIcfes?: number | null;
  programa?: { id: string; codigo: string; nombre: string; facultad: { id: string; nombre: string } };
  porcentajeAsistencia?: number | null;
}

export interface Grupo {
  id: string;
  codigo: string;
  cupo: number;
  estado: string;
  materia: { id: string; codigo: string; nombre: string };
  programa: { id: string; codigo: string; nombre: string };
  periodo: { id: string; codigo: string; nombre: string; estado: string };
  _count?: { cargas: number };
}

export interface CargaAcademica {
  id: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  grupo: { materia: { codigo: string; nombre: string }; programa: { codigo: string; nombre: string } };
  docente: { id: string; nombres: string; apellidos: string };
  aula: { id: string; codigo: string; nombre: string };
  periodo: { id: string; codigo: string; nombre: string };
}

export interface DashboardAdministrador {
  totales: {
    totalEstudiantes: number;
    totalDocentes: number;
    totalCoordinadores: number;
    totalFacultades: number;
    totalProgramas: number;
    totalMaterias: number;
    totalAulas: number;
  };
  distribucionEstudiantesPorFacultad: { facultad: string; programas: number; estudiantes: number }[];
  distribucionEstudiantesPorPrograma: { programa: string; estudiantes: number }[];
  estadisticasAsistencia: { estado: string; total: number }[];
}

export interface DashboardCoordinador {
  programas: { id: string; nombre: string; facultad: string }[];
  totales: { estudiantes: number; docentes: number; materias: number; cargasAcademicas: number };
  microcurriculos: { total: number; activos: number };
}

export interface DashboardDocente {
  totales: { materias: number; grupos: number; estudiantes: number };
  proximasClases: { materia: string; aula: string; dia: string }[];
  asistenciasRecientes: { estado: string; total: number }[];
}

export interface DashboardEstudiante {
  programa: string;
  facultad: string;
  totales: { materiasInscritas: number; porcentajeAsistencia: number | null };
  proximasClases: { materia: string; aula: string; dia: string }[];
}
