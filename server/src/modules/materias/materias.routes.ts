import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarMateriaSchema, asignarDocenteSchema, crearMateriaSchema } from './materias.schemas.js';
import * as controller from './materias.controller.js';

export const materiasRouter = Router();

materiasRouter.use(authenticate);

materiasRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
materiasRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

materiasRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearMateriaSchema), controller.crear);
materiasRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarMateriaSchema),
  controller.actualizar,
);
materiasRouter.delete('/:id', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.eliminar);
materiasRouter.post(
  '/:id/docentes',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(asignarDocenteSchema),
  controller.asignarDocente,
);
materiasRouter.delete('/:id/docentes/:docenteId', requireRole('ADMINISTRADOR'), controller.quitarDocente);
