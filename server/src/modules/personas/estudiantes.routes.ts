import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarEstudianteSchema, crearEstudianteSchema } from './estudiantes.schemas.js';
import * as controller from './estudiantes.controller.js';

export const estudiantesRouter = Router();

estudiantesRouter.use(authenticate);

estudiantesRouter.get('/', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(paginationQuerySchema, 'query'), controller.listar);
estudiantesRouter.get(
  '/:id',
  requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'),
  validate(idParamSchema, 'params'),
  controller.obtener,
);

estudiantesRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearEstudianteSchema), controller.crear);
estudiantesRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarEstudianteSchema),
  controller.actualizar,
);
estudiantesRouter.post('/:id/desactivar', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.desactivar);
estudiantesRouter.post('/:id/reactivar', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.reactivar);
