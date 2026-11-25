import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';
import type { z } from 'zod';
import type { crearPeriodoSchema, actualizarPeriodoSchema } from './periodos.schemas.js';

type CrearInput = z.infer<typeof crearPeriodoSchema>;
type ActualizarInput = z.infer<typeof actualizarPeriodoSchema>;

export function listar() {
  return prisma.periodoAcademico.findMany({ orderBy: { fechaInicio: 'desc' } });
}

export async function obtener(id: string) {
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id } });
  if (!periodo) throw new NotFoundError('Periodo academico');
  return periodo;
}

export function crear(input: CrearInput) {
  return prisma.periodoAcademico.create({ data: input });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.periodoAcademico.update({ where: { id }, data: input });
}
