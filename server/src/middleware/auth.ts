import type { NextFunction, Request, Response } from 'express';
import type { Rol } from '@prisma/client';
import { verifyAccessToken } from '../shared/jwt.js';
import { ForbiddenError, UnauthorizedError } from '../shared/errors.js';

/**
 * Exige un access token valido en el header Authorization: Bearer <token>.
 * No consulta la base de datos en cada peticion (el token ya trae rol y
 * perfilId); el estado de la cuenta (bloqueo/inactivo) se revalida en login
 * y refresh, que es donde puede cambiar.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Falta el token de acceso'));
    return;
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.usuario = {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      perfilId: payload.perfilId,
    };
    next();
  } catch {
    next(new UnauthorizedError('Token de acceso invalido o expirado'));
  }
}

/**
 * Autoriza por rol. El backend es la unica fuente de verdad del permiso:
 * ocultar un boton en el frontend no sustituye esta verificacion.
 */
export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.usuario.rol)) {
      next(new ForbiddenError(`Esta accion requiere uno de estos roles: ${roles.join(', ')}`));
      return;
    }
    next();
  };
}
