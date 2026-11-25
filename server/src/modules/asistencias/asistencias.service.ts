import crypto from 'node:crypto';
import { prisma } from '../../shared/prisma.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js';
import { horaATimestamp } from '../../shared/time.js';
import type { EstadoAsistencia } from '@prisma/client';

const INCLUDE_SESION = {
  carga: {
    include: {
      grupo: { include: { materia: { select: { codigo: true, nombre: true } } } },
      aula: { select: { id: true, codigo: true, nombre: true } },
      docente: { select: { id: true, nombres: true, apellidos: true } },
    },
  },
  detalles: {
    include: { estudiante: { select: { id: true, nombres: true, apellidos: true, numeroDocumento: true } } },
  },
};

export async function crearSesion(docenteId: string, input: { cargaId: string; tema: string; fecha: Date; hora: string }) {
  const carga = await prisma.cargaAcademica.findUnique({ where: { id: input.cargaId } });
  if (!carga) throw new NotFoundError('Carga academica');
  if (carga.docenteId !== docenteId) {
    throw new ForbiddenError('Solo el docente asignado a esa carga puede abrir la sesion de asistencia');
  }

  return prisma.asistencia.create({
    data: {
      codigo: `AS-${crypto.randomBytes(6).toString('hex')}`,
      cargaId: input.cargaId,
      tema: input.tema,
      fecha: input.fecha,
      hora: horaATimestamp(input.hora),
      creadoPor: docenteId,
    },
    include: INCLUDE_SESION,
  });
}

export function listarSesiones(filtros: { docenteId?: string; grupoId?: string; materiaId?: string; desde?: Date; hasta?: Date }) {
  return prisma.asistencia.findMany({
    where: {
      carga: {
        docenteId: filtros.docenteId,
        grupoId: filtros.grupoId,
        grupo: filtros.materiaId ? { materiaId: filtros.materiaId } : undefined,
      },
      fecha: { gte: filtros.desde, lte: filtros.hasta },
    },
    include: INCLUDE_SESION,
    orderBy: { fecha: 'desc' },
  });
}

export async function obtenerSesion(id: string) {
  const sesion = await prisma.asistencia.findUnique({ where: { id }, include: INCLUDE_SESION });
  if (!sesion) throw new NotFoundError('Sesion de asistencia');
  return sesion;
}

/** Registro manual (backup del docente, Modulo 11/Alerta A-01) o correccion de un registro del sensor. */
export async function registrarDetalle(
  asistenciaId: string,
  docenteId: string,
  input: { estudianteId: string; estado: EstadoAsistencia; justificacion?: string },
) {
  const sesion = await obtenerSesion(asistenciaId);
  if (sesion.carga.docenteId !== docenteId) {
    throw new ForbiddenError('Solo el docente de la sesion puede registrar asistencia');
  }
  if (sesion.estado === 'CERRADA') {
    throw new ConflictError('La sesion de asistencia ya esta cerrada');
  }

  const inscrito = await prisma.horarioEstudiante.findFirst({
    where: { estudianteId: input.estudianteId, estado: 'ACTIVA', carga: { grupoId: sesion.carga.grupoId } },
  });
  if (!inscrito) {
    throw new ConflictError('El estudiante no esta inscrito en el grupo de esta sesion');
  }

  return prisma.detalleAsistencia.upsert({
    where: { asistenciaId_estudianteId: { asistenciaId, estudianteId: input.estudianteId } },
    create: {
      asistenciaId,
      estudianteId: input.estudianteId,
      estado: input.estado,
      origen: 'MANUAL',
      justificacion: input.justificacion,
    },
    update: { estado: input.estado, justificacion: input.justificacion },
    include: { estudiante: { select: { id: true, nombres: true, apellidos: true } } },
  });
}

export async function cerrarSesion(id: string, docenteId: string) {
  const sesion = await obtenerSesion(id);
  if (sesion.carga.docenteId !== docenteId) {
    throw new ForbiddenError('Solo el docente de la sesion puede cerrarla');
  }
  return prisma.asistencia.update({ where: { id }, data: { estado: 'CERRADA', cerradaEn: new Date() } });
}

/** HU-15: el estudiante solo ve sus propios registros; el porcentaje coincide con lo registrado por el sensor o manualmente. */
export async function consultarPorEstudiante(estudianteId: string, materiaId?: string) {
  const detalles = await prisma.detalleAsistencia.findMany({
    where: { estudianteId, asistencia: materiaId ? { carga: { grupo: { materiaId } } } : undefined },
    include: {
      asistencia: {
        include: { carga: { include: { grupo: { include: { materia: { select: { codigo: true, nombre: true } } } } } } },
      },
    },
    orderBy: { asistencia: { fecha: 'desc' } },
  });

  const total = detalles.length;
  const presentes = detalles.filter((d) => d.estado === 'PRESENTE' || d.estado === 'TARDANZA').length;

  return {
    detalles,
    resumen: { total, presentes, porcentajeAsistencia: total > 0 ? Math.round((presentes / total) * 100) : null },
  };
}
