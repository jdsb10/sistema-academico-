import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { DiaSemana } from '@prisma/client';
import type { z } from 'zod';
import type { crearAulaSchema, actualizarAulaSchema } from './aulas.schemas.js';

type CrearInput = z.infer<typeof crearAulaSchema>;
type ActualizarInput = z.infer<typeof actualizarAulaSchema>;

export function listar(query: PaginationQuery) {
  return listarPaginado(prisma.aula, query, {
    include: { sede: { select: { id: true, nombre: true } } },
    orderByDefault: { codigo: 'asc' },
    camposBusqueda: ['codigo', 'nombre'],
  });
}

export async function obtener(id: string) {
  const aula = await prisma.aula.findUnique({ where: { id }, include: { sede: true } });
  if (!aula) throw new NotFoundError('Aula');
  return aula;
}

export function crear(input: CrearInput) {
  return prisma.aula.create({ data: input });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.aula.update({ where: { id }, data: input });
}

export async function eliminar(id: string): Promise<void> {
  const aula = await prisma.aula.findUnique({ where: { id }, include: { _count: { select: { cargas: true } } } });
  if (!aula) throw new NotFoundError('Aula');
  if (aula._count.cargas > 0) {
    throw new ConflictError('No se puede eliminar un aula que tiene horarios asignados');
  }
  await prisma.aula.delete({ where: { id } });
}

/** Modulo 8: no permite asignar una misma aula a dos clases en el mismo horario. */
export async function consultarDisponibilidad(aulaId: string, dia: DiaSemana, periodoId: string) {
  await obtener(aulaId);
  const ocupaciones = await prisma.cargaAcademica.findMany({
    where: { aulaId, dia, periodoId, estado: 'ACTIVA' },
    select: { id: true, horaInicio: true, horaFin: true, grupo: { select: { materia: { select: { nombre: true } } } } },
    orderBy: { horaInicio: 'asc' },
  });
  return ocupaciones;
}
