import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { validate } from '../../shared/validate.js';
import * as controller from './respaldos.controller.js';

export const respaldosRouter = Router();

respaldosRouter.use(authenticate, requireRole('ADMINISTRADOR'));

respaldosRouter.get('/', controller.listar);
respaldosRouter.post('/', controller.generar);
respaldosRouter.post('/:id/restaurar', validate(idParamSchema, 'params'), controller.restaurar);
