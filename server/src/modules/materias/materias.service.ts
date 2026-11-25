import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { z } from 'zod';
import type { crearMateriaSchema, actualizarMateriaSchema } from './materias.schemas.js';

type CrearInput = z.infer<typeof crearMateriaSchema>;
type ActualizarInput = z.infer<typeof actualizarMateriaSchema>;

const INCLUDE_BASE = {
  programas: { include: { programa: { select: { id: true, codigo: true, nombre: true } } } },
  docentes: { include: { docente: { select: { id: true, nombres: true, apellidos: true } } } },
};

export function listar(query: PaginationQuery, programaId?: string) {
  return listarPaginado(prisma.materia, query, {
    where: programaId ? { programas: { some: { programaId } } } : undefined,
    include: INCLUDE_BASE,
    orderByDefault: { nombre: 'asc' },
    camposBusqueda: ['codigo', 'nombre'],
  });
}

export async function obtener(id: string) {
  const materia = await prisma.materia.findUnique({
    where: { id },
    include: { ...INCLUDE_BASE, grupos: { select: { id: true, codigo: true, periodoId: true } } },
  });
  if (!materia) throw new NotFoundError('Materia');
  return materia;
}

export async function crear(input: CrearInput) {
  const { programaIds, ...data } = input;
  return prisma.materia.create({
    data: {
      ...data,
      programas: programaIds?.length ? { create: programaIds.map((programaId) => ({ programaId })) } : undefined,
    },
    include: INCLUDE_BASE,
  });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  const { programaIds, ...data } = input;
  return prisma.$transaction(async (tx) => {
    if (programaIds) {
      await tx.materiaPrograma.deleteMany({ where: { materiaId: id } });
      if (programaIds.length) {
        await tx.materiaPrograma.createMany({ data: programaIds.map((programaId) => ({ materiaId: id, programaId })) });
      }
    }
    return tx.materia.update({ where: { id }, data, include: INCLUDE_BASE });
  });
}

export async function eliminar(id: string): Promise<void> {
  const materia = await prisma.materia.findUnique({ where: { id }, include: { _count: { select: { grupos: true } } } });
  if (!materia) throw new NotFoundError('Materia');
  if (materia._count.grupos > 0) {
    throw new ConflictError('No se puede eliminar una materia que tiene grupos creados');
  }
  await prisma.materia.delete({ where: { id } });
}

/** HU-07: una materia admite varios docentes; no se duplica el par docente-materia. */
export async function asignarDocente(materiaId: string, docenteId: string) {
  await obtener(materiaId);
  const docente = await prisma.docente.findUnique({ where: { id: docenteId } });
  if (!docente) throw new NotFoundError('Docente');

  const existente = await prisma.materiaDocente.findUnique({ where: { materiaId_docenteId: { materiaId, docenteId } } });
  if (existente) throw new ConflictError('El docente ya esta asignado a esta materia');

  return prisma.materiaDocente.create({
    data: { materiaId, docenteId },
    include: { docente: { select: { id: true, nombres: true, apellidos: true } } },
  });
}

export async function quitarDocente(materiaId: string, docenteId: string): Promise<void> {
  await prisma.materiaDocente.delete({ where: { materiaId_docenteId: { materiaId, docenteId } } });
}
