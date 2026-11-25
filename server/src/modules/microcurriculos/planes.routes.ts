import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarAvanceSchema, actualizarPlanSchema, crearPlanSchema, planesQuerySchema } from './planes.schemas.js';
import * as controller from './planes.controller.js';

export const planesMicrocurricularesRouter = Router();

planesMicrocurricularesRouter.use(authenticate);

planesMicrocurricularesRouter.get('/', validate(planesQuerySchema, 'query'), controller.listar);
planesMicrocurricularesRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

planesMicrocurricularesRouter.post('/', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(crearPlanSchema), controller.crear);
planesMicrocurricularesRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarPlanSchema),
  controller.actualizar,
);

planesMicrocurricularesRouter.put(
  '/:id/contenidos/:contenidoId/avance',
  requireRole('DOCENTE'),
  validate(idParamSchema, 'params'),
  validate(actualizarAvanceSchema),
  controller.actualizarAvance,
);
