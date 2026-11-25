import type { PaginationQuery } from './pagination.js';
import { buildPaginatedResult, toSkipTake } from './pagination.js';

/**
 * Minimo comun de un delegate de Prisma que el factory necesita. Se tipa de
 * forma laxa (unknown) porque cada modelo tiene su propio tipo de filtro;
 * cada modulo que usa el factory conserva su propio tipado fuerte en
 * service.ts al envolver estas funciones.
 */
export interface PrismaDelegateLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany: (args: any) => Promise<unknown[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count: (args: any) => Promise<number>;
}

interface ListarOptions {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  orderByDefault: Record<string, 'asc' | 'desc'>;
  camposBusqueda?: string[];
}

/** Lista generica con paginacion, orden y busqueda de texto (ILIKE) por los campos indicados. */
export async function listarPaginado<T>(
  delegate: PrismaDelegateLike,
  query: PaginationQuery,
  options: ListarOptions,
): Promise<ReturnType<typeof buildPaginatedResult<T>>> {
  const { skip, take } = toSkipTake(query);

  const filtrosBusqueda =
    query.q && options.camposBusqueda?.length
      ? {
          OR: options.camposBusqueda.map((campo) => ({
            [campo]: { contains: query.q, mode: 'insensitive' as const },
          })),
        }
      : {};

  const where = { ...options.where, ...filtrosBusqueda };
  const orderBy = query.orden ? { [query.orden]: query.direccion } : options.orderByDefault;

  const [datos, total] = await Promise.all([
    delegate.findMany({ where, include: options.include, orderBy, skip, take }) as Promise<T[]>,
    delegate.count({ where }),
  ]);

  return buildPaginatedResult(datos, total, query);
}
