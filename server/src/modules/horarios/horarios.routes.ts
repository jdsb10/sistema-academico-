import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { horarioQuerySchema, inscribirGrupoSchema } from './horarios.schemas.js';
import * as controller from './horarios.controller.js';

export const horariosRouter = Router();

horariosRouter.use(authenticate);

horariosRouter.get(
  '/estudiantes/:estudianteId',
  requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'),
  validate(horarioQuerySchema, 'query'),
  controller.obtenerHorarioEstudiante,
);
horariosRouter.post(
  '/estudiantes/:estudianteId/grupos',
  requireRole('ADMINISTRADOR', 'ESTUDIANTE'),
  validate(inscribirGrupoSchema),
  controller.inscribirGrupo,
);
horariosRouter.delete(
  '/estudiantes/:estudianteId/grupos/:grupoId',
  requireRole('ADMINISTRADOR', 'ESTUDIANTE'),
  controller.retirarGrupo,
);

horariosRouter.get(
  '/docentes/:docenteId',
  requireRole('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'),
  validate(horarioQuerySchema, 'query'),
  controller.obtenerHorarioDocente,
);
