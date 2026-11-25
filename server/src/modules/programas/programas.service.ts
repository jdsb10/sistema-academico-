import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { z } from 'zod';
import type { crearProgramaSchema, actualizarProgramaSchema } from './programas.schemas.js';

type CrearInput = z.infer<typeof crearProgramaSchema>;
type ActualizarInput = z.infer<typeof actualizarProgramaSchema>;

const INCLUDE_BASE = {
  facultad: { select: { id: true, codigo: true, nombre: true } },
  coordinadores: {
    where: { fechaFin: null },
    include: { coordinador: { select: { id: true, nombres: true, apellidos: true } } },
  },
};

export function listar(query: PaginationQuery, facultadId?: string) {
  return listarPaginado(prisma.programa, query, {
    where: facultadId ? { facultadId } : undefined,
    include: INCLUDE_BASE,
    orderByDefault: { nombre: 'asc' },
    camposBusqueda: ['codigo', 'nombre'],
  });
}

export async function obtener(id: string) {
  const programa = await prisma.programa.findUnique({
    where: { id },
    include: {
      ...INCLUDE_BASE,
      _count: { select: { estudiantes: true, materias: true, microcurriculos: true } },
    },
  });
  if (!programa) throw new NotFoundError('Programa');
  return programa;
}

export async function crear(input: CrearInput) {
  const facultad = await prisma.facultad.findUnique({ where: { id: input.facultadId } });
  if (!facultad) throw new NotFoundError('Facultad');
  return prisma.programa.create({ data: input, include: INCLUDE_BASE });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  if (input.facultadId) {
    const facultad = await prisma.facultad.findUnique({ where: { id: input.facultadId } });
    if (!facultad) throw new NotFoundError('Facultad');
  }
  return prisma.programa.update({ where: { id }, data: input, include: INCLUDE_BASE });
}

export async function eliminar(id: string): Promise<void> {
  const programa = await prisma.programa.findUnique({
    where: { id },
    include: { _count: { select: { estudiantes: true } } },
  });
  if (!programa) throw new NotFoundError('Programa');
  if (programa._count.estudiantes > 0) {
    throw new ConflictError('No se puede eliminar un programa que tiene estudiantes asociados');
  }
  await prisma.programa.delete({ where: { id } });
}

/** HU-05: un coordinador se asigna a uno o mas programas; el programa conserva UN coordinador vigente. */
export async function asignarCoordinador(programaId: string, coordinadorId: string) {
  await obtener(programaId);
  const coordinador = await prisma.coordinador.findUnique({ where: { id: coordinadorId } });
  if (!coordinador) throw new NotFoundError('Coordinador');

  return prisma.$transaction(async (tx) => {
    await tx.coordinadorPrograma.updateMany({
      where: { programaId, fechaFin: null },
      data: { fechaFin: new Date() },
    });
    return tx.coordinadorPrograma.create({
      data: { programaId, coordinadorId },
      include: { coordinador: { select: { id: true, nombres: true, apellidos: true } } },
    });
  });
}
