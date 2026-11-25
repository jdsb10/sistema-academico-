import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarGrupoSchema, crearGrupoSchema } from './grupos.schemas.js';
import * as controller from './grupos.controller.js';

export const gruposRouter = Router();

gruposRouter.use(authenticate);

gruposRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
gruposRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
gruposRouter.get('/:id/cupo-disponible', validate(idParamSchema, 'params'), controller.cupoDisponible);
gruposRouter.get('/:id/estudiantes', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(idParamSchema, 'params'), controller.listarEstudiantesInscritos);

gruposRouter.post('/', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(crearGrupoSchema), controller.crear);
gruposRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR', 'COORDINADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarGrupoSchema),
  controller.actualizar,
);
gruposRouter.delete('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(idParamSchema, 'params'), controller.eliminar);
