import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { crearConfiguracionSchema, crearEvaluacionSchema, registrarNotaSchema } from './calificaciones.schemas.js';
import * as controller from './calificaciones.controller.js';

export const calificacionesRouter = Router();

calificacionesRouter.use(authenticate);

calificacionesRouter.get('/grupos/:grupoId/configuracion', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), controller.obtenerConfiguracion);
calificacionesRouter.get('/grupos/:grupoId/resultados', requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'), controller.resultadosPorGrupo);
calificacionesRouter.get(
  '/grupos/:grupoId/estudiantes/:estudianteId',
  requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'),
  controller.resultadosPorEstudiante,
);

calificacionesRouter.post('/configuraciones', requireRole('DOCENTE', 'COORDINADOR'), validate(crearConfiguracionSchema), controller.crearConfiguracion);
calificacionesRouter.post(
  '/configuraciones/:configuracionId/evaluaciones',
  requireRole('DOCENTE', 'COORDINADOR'),
  validate(crearEvaluacionSchema),
  controller.agregarEvaluacion,
);
calificacionesRouter.post('/configuraciones/:configuracionId/cerrar', requireRole('DOCENTE', 'COORDINADOR'), controller.cerrarConfiguracion);

calificacionesRouter.post(
  '/evaluaciones/:evaluacionId/notas',
  requireRole('DOCENTE'),
  validate(registrarNotaSchema),
  controller.registrarNota,
);
