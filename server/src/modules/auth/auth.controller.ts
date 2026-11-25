import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import * as authService from './auth.service.js';
import { prisma } from '../../shared/prisma.js';
import { enviarCorreo } from '../notificaciones/email.service.js';
import { env } from '../../config/env.js';

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const resultado = await authService.login(email, password, req);
  res.status(200).json(resultado);
});

export const postRefresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const resultado = await authService.refrescarSesion(refreshToken, req);
  res.status(200).json(resultado);
});

export const postLogout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  await authService.logout(refreshToken);
  res.status(204).send();
});

export const getPerfil = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ usuario: req.usuario });
});

export const postCambiarPassword = asyncHandler(async (req: Request, res: Response) => {
  const { passwordActual, passwordNueva } = req.body as { passwordActual: string; passwordNueva: string };
  await authService.cambiarPassword(req.usuario!.id, passwordActual, passwordNueva, req);
  res.status(204).send();
});

export const postSolicitarReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const resultado = await authService.solicitarResetPassword(email);
  if (resultado) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    await enviarCorreo({
      claveUnica: `reset-${resultado.token.slice(0, 16)}`,
      usuarioId: usuario!.id,
      asunto: 'Recuperacion de contrasena - Sistema Academico',
      cuerpo: `Use este token para restablecer su contrasena (valido 1 hora): ${resultado.token}`,
    });
  }
  // Respuesta generica: nunca se revela si el correo existe en el sistema.
  res.status(202).json({ mensaje: 'Si el correo existe, recibira instrucciones para restablecer la contrasena' });
});

export const postConfirmarReset = asyncHandler(async (req: Request, res: Response) => {
  const { token, passwordNueva } = req.body as { token: string; passwordNueva: string };
  await authService.confirmarResetPassword(token, passwordNueva);
  res.status(204).send();
});

void env; // mantiene import tipado disponible para futuras validaciones de entorno en este controlador
