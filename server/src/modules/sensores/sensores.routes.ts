import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { actualizarSensorSchema, crearSensorSchema, lecturaSensorSchema } from './sensores.schemas.js';
import * as controller from './sensores.controller.js';

export const sensoresRouter = Router();

sensoresRouter.use(authenticate);

sensoresRouter.get('/', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(paginationQuerySchema, 'query'), controller.listar);
sensoresRouter.get('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(idParamSchema, 'params'), controller.obtener);
sensoresRouter.get('/:id/lecturas', requireRole('ADMINISTRADOR', 'COORDINADOR'), validate(idParamSchema, 'params'), controller.listarLecturas);

sensoresRouter.post('/', requireRole('ADMINISTRADOR'), validate(crearSensorSchema), controller.crear);
sensoresRouter.put('/:id', requireRole('ADMINISTRADOR'), validate(idParamSchema, 'params'), validate(actualizarSensorSchema), controller.actualizar);

// Estos dos endpoints simulan el dispositivo fisico (Modulo 12): en una
// integracion real los invocaria el firmware del sensor, no un usuario.
sensoresRouter.post(
  '/:id/lecturas',
  requireRole('ADMINISTRADOR', 'DOCENTE'),
  validate(idParamSchema, 'params'),
  validate(lecturaSensorSchema),
  controller.registrarLectura,
);
sensoresRouter.post('/:id/sincronizar', requireRole('ADMINISTRADOR', 'DOCENTE'), validate(idParamSchema, 'params'), controller.sincronizar);
