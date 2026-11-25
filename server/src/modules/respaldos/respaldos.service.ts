import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../../shared/prisma.js';
import { env } from '../../config/env.js';
import { NotFoundError, ConflictError } from '../../shared/errors.js';

/**
 * Respaldo logico en TypeScript sobre Prisma (HU-24). El paquete de
 * PostgreSQL embebido no incluye pg_dump/pg_restore, asi que el respaldo
 * serializa cada tabla a JSON en el orden de dependencias y la restauracion
 * la recorre al revés (ver ADR-08 en docs/analysis/decisiones_arquitectonicas.md).
 *
 * `usuario` se incluye en el archivo pero NO se trunca al restaurar: se
 * reinserta con `skipDuplicates` para recuperar cuentas faltantes sin borrar
 * las existentes. Asi se conservan los refresh tokens en uso, la bitacora
 * inmutable (HU-23) y las notificaciones, que no son datos academicos.
 */
const TABLAS_EN_ORDEN_DE_DEPENDENCIA = [
  'sede',
  'facultad',
  'programa',
  'periodoAcademico',
  'usuario',
  'administrador',
  'coordinador',
  'docente',
  'estudiante',
  'coordinadorPrograma',
  'materia',
  'materiaPrograma',
  'materiaDocente',
  'aula',
  'grupo',
  'cargaAcademica',
  'horarioEstudiante',
  'sensorAsistencia',
  'asistencia',
  'detalleAsistencia',
  'sensorLectura',
  'microcurriculo',
  'microcurriculoPrerequisito',
  'contenidoCompetenciaEspecifica',
  'planMicrocurriculo',
  'detallePlanMicrocurriculo',
  'configuracionEvaluacion',
  'evaluacion',
  'calificacion',
  'historialCalificacion',
  'parametroSistema',
] as const;

type NombreTabla = (typeof TABLAS_EN_ORDEN_DE_DEPENDENCIA)[number];

function delegate(modelo: NombreTabla) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[modelo];
}

export async function generarRespaldo(): Promise<{ id: string; nombreArchivo: string }> {
  const inicio = Date.now();
  await fs.mkdir(env.BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nombreArchivo = `respaldo-${timestamp}.json`;
  const ruta = path.join(env.BACKUP_DIR, nombreArchivo);

  try {
    const datos: Record<string, unknown[]> = {};
    for (const tabla of TABLAS_EN_ORDEN_DE_DEPENDENCIA) {
      datos[tabla] = await delegate(tabla).findMany();
    }

    const contenido = JSON.stringify({ generadoEn: new Date().toISOString(), tablas: TABLAS_EN_ORDEN_DE_DEPENDENCIA, datos }, jsonReplacer);
    await fs.writeFile(ruta, contenido, 'utf8');
    const { size } = await fs.stat(ruta);

    const respaldo = await prisma.respaldo.create({
      data: {
        nombreArchivo,
        ruta,
        tamanoBytes: BigInt(size),
        estado: 'COMPLETADO',
        duracionSegundos: Math.round((Date.now() - inicio) / 1000),
      },
    });

    return { id: respaldo.id, nombreArchivo };
  } catch (error) {
    await prisma.respaldo.create({
      data: {
        nombreArchivo,
        ruta,
        estado: 'FALLIDO',
        duracionSegundos: Math.round((Date.now() - inicio) / 1000),
        error: (error as Error).message,
      },
    });
    throw error;
  }
}

/**
 * Prisma devuelve `tamanoBytes` como BigInt, que JSON.stringify de Express no
 * sabe serializar. Se expone como cadena decimal (el cliente la convierte a
 * numero para mostrar KB) y se mantiene intacto el resto del registro.
 */
function serializarRespaldo<T extends { tamanoBytes: bigint | null }>(respaldo: T) {
  return { ...respaldo, tamanoBytes: respaldo.tamanoBytes?.toString() ?? null };
}

export async function listarRespaldos() {
  const respaldos = await prisma.respaldo.findMany({ orderBy: { creadoEn: 'desc' } });
  return respaldos.map(serializarRespaldo);
}

export async function obtenerRespaldo(id: string) {
  const respaldo = await prisma.respaldo.findUnique({ where: { id } });
  if (!respaldo) throw new NotFoundError('Respaldo');
  return serializarRespaldo(respaldo);
}

/**
 * Restaura un respaldo: trunca las tablas (en orden inverso de dependencias,
 * con CASCADE) y vuelve a insertar los datos guardados. Es una operacion
 * destructiva deliberada (HU-24 exige probarla); solo ADMINISTRADOR la
 * invoca y queda registrada en la bitacora por el controller.
 */
export async function restaurarRespaldo(id: string): Promise<{ duracionSegundos: number }> {
  const inicio = Date.now();
  const respaldo = await obtenerRespaldo(id);

  let contenido: { datos: Record<string, unknown[]> };
  try {
    const texto = await fs.readFile(respaldo.ruta, 'utf8');
    contenido = JSON.parse(texto, jsonReviver);
  } catch {
    throw new ConflictError('El archivo de respaldo no se pudo leer');
  }

  await prisma.$transaction(async (tx) => {
    for (const tabla of [...TABLAS_EN_ORDEN_DE_DEPENDENCIA].reverse()) {
      // `usuarios` no se trunca: hacerlo con CASCADE borraria la bitacora,
      // los refresh tokens y las notificaciones (HU-23 queda intacta).
      if (tabla === 'usuario') continue;
      const tableName = tablaSqlDe(tabla);
      await tx.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE`);
    }
    for (const tabla of TABLAS_EN_ORDEN_DE_DEPENDENCIA) {
      const filas = contenido.datos[tabla] ?? [];
      if (filas.length === 0) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any)[tabla].createMany({
        data: filas,
        ...(tabla === 'usuario' ? { skipDuplicates: true } : {}),
      });
    }
  });

  return { duracionSegundos: Math.round((Date.now() - inicio) / 1000) };
}

const MAPA_TABLA_SQL: Record<NombreTabla, string> = {
  sede: 'sedes',
  facultad: 'facultades',
  programa: 'programas',
  periodoAcademico: 'periodos_academicos',
  usuario: 'usuarios',
  administrador: 'administradores',
  coordinador: 'coordinadores',
  docente: 'docentes',
  estudiante: 'estudiantes',
  coordinadorPrograma: 'coordinadores_programas',
  materia: 'materias',
  materiaPrograma: 'materias_programas',
  materiaDocente: 'materias_docentes',
  aula: 'aulas',
  grupo: 'grupos',
  cargaAcademica: 'cargas_academicas',
  horarioEstudiante: 'horarios_estudiantes',
  sensorAsistencia: 'sensores_asistencia',
  asistencia: 'asistencias',
  detalleAsistencia: 'detalles_asistencia',
  sensorLectura: 'sensor_lecturas',
  microcurriculo: 'microcurriculos',
  microcurriculoPrerequisito: 'microcurriculos_prerequisitos',
  contenidoCompetenciaEspecifica: 'contenidos_competencias_especificas',
  planMicrocurriculo: 'planes_microcurriculares',
  detallePlanMicrocurriculo: 'detalles_plan_microcurriculo',
  configuracionEvaluacion: 'configuraciones_evaluacion',
  evaluacion: 'evaluaciones',
  calificacion: 'calificaciones',
  historialCalificacion: 'historial_calificaciones',
  parametroSistema: 'parametros_sistema',
};

function tablaSqlDe(tabla: NombreTabla): string {
  return MAPA_TABLA_SQL[tabla];
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return { __bigint: value.toString() };
  return value;
}

function jsonReviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__bigint' in (value as Record<string, unknown>)) {
    return BigInt((value as { __bigint: string }).__bigint);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}
