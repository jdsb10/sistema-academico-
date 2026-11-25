import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarDocenteSchema, crearDocenteSchema } from './docentes.schemas.js';
import * as controller from './docentes.controller.js';

export const docentesRouter = Router();

docentesRouter.use(authenticate);

docentesRouter.get('/', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(paginationQuerySchema, 'query'), controller.listar);
docentesRouter.get('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(idParamSchema, 'params'), controller.obtener);
docentesRouter.get(
  '/:id/carga-academica',
  requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'),
  validate(idParamSchema, 'params'),
  controller.obtenerCargaAcademica,
);

docentesRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearDocenteSchema), controller.crear);
docentesRouter.put(
  '/:id',
  requireRole('ADMINISTRADOR'),
  validate(idParamSchema, 'params'),
  validate(actualizarDocenteSchema),
  controller.actualizar,
);
docentesRouter.post('/:id/desactivar', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.desactivar);
docentesRouter.post('/:id/reactivar', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), controller.reactivar);
