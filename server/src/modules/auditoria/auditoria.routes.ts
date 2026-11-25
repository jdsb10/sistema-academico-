import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { auditoriaQuerySchema } from './auditoria.schemas.js';
import * as service from './auditoria.service.js';
import type { Request, Response } from 'express';

export const auditoriaRouter = Router();

auditoriaRouter.use(authenticate, requireRole('ADMINISTRADOR'));

auditoriaRouter.get(
  '/',
  validate(auditoriaQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await service.listar(req.query as unknown as Parameters<typeof service.listar>[0]));
  }),
);
