import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { actualizarFacultadSchema, crearFacultadSchema, idParamSchema } from './facultades.schemas.js';
import * as controller from './facultades.controller.js';

export const facultadesRouter = Router();

facultadesRouter.use(authenticate);

facultadesRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
facultadesRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
facultadesRouter.get('/:id/estudiantes/total', validate(idParamSchema, 'params'), controller.contarEstudiantes);

facultadesRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearFacultadSchema), controller.crear);
facultadesRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarFacultadSchema),
  controller.actualizar,
);
facultadesRouter.delete('/:id', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.eliminar);
