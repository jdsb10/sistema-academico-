import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarPeriodoSchema, crearPeriodoSchema } from './periodos.schemas.js';
import * as service from './periodos.service.js';
import type { Request, Response } from 'express';

export const periodosRouter = Router();

periodosRouter.use(authenticate);

periodosRouter.get('/', asyncHandler(async (_req: Request, res: Response) => res.json(await service.listar())));
periodosRouter.get('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req: Request, res: Response) => res.json(await service.obtener(req.params.id))));

periodosRouter.post(
  '/',
  requireRole('ADMINISTRADOR'),
  validate(crearPeriodoSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const periodo = await service.crear(req.body);
    await registrarAuditoria({ req, accion: 'CREAR', entidad: 'PeriodoAcademico', registroId: periodo.id, valoresNuevos: periodo });
    res.status(201).json(periodo);
  }),
);

periodosRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarPeriodoSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const periodo = await service.actualizar(req.params.id, req.body);
    await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'PeriodoAcademico', registroId: periodo.id, valoresNuevos: periodo });
    res.json(periodo);
  }),
);
