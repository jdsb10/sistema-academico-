import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { ForbiddenError } from '../../shared/errors.js';
import * as service from './dashboard.service.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

/** Un solo endpoint que resuelve el dashboard segun el rol del usuario autenticado. */
dashboardRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { rol, perfilId } = req.usuario!;
    if (!perfilId) throw new ForbiddenError('El usuario no tiene un perfil asociado');

    switch (rol) {
      case 'ADMINISTRADOR':
        res.json(await service.dashboardAdministrador());
        return;
      case 'COORDINADOR':
        res.json(await service.dashboardCoordinador(perfilId));
        return;
      case 'DOCENTE':
        res.json(await service.dashboardDocente(perfilId));
        return;
      case 'ESTUDIANTE':
        res.json(await service.dashboardEstudiante(perfilId));
        return;
    }
  }),
);
