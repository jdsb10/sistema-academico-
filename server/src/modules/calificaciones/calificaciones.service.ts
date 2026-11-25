import { prisma } from '../../shared/prisma.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors.js';

const INCLUDE_CONFIG = {
  grupo: { include: { materia: { select: { codigo: true, nombre: true } } } },
  evaluaciones: {
    orderBy: { orden: 'asc' as const },
    include: { calificaciones: { include: { estudiante: { select: { id: true, nombres: true, apellidos: true } } } } },
  },
};

export async function obtenerConfiguracion(grupoId: string, periodoId: string) {
  const configuracion = await prisma.configuracionEvaluacion.findUnique({
    where: { grupoId_periodoId: { grupoId, periodoId } },
    include: INCLUDE_CONFIG,
  });
  if (!configuracion) throw new NotFoundError('Configuracion de evaluacion');
  return configuracion;
}

async function obtenerDocenteDelGrupo(grupoId: string, periodoId: string): Promise<string | null> {
  const carga = await prisma.cargaAcademica.findFirst({ where: { grupoId, periodoId, estado: 'ACTIVA' } });
  return carga?.docenteId ?? null;
}

export async function crearConfiguracion(grupoId: string, periodoId: string) {
  const existente = await prisma.configuracionEvaluacion.findUnique({ where: { grupoId_periodoId: { grupoId, periodoId } } });
  if (existente) throw new ConflictError('Ya existe una configuracion de evaluacion para este grupo y periodo');
  return prisma.configuracionEvaluacion.create({ data: { grupoId, periodoId }, include: INCLUDE_CONFIG });
}

export async function agregarEvaluacion(configuracionId: string, input: { nombre: string; porcentaje: number; orden: number }) {
  const configuracion = await prisma.configuracionEvaluacion.findUnique({ where: { id: configuracionId }, include: { evaluaciones: true } });
  if (!configuracion) throw new NotFoundError('Configuracion de evaluacion');
  if (configuracion.estado === 'CERRADA') {
    throw new ConflictError('La configuracion de evaluacion ya esta cerrada');
  }

  const sumaActual = configuracion.evaluaciones.reduce((acc, ev) => acc + Number(ev.porcentaje), 0);
  if (sumaActual + input.porcentaje > 100) {
    throw new ValidationError(
      { sumaActual, nuevoPorcentaje: input.porcentaje },
      `El porcentaje excede el 100%: ya hay ${sumaActual}% configurado`,
    );
  }

  return prisma.evaluacion.create({ data: { configuracionId, ...input } });
}

/** Valida que los porcentajes sumen exactamente 100% antes de cerrar la configuracion. */
export async function cerrarConfiguracion(configuracionId: string, usuarioId: string) {
  const configuracion = await prisma.configuracionEvaluacion.findUnique({ where: { id: configuracionId }, include: { evaluaciones: true } });
  if (!configuracion) throw new NotFoundError('Configuracion de evaluacion');

  const suma = configuracion.evaluaciones.reduce((acc, ev) => acc + Number(ev.porcentaje), 0);
  if (Math.abs(suma - 100) > 0.001) {
    throw new ValidationError({ suma }, `Los porcentajes deben sumar exactamente 100% (suman ${suma}%)`);
  }

  return prisma.configuracionEvaluacion.update({
    where: { id: configuracionId },
    data: { estado: 'CERRADA', cerradaPor: usuarioId, cerradaEn: new Date() },
  });
}

/** CP-05: rango 0.0-5.0 (ya validado por Zod), solo el docente del grupo, con trazabilidad en HistorialCalificacion. */
export async function registrarNota(evaluacionId: string, estudianteId: string, valor: number, docenteId: string, usuarioId: string) {
  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id: evaluacionId },
    include: { configuracion: { include: { grupo: true } } },
  });
  if (!evaluacion) throw new NotFoundError('Evaluacion');

  const docenteDelGrupo = await obtenerDocenteDelGrupo(evaluacion.configuracion.grupoId, evaluacion.configuracion.periodoId);
  if (docenteDelGrupo !== docenteId) {
    throw new ForbiddenError('Solo el docente asignado a este grupo puede registrar calificaciones');
  }

  const inscrito = await prisma.horarioEstudiante.findFirst({
    where: { estudianteId, estado: 'ACTIVA', carga: { grupoId: evaluacion.configuracion.grupoId } },
  });
  if (!inscrito) throw new ConflictError('El estudiante no esta inscrito en este grupo');

  const existente = await prisma.calificacion.findUnique({ where: { evaluacionId_estudianteId: { evaluacionId, estudianteId } } });

  return prisma.$transaction(async (tx) => {
    const calificacion = existente
      ? await tx.calificacion.update({
          where: { id: existente.id },
          data: { valor, actualizadoPor: usuarioId },
        })
      : await tx.calificacion.create({
          data: { evaluacionId, estudianteId, valor, actualizadoPor: usuarioId },
        });

    await tx.historialCalificacion.create({
      data: {
        calificacionId: calificacion.id,
        valorAnterior: existente?.valor ?? null,
        valorNuevo: valor,
        usuarioId,
      },
    });

    return calificacion;
  });
}

export async function resultadosPorEstudiante(estudianteId: string, grupoId: string) {
  const configuracion = await prisma.configuracionEvaluacion.findFirst({
    where: { grupoId },
    include: {
      evaluaciones: { include: { calificaciones: { where: { estudianteId } } } },
    },
    orderBy: { creadoEn: 'desc' },
  });
  if (!configuracion) return { evaluaciones: [], notaFinal: null };

  // Acumulado ponderado = suma(nota * porcentaje/100) de las evaluaciones ya calificadas.
  // Es la nota final solo cuando el 100% de los porcentajes configurados tiene nota.
  let acumuladoPonderado = 0;
  let porcentajeEvaluado = 0;
  const evaluaciones = configuracion.evaluaciones.map((ev) => {
    const nota = ev.calificaciones[0]?.valor ?? null;
    if (nota !== null) {
      acumuladoPonderado += Number(nota) * (Number(ev.porcentaje) / 100);
      porcentajeEvaluado += Number(ev.porcentaje);
    }
    return { id: ev.id, nombre: ev.nombre, porcentaje: ev.porcentaje, nota };
  });

  const notaFinal = porcentajeEvaluado >= 100 ? Number(acumuladoPonderado.toFixed(2)) : null;

  return {
    evaluaciones,
    porcentajeEvaluado,
    notaAcumuladaParcial: Number(acumuladoPonderado.toFixed(2)),
    notaFinal,
  };
}

export async function resultadosPorGrupo(grupoId: string) {
  const configuracion = await prisma.configuracionEvaluacion.findFirst({
    where: { grupoId },
    include: INCLUDE_CONFIG,
    orderBy: { creadoEn: 'desc' },
  });
  if (!configuracion) throw new NotFoundError('Configuracion de evaluacion');
  return configuracion;
}
