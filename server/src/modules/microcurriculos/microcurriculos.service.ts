import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { z } from 'zod';
import type { crearMicrocurriculoSchema, actualizarMicrocurriculoSchema } from './microcurriculos.schemas.js';

type CrearInput = z.infer<typeof crearMicrocurriculoSchema>;
type ActualizarInput = z.infer<typeof actualizarMicrocurriculoSchema>;

const INCLUDE = {
  materia: { select: { id: true, codigo: true, nombre: true } },
  programa: { select: { id: true, codigo: true, nombre: true } },
  prerequisitos: { include: { prerequisitoMateria: { select: { id: true, codigo: true } } } },
  contenidos: { orderBy: { orden: 'asc' as const } },
};

export function listar(query: PaginationQuery, programaId?: string) {
  return listarPaginado(prisma.microcurriculo, query, {
    where: programaId ? { programaId } : undefined,
    include: INCLUDE,
    orderByDefault: { codigo: 'asc' },
    camposBusqueda: ['codigo'],
  });
}

export async function obtener(id: string) {
  const microcurriculo = await prisma.microcurriculo.findUnique({ where: { id }, include: INCLUDE });
  if (!microcurriculo) throw new NotFoundError('Microcurriculo');
  return microcurriculo;
}

export function crear(input: CrearInput) {
  return prisma.microcurriculo.create({ data: input, include: INCLUDE });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.microcurriculo.update({ where: { id }, data: input, include: INCLUDE });
}

export async function eliminar(id: string): Promise<void> {
  const microcurriculo = await prisma.microcurriculo.findUnique({ where: { id }, include: { _count: { select: { planes: true } } } });
  if (!microcurriculo) throw new NotFoundError('Microcurriculo');
  if (microcurriculo._count.planes > 0) {
    throw new ConflictError('No se puede eliminar un microcurriculo que tiene planes asociados');
  }
  await prisma.microcurriculo.delete({ where: { id } });
}

export async function agregarPrerequisito(microcurriculoId: string, prerequisitoMicrocurriculoId: string) {
  await obtener(microcurriculoId);
  await obtener(prerequisitoMicrocurriculoId);
  if (microcurriculoId === prerequisitoMicrocurriculoId) {
    throw new ConflictError('Un microcurriculo no puede ser prerequisito de si mismo');
  }
  return prisma.microcurriculoPrerequisito.create({
    data: { microcurriculoId, prerequisitoMateriaId: prerequisitoMicrocurriculoId },
  });
}

export async function quitarPrerequisito(microcurriculoId: string, prerequisitoMicrocurriculoId: string): Promise<void> {
  await prisma.microcurriculoPrerequisito.delete({
    where: { microcurriculoId_prerequisitoMateriaId: { microcurriculoId, prerequisitoMateriaId: prerequisitoMicrocurriculoId } },
  });
}
