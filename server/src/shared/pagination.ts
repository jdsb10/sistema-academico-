import { z } from 'zod';

export const paginationQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  tamano: z.coerce.number().int().min(1).max(100).default(20),
  orden: z.string().optional(),
  direccion: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().trim().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginatedResult<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    tamano: number;
    total: number;
    totalPaginas: number;
  };
}

export function toSkipTake(query: Pick<PaginationQuery, 'pagina' | 'tamano'>) {
  return {
    skip: (query.pagina - 1) * query.tamano,
    take: query.tamano,
  };
}

export function buildPaginatedResult<T>(
  datos: T[],
  total: number,
  query: Pick<PaginationQuery, 'pagina' | 'tamano'>,
): PaginatedResult<T> {
  return {
    datos,
    paginacion: {
      pagina: query.pagina,
      tamano: query.tamano,
      total,
      totalPaginas: Math.max(1, Math.ceil(total / query.tamano)),
    },
  };
}
