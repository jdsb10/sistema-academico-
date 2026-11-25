import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarProgramaSchema, asignarCoordinadorSchema, crearProgramaSchema } from './programas.schemas.js';
import * as controller from './programas.controller.js';

export const programasRouter = Router();

programasRouter.use(authenticate);

programasRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
programasRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

programasRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearProgramaSchema), controller.crear);
programasRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarProgramaSchema),
  controller.actualizar,
);
programasRouter.delete('/:id', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.eliminar);
programasRouter.post(
  '/:id/coordinador',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(asignarCoordinadorSchema),
  controller.asignarCoordinador,
);
