import { Router } from 'express';
import { validate } from '../../shared/validate.js';
import { authenticate } from '../../middleware/auth.js';
import {
  cambiarPasswordSchema,
  confirmarResetSchema,
  loginSchema,
  refreshSchema,
  solicitarResetSchema,
} from './auth.schemas.js';
import * as controller from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), controller.postLogin);
authRouter.post('/refresh', validate(refreshSchema), controller.postRefresh);
authRouter.post('/logout', validate(refreshSchema), controller.postLogout);
authRouter.get('/perfil', authenticate, controller.getPerfil);
authRouter.post('/cambiar-password', authenticate, validate(cambiarPasswordSchema), controller.postCambiarPassword);
authRouter.post('/solicitar-reset', validate(solicitarResetSchema), controller.postSolicitarReset);
authRouter.post('/confirmar-reset', validate(confirmarResetSchema), controller.postConfirmarReset);
