import crypto from 'node:crypto';
import { prisma } from '../../shared/prisma.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors.js';
import type { z } from 'zod';
import type { crearPlanSchema, actualizarPlanSchema, actualizarAvanceSchema } from './planes.schemas.js';
import type { AvancePlan } from '@prisma/client';

type CrearInput = z.infer<typeof crearPlanSchema>;
type ActualizarInput = z.infer<typeof actualizarPlanSchema>;

const INCLUDE = {
  microcurriculo: { select: { id: true, codigo: true } },
  docente: { select: { id: true, nombres: true, apellidos: true } },
  materia: { select: { id: true, codigo: true, nombre: true } },
  programa: { select: { id: true, codigo: true, nombre: true } },
  periodo: { select: { id: true, codigo: true, nombre: true } },
  detalles: { include: { contenido: { select: { id: true, unidadTematica: true, orden: true } } }, orderBy: { contenido: { orden: 'asc' as const } } },
};

export function listar(filtros: { docenteId?: string; programaId?: string; periodoId?: string }) {
  return prisma.planMicrocurriculo.findMany({ where: filtros, include: INCLUDE, orderBy: { creadoEn: 'desc' } });
}

export async function obtener(id: string) {
  const plan = await prisma.planMicrocurriculo.findUnique({ where: { id }, include: INCLUDE });
  if (!plan) throw new NotFoundError('Plan de microcurriculo');
  return plan;
}

/** Al crear el plan se generan automaticamente los detalles de seguimiento, uno por cada unidad tematica del microcurriculo. */
export async function crear(input: CrearInput) {
  const contenidos = await prisma.contenidoCompetenciaEspecifica.findMany({
    where: { microcurriculoId: input.microcurriculoId },
    orderBy: { orden: 'asc' },
  });

  return prisma.planMicrocurriculo.create({
    data: {
      ...input,
      codigo: `PLAN-${crypto.randomBytes(5).toString('hex')}`,
      detalles: { create: contenidos.map((c) => ({ contenidoId: c.id })) },
    },
    include: INCLUDE,
  });
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.planMicrocurriculo.update({ where: { id }, data: input, include: INCLUDE });
}

/** HU-19: el docente marca el avance por unidad; el estudiante solo consulta (controller lo impide). */
export async function actualizarAvance(
  planId: string,
  contenidoId: string,
  docenteId: string,
  input: { avance: AvancePlan; porcentajeAvance: number; observaciones?: string },
) {
  const plan = await obtener(planId);
  if (plan.docenteId !== docenteId) {
    throw new ForbiddenError('Solo el docente del plan puede registrar el avance');
  }
  const detalle = plan.detalles.find((d) => d.contenidoId === contenidoId);
  if (!detalle) throw new NotFoundError('Detalle del plan');

  return prisma.detallePlanMicrocurriculo.update({
    where: { planId_contenidoId: { planId, contenidoId } },
    data: { ...input, actualizadoPor: docenteId, fechaActualizacion: new Date() },
  });
}
