import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/prisma.js';
import { env } from '../../config/env.js';
import { ForbiddenError, LockedError, UnauthorizedError } from '../../shared/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/jwt.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import type { Request } from 'express';
import type { Rol, Usuario } from '@prisma/client';

const PERFIL_RELATIONS = ['administrador', 'coordinador', 'docente', 'estudiante'] as const;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

interface UsuarioConPerfiles {
  administrador: { id: string } | null;
  coordinador: { id: string } | null;
  docente: { id: string } | null;
  estudiante: { id: string } | null;
}

async function obtenerPerfilId(usuario: UsuarioConPerfiles): Promise<string | null> {
  for (const rel of PERFIL_RELATIONS) {
    const perfil = usuario[rel];
    if (perfil) return perfil.id;
  }
  return null;
}

async function emitirTokens(usuario: Usuario, perfilId: string | null, req?: Request) {
  const accessToken = signAccessToken({
    sub: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    perfilId,
  });

  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: usuario.id, jti });
  const refreshTtlMs = parseTtlToMs(env.JWT_REFRESH_TTL);

  await prisma.refreshToken.create({
    data: {
      id: jti,
      usuarioId: usuario.id,
      tokenHash: hashToken(refreshToken),
      expiraEn: new Date(Date.now() + refreshTtlMs),
      ip: req?.ip,
      dispositivo: req?.headers['user-agent']?.toString().slice(0, 190),
    },
  });

  return { accessToken, refreshToken };
}

function parseTtlToMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1000;
  return value * unitMs;
}

export async function login(email: string, password: string, req?: Request) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { administrador: true, coordinador: true, docente: true, estudiante: true },
  });

  await prisma.intentoAcceso.create({
    data: { email, ip: req?.ip ?? 'desconocida', exitoso: false },
  });

  if (!usuario) {
    throw new UnauthorizedError('Correo o contrasena incorrectos');
  }

  if (usuario.estado === 'BLOQUEADO' && usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
    const minutos = Math.ceil((usuario.bloqueadoHasta.getTime() - Date.now()) / 60000);
    throw new LockedError(`La cuenta esta bloqueada. Intente de nuevo en ${minutos} min`);
  }

  if (usuario.estado === 'INACTIVO') {
    throw new ForbiddenError('La cuenta esta inactiva. Contacte al administrador');
  }

  // Si el bloqueo ya expiro, se libera antes de validar la contrasena.
  if (usuario.estado === 'BLOQUEADO' && usuario.bloqueadoHasta && usuario.bloqueadoHasta <= new Date()) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null },
    });
    usuario.estado = 'ACTIVO';
    usuario.intentosFallidos = 0;
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

  if (!passwordValida) {
    const intentos = usuario.intentosFallidos + 1;
    const seBloquea = intentos >= env.LOGIN_MAX_ATTEMPTS;

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        intentosFallidos: intentos,
        estado: seBloquea ? 'BLOQUEADO' : usuario.estado,
        bloqueadoHasta: seBloquea ? new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60_000) : null,
      },
    });

    await registrarAuditoria({
      usuarioId: usuario.id,
      emailUsuario: usuario.email,
      rol: usuario.rol,
      accion: seBloquea ? 'BLOQUEO_CUENTA' : 'LOGIN_FALLIDO',
      entidad: 'Usuario',
      registroId: usuario.id,
      descripcion: seBloquea
        ? `Cuenta bloqueada tras ${intentos} intentos fallidos`
        : `Intento fallido ${intentos}/${env.LOGIN_MAX_ATTEMPTS}`,
      req,
    });

    if (seBloquea) {
      throw new LockedError(`Demasiados intentos fallidos. La cuenta se bloqueo ${env.LOGIN_LOCK_MINUTES} min`);
    }
    throw new UnauthorizedError('Correo o contrasena incorrectos');
  }

  const perfilId = await obtenerPerfilId(usuario);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { intentosFallidos: 0, ultimoAcceso: new Date() },
  });

  await prisma.intentoAcceso.updateMany({
    where: { email, exitoso: false, creadoEn: { gte: new Date(Date.now() - 1000) } },
    data: { exitoso: true },
  });

  await registrarAuditoria({
    usuarioId: usuario.id,
    emailUsuario: usuario.email,
    rol: usuario.rol,
    accion: 'LOGIN',
    entidad: 'Usuario',
    registroId: usuario.id,
    req,
  });

  const tokens = await emitirTokens(usuario, perfilId, req);

  return {
    ...tokens,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      perfilId,
      debeCambiarPassword: usuario.debeCambiarPassword,
    },
  };
}

export async function refrescarSesion(refreshToken: string, req?: Request) {
  let payload: { sub: string; jti: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Refresh token invalido o expirado');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!stored || stored.revocada || stored.tokenHash !== hashToken(refreshToken) || stored.expiraEn < new Date()) {
    throw new UnauthorizedError('Refresh token invalido o expirado');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    include: { administrador: true, coordinador: true, docente: true, estudiante: true },
  });
  if (!usuario || usuario.estado !== 'ACTIVO') {
    throw new UnauthorizedError('La cuenta no esta activa');
  }

  // Rotacion: se revoca el refresh usado y se emite uno nuevo.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revocada: true } });

  const perfilId = await obtenerPerfilId(usuario);
  const tokens = await emitirTokens(usuario, perfilId, req);
  return { ...tokens, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, perfilId } };
}

export async function logout(refreshToken: string): Promise<void> {
  const hash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revocada: true } });
}

export async function cambiarPassword(usuarioId: string, passwordActual: string, passwordNueva: string, req?: Request) {
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  const valida = await bcrypt.compare(passwordActual, usuario.passwordHash);
  if (!valida) {
    throw new UnauthorizedError('La contrasena actual no es correcta');
  }
  const passwordHash = await bcrypt.hash(passwordNueva, env.BCRYPT_ROUNDS);
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { passwordHash, debeCambiarPassword: false },
  });
  await registrarAuditoria({
    usuarioId,
    emailUsuario: usuario.email,
    rol: usuario.rol,
    accion: 'ACTUALIZAR',
    entidad: 'Usuario.password',
    registroId: usuarioId,
    descripcion: 'Cambio de contrasena por el propio usuario',
    req,
  });
}

/** HU-04/RF: recuperacion de contrasena. Genera un token de un solo uso valido 1 hora. */
export async function solicitarResetPassword(email: string): Promise<{ token: string } | null> {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return null; // no se revela si el correo existe

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordReset.create({
    data: {
      usuarioId: usuario.id,
      tokenHash: hashToken(token),
      expiraEn: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return { token };
}

export async function confirmarResetPassword(token: string, passwordNueva: string): Promise<void> {
  const tokenHash = hashToken(token);
  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!reset || reset.usadoEn || reset.expiraEn < new Date()) {
    throw new UnauthorizedError('El enlace de recuperacion es invalido o ya expiro');
  }
  const passwordHash = await bcrypt.hash(passwordNueva, env.BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: reset.usuarioId },
      data: { passwordHash, debeCambiarPassword: false, intentosFallidos: 0, estado: 'ACTIVO', bloqueadoHasta: null },
    }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usadoEn: new Date() } }),
    prisma.refreshToken.updateMany({ where: { usuarioId: reset.usuarioId }, data: { revocada: true } }),
  ]);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}
