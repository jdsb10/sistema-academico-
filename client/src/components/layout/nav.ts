import type { Rol } from '../../types/api';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  BookOpen,
  DoorOpen,
  UserCog,
  Users,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Cpu,
  NotebookPen,
  Award,
  FileBarChart,
  ShieldCheck,
  DatabaseBackup,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

/** Accesos rápidos del móvil: cuatro destinos por rol, siempre visibles. */
export const TABS_POR_ROL: Record<Rol, string[]> = {
  ADMINISTRADOR: ['/', '/estudiantes', '/cargas-academicas', '/reportes'],
  COORDINADOR: ['/', '/estudiantes', '/grupos', '/reportes'],
  DOCENTE: ['/', '/mi-horario', '/asistencias', '/calificaciones'],
  ESTUDIANTE: ['/', '/mi-horario', '/mis-asistencias', '/mis-calificaciones'],
};

export const NAV_POR_ROL: Record<Rol, NavItem[]> = {
  ADMINISTRADOR: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Resumen' },
    { to: '/facultades', label: 'Facultades', icon: Building2, group: 'Estructura académica' },
    { to: '/programas', label: 'Programas', icon: GraduationCap, group: 'Estructura académica' },
    { to: '/materias', label: 'Materias', icon: BookOpen, group: 'Estructura académica' },
    { to: '/aulas', label: 'Aulas', icon: DoorOpen, group: 'Estructura académica' },
    { to: '/administradores', label: 'Administradores', icon: ShieldCheck, group: 'Personas' },
    { to: '/coordinadores', label: 'Coordinadores', icon: UserCog, group: 'Personas' },
    { to: '/docentes', label: 'Docentes', icon: Users, group: 'Personas' },
    { to: '/estudiantes', label: 'Estudiantes', icon: Users, group: 'Personas' },
    { to: '/grupos', label: 'Grupos', icon: CalendarDays, group: 'Operación académica' },
    { to: '/cargas-academicas', label: 'Carga academica', icon: CalendarClock, group: 'Operación académica' },
    { to: '/asistencias', label: 'Asistencias', icon: ClipboardCheck, group: 'Operación académica' },
    { to: '/microcurriculos', label: 'Microcurriculos', icon: NotebookPen, group: 'Operación académica' },
    { to: '/sensores', label: 'Sensores', icon: Cpu, group: 'Sistema' },
    { to: '/reportes', label: 'Reportes', icon: FileBarChart, group: 'Sistema' },
    { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck, group: 'Sistema' },
    { to: '/respaldos', label: 'Respaldos', icon: DatabaseBackup, group: 'Sistema' },
  ],
  COORDINADOR: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Resumen' },
    { to: '/programas', label: 'Programas', icon: GraduationCap, group: 'Estructura académica' },
    { to: '/materias', label: 'Materias', icon: BookOpen, group: 'Estructura académica' },
    { to: '/docentes', label: 'Docentes', icon: Users, group: 'Personas' },
    { to: '/estudiantes', label: 'Estudiantes', icon: Users, group: 'Personas' },
    { to: '/grupos', label: 'Grupos', icon: CalendarDays, group: 'Operación académica' },
    { to: '/cargas-academicas', label: 'Carga academica', icon: CalendarClock, group: 'Operación académica' },
    { to: '/microcurriculos', label: 'Microcurriculos', icon: NotebookPen, group: 'Operación académica' },
    { to: '/reportes', label: 'Reportes', icon: FileBarChart, group: 'Análisis' },
  ],
  DOCENTE: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Mi espacio' },
    { to: '/mi-horario', label: 'Mi horario', icon: CalendarDays, group: 'Mi espacio' },
    { to: '/asistencias', label: 'Asistencias', icon: ClipboardCheck, group: 'Academia' },
    { to: '/calificaciones', label: 'Calificaciones', icon: Award, group: 'Academia' },
    { to: '/microcurriculos', label: 'Microcurriculos', icon: NotebookPen, group: 'Academia' },
  ],
  ESTUDIANTE: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Mi espacio' },
    { to: '/mi-horario', label: 'Mi horario', icon: CalendarDays, group: 'Mi espacio' },
    { to: '/mis-asistencias', label: 'Mis asistencias', icon: ClipboardCheck, group: 'Academia' },
    { to: '/mis-calificaciones', label: 'Mis calificaciones', icon: Award, group: 'Academia' },
    { to: '/microcurriculos', label: 'Microcurriculos', icon: NotebookPen, group: 'Academia' },
  ],
};
