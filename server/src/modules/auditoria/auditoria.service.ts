import { prisma } from '../../shared/prisma.js';
import { buildPaginatedResult, toSkipTake } from '../../shared/pagination.js';
import type { TipoAccion } from '@prisma/client';

interface Filtros {
  pagina: number;
  tamano: number;
  entidad?: string;
  usuarioId?: string;
  accion?: string;
  desde?: Date;
  hasta?: Date;
}

/**
 * Unico punto de LECTURA de la bitacora (HU-23). No existe update ni delete
 * en este modulo: la tabla es inmutable por trigger de base de datos.
 */
export async function listar(filtros: Filtros) {
  const { skip, take } = toSkipTake(filtros);
  // Los filtros de la UI llegan como cadenas vacias cuando no se selecciona
  // nada; Prisma no acepta '' para un enum, asi que se normalizan aqui tambien
  // para que el servicio sea seguro incluso si se llama sin el middleware.
  const entidad = filtros.entidad?.trim();
  const usuarioId = filtros.usuarioId?.trim();
  const accion = filtros.accion?.trim();
  const where = {
    entidad: entidad ? { contains: entidad, mode: 'insensitive' as const } : undefined,
    usuarioId: usuarioId || undefined,
    accion: accion ? (accion as TipoAccion) : undefined,
    creadoEn: { gte: filtros.desde, lte: filtros.hasta },
  };

  const [datos, total] = await Promise.all([
    prisma.auditoria.findMany({ where, orderBy: { creadoEn: 'desc' }, skip, take }),
    prisma.auditoria.count({ where }),
  ]);

  return buildPaginatedResult(datos, total, filtros);
}
