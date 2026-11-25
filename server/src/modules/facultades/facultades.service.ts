import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { z } from 'zod';
import type { crearFacultadSchema, actualizarFacultadSchema } from './facultades.schemas.js';

type CrearInput = z.infer<typeof crearFacultadSchema>;
type ActualizarInput = z.infer<typeof actualizarFacultadSchema>;

export function listar(query: PaginationQuery) {
  return listarPaginado(prisma.facultad, query, {
    orderByDefault: { nombre: 'asc' },
    camposBusqueda: ['codigo', 'nombre'],
  });
}

export async function obtener(id: string) {
  const facultad = await prisma.facultad.findUnique({
    where: { id },
    include: { programas: { select: { id: true, codigo: true, nombre: true, estado: true } } },
  });
  if (!facultad) throw new NotFoundError('Facultad');
  return facultad;
}

export async function crear(input: CrearInput) {
  return prisma.facultad.create({ data: input });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.facultad.update({ where: { id }, data: input });
}

export async function eliminar(id: string): Promise<void> {
  const facultad = await prisma.facultad.findUnique({
    where: { id },
    include: { _count: { select: { programas: true } } },
  });
  if (!facultad) throw new NotFoundError('Facultad');
  if (facultad._count.programas > 0) {
    throw new ConflictError('No se puede eliminar una facultad que tiene programas asociados');
  }
  await prisma.facultad.delete({ where: { id } });
}

export async function contarEstudiantes(id: string): Promise<number> {
  await obtener(id);
  return prisma.estudiante.count({ where: { programa: { facultadId: id } } });
}
