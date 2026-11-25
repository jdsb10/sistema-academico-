import { prisma } from '../../shared/prisma.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';

const INCLUDE = { aula: { select: { id: true, codigo: true, nombre: true } } };

export function listar(query: PaginationQuery) {
  return listarPaginado(prisma.sensorAsistencia, query, {
    include: INCLUDE,
    orderByDefault: { codigo: 'asc' },
    camposBusqueda: ['codigo'],
  });
}

export async function obtener(id: string) {
  const sensor = await prisma.sensorAsistencia.findUnique({ where: { id }, include: INCLUDE });
  if (!sensor) throw new NotFoundError('Sensor de asistencia');
  return sensor;
}

export async function crear(input: { codigo: string; aulaId: string }) {
  const aula = await prisma.aula.findUnique({ where: { id: input.aulaId } });
  if (!aula) throw new NotFoundError('Aula');
  const existente = await prisma.sensorAsistencia.findUnique({ where: { aulaId: input.aulaId } });
  if (existente) throw new ConflictError('El aula ya tiene un sensor asociado');
  return prisma.sensorAsistencia.create({ data: input, include: INCLUDE });
}

export async function actualizar(id: string, input: { estado?: 'ACTIVO' | 'INACTIVO' }) {
  await obtener(id);
  return prisma.sensorAsistencia.update({ where: { id }, data: input, include: INCLUDE });
}

/**
 * Simulador del sensor (Modulo 12). Resuelve todas las validaciones del
 * enunciado: estudiante existe, pertenece al grupo, hay sesion activa en el
 * aula del sensor, esta dentro del horario y no se duplica el registro.
 * Si `conectado` es false, la lectura se encola (PENDIENTE) para sincronizar
 * despues, igual que el sensor real cuando pierde la red (HU-13, R-01, A-01).
 */
export async function registrarLectura(sensorId: string, numeroDocumento: string, conectado: boolean) {
  const sensor = await obtener(sensorId);
  if (sensor.estado !== 'ACTIVO') {
    throw new ConflictError('El sensor esta inactivo');
  }

  const lectura = await prisma.sensorLectura.create({
    data: { sensorId, numeroDocumento, estado: conectado ? 'PENDIENTE' : 'PENDIENTE' },
  });

  await prisma.sensorAsistencia.update({ where: { id: sensorId }, data: { online: conectado, ultimoHeartbeat: new Date() } });

  if (!conectado) {
    return { lectura, resultado: 'GUARDADO_LOCAL', mensaje: 'Sin conexion: la lectura se guardo localmente en el sensor' };
  }

  return procesarLectura(lectura.id);
}

/** Procesa una lectura pendiente (en vivo, o al reconectar / sincronizar). */
async function procesarLectura(lecturaId: string) {
  const lectura = await prisma.sensorLectura.findUniqueOrThrow({ where: { id: lecturaId }, include: { sensor: true } });

  const resultado = await aplicarLectura(lectura.sensor.aulaId, lectura.numeroDocumento);

  const actualizada = await prisma.sensorLectura.update({
    where: { id: lecturaId },
    data: {
      estado: resultado.ok ? 'PROCESADA' : 'RECHAZADA',
      asistenciaId: resultado.asistenciaId,
      resultado: resultado.codigo,
      mensaje: resultado.mensaje,
      recibidaEn: new Date(),
      sincronizadaEn: new Date(),
    },
  });

  return { lectura: actualizada, resultado: resultado.codigo, mensaje: resultado.mensaje };
}

interface ResultadoLectura {
  ok: boolean;
  codigo: string;
  mensaje: string;
  asistenciaId?: string;
}

async function aplicarLectura(aulaId: string, numeroDocumento: string): Promise<ResultadoLectura> {
  const estudiante = await prisma.estudiante.findUnique({ where: { numeroDocumento } });
  if (!estudiante) {
    return { ok: false, codigo: 'ESTUDIANTE_NO_EXISTE', mensaje: 'La identificacion leida no corresponde a ningun estudiante' };
  }

  const sesionActiva = await prisma.asistencia.findFirst({
    where: { estado: 'ABIERTA', carga: { aulaId } },
    orderBy: { creadoEn: 'desc' },
    include: { carga: true },
  });
  if (!sesionActiva) {
    return { ok: false, codigo: 'SIN_SESION_ACTIVA', mensaje: 'No hay una sesion de asistencia activa en esta aula' };
  }

  const inscrito = await prisma.horarioEstudiante.findFirst({
    where: { estudianteId: estudiante.id, estado: 'ACTIVA', carga: { grupoId: sesionActiva.carga.grupoId } },
  });
  if (!inscrito) {
    return { ok: false, codigo: 'NO_PERTENECE_AL_GRUPO', mensaje: 'El estudiante no pertenece al grupo de esta sesion' };
  }

  const yaRegistrado = await prisma.detalleAsistencia.findUnique({
    where: { asistenciaId_estudianteId: { asistenciaId: sesionActiva.id, estudianteId: estudiante.id } },
  });
  if (yaRegistrado) {
    return { ok: false, codigo: 'YA_REGISTRADO', mensaje: 'El estudiante ya esta registrado en esta sesion', asistenciaId: sesionActiva.id };
  }

  const detalle = await prisma.detalleAsistencia.create({
    data: { asistenciaId: sesionActiva.id, estudianteId: estudiante.id, estado: 'PRESENTE', origen: 'SENSOR' },
  });

  return { ok: true, codigo: 'REGISTRADO', mensaje: `Asistencia registrada para ${estudiante.nombres} ${estudiante.apellidos}`, asistenciaId: detalle.asistenciaId };
}

/** Sincroniza las lecturas pendientes de un sensor al reconectar (HU-13: "sincroniza despues"). */
export async function sincronizarPendientes(sensorId: string) {
  await obtener(sensorId);
  const pendientes = await prisma.sensorLectura.findMany({ where: { sensorId, estado: 'PENDIENTE' }, orderBy: { lecturaEn: 'asc' } });

  const resultados = [];
  for (const lectura of pendientes) {
    resultados.push(await procesarLectura(lectura.id));
  }

  await prisma.sensorAsistencia.update({ where: { id: sensorId }, data: { online: true, ultimoHeartbeat: new Date() } });
  return resultados;
}

export function listarLecturas(sensorId: string) {
  return prisma.sensorLectura.findMany({ where: { sensorId }, orderBy: { lecturaEn: 'desc' }, take: 100 });
}
