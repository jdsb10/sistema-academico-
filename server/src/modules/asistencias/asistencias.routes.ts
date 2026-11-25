import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { idParamSchema } from '../facultades/facultades.schemas.js';
import { crearSesionSchema, registrarDetalleSchema, sesionesQuerySchema } from './asistencias.schemas.js';
import * as controller from './asistencias.controller.js';

export const asistenciasRouter = Router();

asistenciasRouter.use(authenticate);

asistenciasRouter.get('/', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(sesionesQuerySchema, 'query'), controller.listarSesiones);
asistenciasRouter.get('/:id', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), validate(idParamSchema, 'params'), controller.obtenerSesion);
asistenciasRouter.post('/', requireRole('DOCENTE'), validate(crearSesionSchema), controller.crearSesion);
asistenciasRouter.post('/:id/cerrar', requireRole('DOCENTE'), validate(idParamSchema, 'params'), controller.cerrarSesion);
asistenciasRouter.post(
  '/:id/detalles',
  requireRole('DOCENTE'),
  validate(idParamSchema, 'params'),
  validate(registrarDetalleSchema),
  controller.registrarDetalle,
);

asistenciasRouter.get(
  '/estudiantes/:estudianteId/resumen',
  requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'),
  controller.consultarPorEstudiante,
);
