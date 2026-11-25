import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/errors.js';
import { env } from '../config/env.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: { code: 'DUPLICATE', message: 'Ya existe un registro con ese valor unico', details: err.meta },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Registro no encontrado' } });
      return;
    }
    if (err.code === 'P2003') {
      res.status(409).json({
        error: { code: 'FOREIGN_KEY', message: 'La operacion viola una relacion existente', details: err.meta },
      });
      return;
    }
    // 23P01 / exclusion_violation llega envuelta como P2010 en consultas raw
    if (err.code === 'P2010' && String(err.meta?.code) === '23P01') {
      res.status(409).json({
        error: { code: 'HORARIO_EN_CONFLICTO', message: 'La asignacion choca con un horario existente de docente, aula o grupo' },
      });
      return;
    }
  }

  // Restricciones EXCLUDE de PostgreSQL (choques de horario) llegan como error crudo 23P01
  if (err instanceof Error && 'code' in err && (err as { code?: string }).code === '23P01') {
    res.status(409).json({
      error: { code: 'HORARIO_EN_CONFLICTO', message: 'La asignacion choca con un horario existente de docente, aula o grupo' },
    });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrio un error interno en el servidor',
      ...(env.isProduction ? {} : { stack: err instanceof Error ? err.stack : String(err) }),
    },
  });
}
