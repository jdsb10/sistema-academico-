import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { horaATimestamp } from '../../shared/time.js';
import type { z } from 'zod';
import type { crearCargaSchema, actualizarCargaSchema } from './cargas-academicas.schemas.js';
import type { DiaSemana } from '@prisma/client';

type CrearInput = z.infer<typeof crearCargaSchema>;
type ActualizarInput = z.infer<typeof actualizarCargaSchema>;

const INCLUDE = {
  grupo: { include: { materia: { select: { codigo: true, nombre: true } }, programa: { select: { codigo: true, nombre: true } } } },
  docente: { select: { id: true, nombres: true, apellidos: true } },
  aula: { select: { id: true, codigo: true, nombre: true } },
  periodo: { select: { id: true, codigo: true, nombre: true, estado: true } },
};

export function listar(filtros: {
  periodoId?: string;
  programaId?: string;
  docenteId?: string;
  aulaId?: string;
  grupoId?: string;
}) {
  return prisma.cargaAcademica.findMany({
    where: {
      periodoId: filtros.periodoId,
      docenteId: filtros.docenteId,
      aulaId: filtros.aulaId,
      grupoId: filtros.grupoId,
      estado: 'ACTIVA',
      grupo: filtros.programaId ? { programaId: filtros.programaId } : undefined,
    },
    include: INCLUDE,
    orderBy: [{ dia: 'asc' }, { horaInicio: 'asc' }],
  });
}

export async function obtener(id: string) {
  const carga = await prisma.cargaAcademica.findUnique({ where: { id }, include: INCLUDE });
  if (!carga) throw new NotFoundError('Carga academica');
  return carga;
}

/**
 * Pre-chequeo de choques (CP-02): da un mensaje especifico de docente / aula
 * / grupo antes de intentar el INSERT. La restriccion EXCLUDE en PostgreSQL
 * (migracion de integridad) es la garantia final contra condiciones de
 * carrera; este chequeo solo mejora el mensaje de error en el caso comun.
 */
async function verificarChoques(
  periodoId: string,
  dia: DiaSemana,
  horaInicio: Date,
  horaFin: Date,
  docenteId: string,
  aulaId: string,
  grupoId: string,
  excluirId?: string,
): Promise<void> {
  const traslape = { horaInicio: { lt: horaFin }, horaFin: { gt: horaInicio } };

  const [choqueDocente, choqueAula, choqueGrupo] = await Promise.all([
    prisma.cargaAcademica.findFirst({
      where: { periodoId, dia, docenteId, estado: 'ACTIVA', id: { not: excluirId }, ...traslape },
    }),
    prisma.cargaAcademica.findFirst({
      where: { periodoId, dia, aulaId, estado: 'ACTIVA', id: { not: excluirId }, ...traslape },
    }),
    prisma.cargaAcademica.findFirst({
      where: { periodoId, dia, grupoId, estado: 'ACTIVA', id: { not: excluirId }, ...traslape },
    }),
  ]);

  if (choqueDocente) throw new ConflictError('El docente ya tiene una clase asignada en ese dia y horario');
  if (choqueAula) throw new ConflictError('El aula ya esta ocupada en ese dia y horario');
  if (choqueGrupo) throw new ConflictError('El grupo ya tiene otra materia asignada en ese dia y horario');
}

export async function crear(input: CrearInput, creadoPor?: string) {
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id: input.periodoId } });
  if (!periodo) throw new NotFoundError('Periodo academico');
  if (periodo.estado === 'CERRADO') {
    throw new ConflictError('No se pueden crear asignaciones en un periodo academico cerrado');
  }

  const horaInicio = horaATimestamp(input.horaInicio);
  const horaFin = horaATimestamp(input.horaFin);

  await verificarChoques(input.periodoId, input.dia, horaInicio, horaFin, input.docenteId, input.aulaId, input.grupoId);

  return prisma.cargaAcademica.create({
    data: {
      grupoId: input.grupoId,
      docenteId: input.docenteId,
      aulaId: input.aulaId,
      periodoId: input.periodoId,
      dia: input.dia,
      horaInicio,
      horaFin,
      creadoPor,
    },
    include: INCLUDE,
  });
}

export async function actualizar(id: string, input: ActualizarInput) {
  const actual = await obtener(id);
  if (actual.periodo.estado === 'CERRADO') {
    throw new ConflictError('No se pueden modificar asignaciones de un periodo academico cerrado');
  }

  const dia = input.dia ?? actual.dia;
  const horaInicio = input.horaInicio ? horaATimestamp(input.horaInicio) : actual.horaInicio;
  const horaFin = input.horaFin ? horaATimestamp(input.horaFin) : actual.horaFin;
  const docenteId = input.docenteId ?? actual.docenteId;
  const aulaId = input.aulaId ?? actual.aulaId;

  if (input.estado !== 'CANCELADA') {
    await verificarChoques(actual.periodoId, dia, horaInicio, horaFin, docenteId, aulaId, actual.grupoId, id);
  }

  return prisma.cargaAcademica.update({
    where: { id },
    data: { ...input, dia, horaInicio, horaFin },
    include: INCLUDE,
  });
}

export async function cancelar(id: string): Promise<void> {
  await obtener(id);
  await prisma.cargaAcademica.update({ where: { id }, data: { estado: 'CANCELADA' } });
}
