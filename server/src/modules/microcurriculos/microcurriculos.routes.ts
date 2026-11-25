import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarMicrocurriculoSchema, crearMicrocurriculoSchema, prerequisitoSchema } from './microcurriculos.schemas.js';
import * as controller from './microcurriculos.controller.js';

export const microcurriculosRouter = Router();

microcurriculosRouter.use(authenticate);

microcurriculosRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
microcurriculosRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

microcurriculosRouter.post('/', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(crearMicrocurriculoSchema), controller.crear);
microcurriculosRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarMicrocurriculoSchema),
  controller.actualizar,
);
microcurriculosRouter.delete('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(idParamSchema, 'params'), controller.eliminar);

microcurriculosRouter.post(
  '/:id/prerequisitos',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  validate(idParamSchema, 'params'),
  validate(prerequisitoSchema),
  controller.agregarPrerequisito,
);
microcurriculosRouter.delete(
  '/:id/prerequisitos/:prerequisitoId',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  controller.quitarPrerequisito,
);
