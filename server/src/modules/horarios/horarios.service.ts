import crypto from 'node:crypto';
import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';

interface FilaHorarioDocente {
  codigo_horario_docente: string;
  id_docente: string;
  nombre_docente: string;
  nombre_aula: string;
  hora_inicio: Date;
  hora_fin: Date;
  grupo: string;
  dia: string;
  codigo_materia: string;
  nombre_materia: string;
  periodo_id: string;
  estado: string;
}

/** HU-12: horario del docente. Se lee de la vista SQL horario_docente (no duplica cargas_academicas). */
export async function obtenerHorarioDocente(docenteId: string, periodoId?: string) {
  const docente = await prisma.docente.findUnique({ where: { id: docenteId } });
  if (!docente) throw new NotFoundError('Docente');

  const filas = periodoId
    ? await prisma.$queryRaw<FilaHorarioDocente[]>`
        SELECT * FROM horario_docente
        WHERE id_docente = ${docenteId} AND periodo_id = ${periodoId} AND estado = 'ACTIVA'
        ORDER BY dia, hora_inicio`
    : await prisma.$queryRaw<FilaHorarioDocente[]>`
        SELECT * FROM horario_docente
        WHERE id_docente = ${docenteId} AND estado = 'ACTIVA'
        ORDER BY dia, hora_inicio`;

  return filas;
}

const INCLUDE_HORARIO_ESTUDIANTE = {
  carga: {
    include: {
      grupo: { include: { materia: { select: { codigo: true, nombre: true } } } },
      docente: { select: { id: true, nombres: true, apellidos: true } },
      aula: { select: { id: true, codigo: true, nombre: true } },
      periodo: { select: { id: true, codigo: true, nombre: true } },
    },
  },
};

/** HU-11: horario del estudiante (sus inscripciones activas). */
export async function obtenerHorarioEstudiante(estudianteId: string, periodoId?: string) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId } });
  if (!estudiante) throw new NotFoundError('Estudiante');

  return prisma.horarioEstudiante.findMany({
    where: {
      estudianteId,
      estado: 'ACTIVA',
      carga: periodoId ? { periodoId } : undefined,
    },
    include: INCLUDE_HORARIO_ESTUDIANTE,
    orderBy: [{ carga: { dia: 'asc' } }, { carga: { horaInicio: 'asc' } }],
  });
}

/**
 * HU-11 / CP-04: inscribe al estudiante en todas las cargas (dia/hora) de un
 * grupo. Rechaza por cupo insuficiente o por choque con otra materia que el
 * estudiante ya tenga inscrita en el mismo dia/hora.
 */
export async function inscribirGrupo(estudianteId: string, grupoId: string) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId } });
  if (!estudiante) throw new NotFoundError('Estudiante');

  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: { cargas: { where: { estado: 'ACTIVA' } } },
  });
  if (!grupo) throw new NotFoundError('Grupo');
  if (grupo.cargas.length === 0) {
    throw new ConflictError('El grupo no tiene un horario asignado todavia');
  }

  const yaInscrito = await prisma.horarioEstudiante.findFirst({
    where: { estudianteId, estado: 'ACTIVA', carga: { grupoId } },
  });
  if (yaInscrito) throw new ConflictError('Ya esta inscrito en este grupo');

  const inscritosDistintos = await prisma.horarioEstudiante.findMany({
    where: { estado: 'ACTIVA', carga: { grupoId } },
    distinct: ['estudianteId'],
    select: { estudianteId: true },
  });
  if (inscritosDistintos.length >= grupo.cupo) {
    throw new ConflictError('El grupo no tiene cupo disponible');
  }

  const horariosActuales = await prisma.horarioEstudiante.findMany({
    where: { estudianteId, estado: 'ACTIVA' },
    include: { carga: { select: { dia: true, horaInicio: true, horaFin: true } } },
  });

  for (const nuevaCarga of grupo.cargas) {
    const choque = horariosActuales.some(
      (h) =>
        h.carga.dia === nuevaCarga.dia &&
        h.carga.horaInicio < nuevaCarga.horaFin &&
        h.carga.horaFin > nuevaCarga.horaInicio,
    );
    if (choque) {
      throw new ConflictError('El horario del grupo choca con una materia que ya tiene inscrita');
    }
  }

  const creados = await prisma.$transaction(
    grupo.cargas.map((carga) =>
      prisma.horarioEstudiante.create({
        data: {
          codigo: `HE-${crypto.randomBytes(6).toString('hex')}`,
          estudianteId,
          cargaId: carga.id,
        },
        include: INCLUDE_HORARIO_ESTUDIANTE,
      }),
    ),
  );

  return creados;
}

export async function retirarGrupo(estudianteId: string, grupoId: string): Promise<void> {
  const resultado = await prisma.horarioEstudiante.updateMany({
    where: { estudianteId, estado: 'ACTIVA', carga: { grupoId } },
    data: { estado: 'RETIRADA' },
  });
  if (resultado.count === 0) {
    throw new NotFoundError('Inscripcion', 'El estudiante no tiene una inscripcion activa en ese grupo');
  }
}
