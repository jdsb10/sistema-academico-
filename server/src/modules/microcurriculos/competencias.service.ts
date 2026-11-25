import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';
import type { z } from 'zod';
import type { crearCompetenciaSchema, actualizarCompetenciaSchema } from './competencias.schemas.js';

type CrearInput = z.infer<typeof crearCompetenciaSchema>;
type ActualizarInput = z.infer<typeof actualizarCompetenciaSchema>;

export function listar(microcurriculoId?: string) {
  return prisma.contenidoCompetenciaEspecifica.findMany({
    where: { microcurriculoId },
    orderBy: { orden: 'asc' },
  });
}

export async function obtener(id: string) {
  const competencia = await prisma.contenidoCompetenciaEspecifica.findUnique({ where: { id } });
  if (!competencia) throw new NotFoundError('Competencia especifica');
  return competencia;
}

export async function crear(input: CrearInput) {
  const microcurriculo = await prisma.microcurriculo.findUnique({ where: { id: input.microcurriculoId } });
  if (!microcurriculo) throw new NotFoundError('Microcurriculo');
  return prisma.contenidoCompetenciaEspecifica.create({ data: input });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.contenidoCompetenciaEspecifica.update({ where: { id }, data: input });
}

export async function eliminar(id: string): Promise<void> {
  await obtener(id);
  await prisma.contenidoCompetenciaEspecifica.delete({ where: { id } });
}
