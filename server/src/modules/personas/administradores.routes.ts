import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarAdministradorSchema, crearAdministradorSchema } from './administradores.schemas.js';
import * as controller from './administradores.controller.js';

export const administradoresRouter = Router();

administradoresRouter.use(authenticate, requireRole('ADMINISTRADOR'));

administradoresRouter.get('/', validate(paginationQuerySchema, 'query'), controller.listar);
administradoresRouter.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
administradoresRouter.post('/', validate(crearAdministradorSchema), controller.crear);
administradoresRouter.put('/:id', validate(idParamSchema, 'params'), validate(actualizarAdministradorSchema), controller.actualizar);
administradoresRouter.post('/:id/desactivar', validate(idParamSchema, 'params'), controller.desactivar);
administradoresRouter.post('/:id/reactivar', validate(idParamSchema, 'params'), controller.reactivar);
