import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { z } from 'zod';
import type { crearGrupoSchema, actualizarGrupoSchema } from './grupos.schemas.js';

type CrearInput = z.infer<typeof crearGrupoSchema>;
type ActualizarInput = z.infer<typeof actualizarGrupoSchema>;

const INCLUDE = {
  materia: { select: { id: true, codigo: true, nombre: true } },
  programa: { select: { id: true, codigo: true, nombre: true } },
  periodo: { select: { id: true, codigo: true, nombre: true, estado: true } },
  _count: { select: { cargas: true } },
};

export function listar(query: PaginationQuery, filtros: { materiaId?: string; programaId?: string; periodoId?: string }) {
  return listarPaginado(prisma.grupo, query, {
    where: filtros,
    include: INCLUDE,
    orderByDefault: { codigo: 'asc' },
    camposBusqueda: ['codigo'],
  });
}

export async function obtener(id: string) {
  const grupo = await prisma.grupo.findUnique({ where: { id }, include: INCLUDE });
  if (!grupo) throw new NotFoundError('Grupo');
  return grupo;
}

export function crear(input: CrearInput) {
  return prisma.grupo.create({ data: input, include: INCLUDE });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.grupo.update({ where: { id }, data: input, include: INCLUDE });
}

export async function eliminar(id: string): Promise<void> {
  const grupo = await prisma.grupo.findUnique({ where: { id }, include: { _count: { select: { cargas: true } } } });
  if (!grupo) throw new NotFoundError('Grupo');
  if (grupo._count.cargas > 0) {
    throw new ConflictError('No se puede eliminar un grupo con carga academica asignada');
  }
  await prisma.grupo.delete({ where: { id } });
}

/**
 * Cupo disponible para HU-11 (el estudiante solo inscribe grupos con cupo).
 * La inscripcion (HorarioEstudiante) apunta a una CargaAcademica, que a su
 * vez pertenece a un Grupo: se cuentan las inscripciones activas de todas
 * las cargas del grupo.
 */
export async function cupoDisponible(grupoId: string): Promise<number> {
  const grupo = await prisma.grupo.findUnique({ where: { id: grupoId } });
  if (!grupo) throw new NotFoundError('Grupo');
  const inscritos = await prisma.horarioEstudiante.count({
    where: { estado: 'ACTIVA', carga: { grupoId } },
  });
  return grupo.cupo - inscritos;
}

/** Modulo docente: "Consultar estudiantes inscritos en sus grupos" (Fase 6, rol DOCENTE). */
export async function listarEstudiantesInscritos(grupoId: string) {
  await obtener(grupoId);
  const inscripciones = await prisma.horarioEstudiante.findMany({
    where: { estado: 'ACTIVA', carga: { grupoId } },
    include: { estudiante: { select: { id: true, numeroDocumento: true, nombres: true, apellidos: true } } },
    distinct: ['estudianteId'],
  });
  return inscripciones.map((i) => i.estudiante);
}
