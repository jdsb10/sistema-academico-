import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarAulaSchema, crearAulaSchema, disponibilidadQuerySchema } from './aulas.schemas.js';
import * as controller from './aulas.controller.js';

export const aulasRouter = Router();

aulasRouter.use(authenticate);

aulasRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
aulasRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
aulasRouter.get(
  '/:id/disponibilidad',
  validate(idParamSchema, 'params'),
  validate(disponibilidadQuerySchema, 'query'),
  controller.consultarDisponibilidad,
);

aulasRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearAulaSchema), controller.crear);
aulasRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarAulaSchema),
  controller.actualizar,
);
aulasRouter.delete('/:id', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.eliminar);
