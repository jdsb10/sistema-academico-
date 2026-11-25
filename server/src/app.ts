import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { swaggerDocument } from './docs/swagger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { facultadesRouter } from './modules/facultades/facultades.routes.js';
import { programasRouter } from './modules/programas/programas.routes.js';
import { materiasRouter } from './modules/materias/materias.routes.js';
import { aulasRouter } from './modules/aulas/aulas.routes.js';
import { gruposRouter } from './modules/grupos/grupos.routes.js';
import { periodosRouter } from './modules/periodos/periodos.routes.js';
import { administradoresRouter } from './modules/personas/administradores.routes.js';
import { coordinadoresRouter } from './modules/personas/coordinadores.routes.js';
import { docentesRouter } from './modules/personas/docentes.routes.js';
import { estudiantesRouter } from './modules/personas/estudiantes.routes.js';
import { cargasAcademicasRouter } from './modules/cargas-academicas/cargas-academicas.routes.js';
import { horariosRouter } from './modules/horarios/horarios.routes.js';
import { asistenciasRouter } from './modules/asistencias/asistencias.routes.js';
import { sensoresRouter } from './modules/sensores/sensores.routes.js';
import { microcurriculosRouter } from './modules/microcurriculos/microcurriculos.routes.js';
import { competenciasRouter } from './modules/microcurriculos/competencias.routes.js';
import { planesMicrocurricularesRouter } from './modules/microcurriculos/planes.routes.js';
import { calificacionesRouter } from './modules/calificaciones/calificaciones.routes.js';
import { reportesRouter } from './modules/reportes/reportes.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { auditoriaRouter } from './modules/auditoria/auditoria.routes.js';
import { respaldosRouter } from './modules/respaldos/respaldos.routes.js';

/** Ruta al frontend compilado, válida tanto en `src` (dev) como en `dist` (producción). */
const CLIENTE_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(apiRateLimit);

  app.get('/health', (_req, res) => {
    res.json({ estado: 'ok', entorno: env.NODE_ENV, fecha: new Date().toISOString() });
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  const api = express.Router();
  api.use('/auth', authRouter);
  api.use('/facultades', facultadesRouter);
  api.use('/programas', programasRouter);
  api.use('/materias', materiasRouter);
  api.use('/aulas', aulasRouter);
  api.use('/grupos', gruposRouter);
  api.use('/periodos', periodosRouter);
  api.use('/administradores', administradoresRouter);
  api.use('/coordinadores', coordinadoresRouter);
  api.use('/docentes', docentesRouter);
  api.use('/estudiantes', estudiantesRouter);
  api.use('/cargas-academicas', cargasAcademicasRouter);
  api.use('/horarios', horariosRouter);
  api.use('/asistencias', asistenciasRouter);
  api.use('/sensores', sensoresRouter);
  api.use('/microcurriculos', microcurriculosRouter);
  api.use('/competencias', competenciasRouter);
  api.use('/planes-microcurriculares', planesMicrocurricularesRouter);
  api.use('/calificaciones', calificacionesRouter);
  api.use('/reportes', reportesRouter);
  api.use('/dashboard', dashboardRouter);
  api.use('/auditoria', auditoriaRouter);
  api.use('/respaldos', respaldosRouter);

  app.use(env.API_PREFIX, api);

  // Un solo origen: el mismo servidor entrega el frontend compilado.
  // En desarrollo no existe `client/dist`, así que Vite sigue sirviendo la UI.
  if (existsSync(CLIENTE_DIST)) {
    app.use(express.static(CLIENTE_DIST, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(env.API_PREFIX) || req.path.startsWith('/api-docs') || req.path === '/health') {
        next();
        return;
      }
      res.sendFile(path.join(CLIENTE_DIST, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
