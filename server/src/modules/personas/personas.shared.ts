import { z } from 'zod';
import type { Rol } from '@prisma/client';
import { prisma } from '../../shared/prisma.js';
import { hashPassword } from '../auth/auth.service.js';
import { ConflictError } from '../../shared/errors.js';

export const datosPersonaBaseSchema = {
  tipoDocumento: z.enum(['CC', 'TI', 'CE', 'PASAPORTE', 'NIT']).default('CC'),
  numeroDocumento: z.string().trim().min(5).max(30),
  nombres: z.string().trim().min(2).max(120),
  apellidos: z.string().trim().min(2).max(120),
  fechaNacimiento: z.coerce.date().optional(),
  sexo: z.enum(['M', 'F', 'OTRO']).optional(),
  celular: z.string().trim().max(30).optional(),
  direccion: z.string().trim().max(250).optional(),
  ciudad: z.string().trim().max(100).optional(),
  departamento: z.string().trim().max(100).optional(),
  pais: z.string().trim().max(100).default('Colombia'),
};

export const crearUsuarioSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'La contrasena temporal debe tener al menos 8 caracteres').optional(),
});

/**
 * Crea el Usuario de autenticacion y devuelve su id. Si no se envia password,
 * se genera una temporal (el usuario debera cambiarla en el primer acceso),
 * que el llamador puede incluir en la respuesta solo en el entorno de
 * demostracion si lo necesita para entregar credenciales.
 */
export async function crearUsuarioBase(email: string, rol: Rol, password?: string): Promise<{ usuarioId: string; passwordTemporal: string }> {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) throw new ConflictError('Ya existe un usuario con ese correo');

  const passwordTemporal = password ?? generarPasswordTemporal();
  const passwordHash = await hashPassword(passwordTemporal);

  const usuario = await prisma.usuario.create({
    data: { email, passwordHash, rol, debeCambiarPassword: !password },
  });

  return { usuarioId: usuario.id, passwordTemporal };
}

function generarPasswordTemporal(): string {
  return `Acad${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 100)}!`;
}

export async function eliminarUsuarioDePerfil(usuarioId: string): Promise<void> {
  await prisma.usuario.delete({ where: { id: usuarioId } });
}
