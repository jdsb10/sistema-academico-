import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarCargaSchema, cargasQuerySchema, crearCargaSchema } from './cargas-academicas.schemas.js';
import * as controller from './cargas-academicas.controller.js';

export const cargasAcademicasRouter = Router();

cargasAcademicasRouter.use(authenticate);

cargasAcademicasRouter.get('/', validate(cargasQuerySchema, 'query'), controller.listar);
cargasAcademicasRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

cargasAcademicasRouter.post('/', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(crearCargaSchema), controller.crear);
cargasAcademicasRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarCargaSchema),
  controller.actualizar,
);
cargasAcademicasRouter.delete('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(idParamSchema, 'params'), controller.cancelar);
