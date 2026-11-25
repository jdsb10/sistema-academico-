import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarCoordinadorSchema, crearCoordinadorSchema } from './coordinadores.schemas.js';
import * as controller from './coordinadores.controller.js';

export const coordinadoresRouter = Router();

coordinadoresRouter.use(authenticate);

coordinadoresRouter.get('/', requireRole('ADMINISTRADOR'), validate(paginationQuerySchema, 'query'), controller.listar);
coordinadoresRouter.get('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(idParamSchema, 'params'), controller.obtener);
coordinadoresRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearCoordinadorSchema), controller.crear);
coordinadoresRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarCoordinadorSchema),
  controller.actualizar,
);
coordinadoresRouter.post('/:id/desactivar', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.desactivar);
coordinadoresRouter.post('/:id/reactivar', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.reactivar);
