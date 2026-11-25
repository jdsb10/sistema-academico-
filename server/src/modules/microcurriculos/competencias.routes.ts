import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarCompetenciaSchema, crearCompetenciaSchema } from './competencias.schemas.js';
import * as controller from './competencias.controller.js';

export const competenciasRouter = Router();

competenciasRouter.use(authenticate);

competenciasRouter.get('/', controller.listar);
competenciasRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
competenciasRouter.post('/', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(crearCompetenciaSchema), controller.crear);
competenciasRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarCompetenciaSchema),
  controller.actualizar,
);
competenciasRouter.delete('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(idParamSchema, 'params'), controller.eliminar);
