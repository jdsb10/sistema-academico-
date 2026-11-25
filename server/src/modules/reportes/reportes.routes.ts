import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../shared/validate.js';
import { reporteQuerySchema } from './reportes.schemas.js';
import * as controller from './reportes.controller.js';

export const reportesRouter = Router();

reportesRouter.use(authenticate, requireRole('ADMINISTRADOR', 'COORDINADOR'));

reportesRouter.get('/asistencia', validate(reporteQuerySchema, 'query'), controller.reporteAsistencia);
reportesRouter.get('/carga-academica', validate(reporteQuerySchema, 'query'), controller.reporteCargaAcademica);
reportesRouter.get('/desempeno-academico', validate(reporteQuerySchema, 'query'), controller.reporteDesempeno);
