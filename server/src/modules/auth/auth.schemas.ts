import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo invalido'),
  password: z.string().min(1, 'La contrasena es obligatoria'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken es obligatorio'),
});

export const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1),
  passwordNueva: z.string().min(8, 'La nueva contrasena debe tener al menos 8 caracteres'),
});

export const solicitarResetSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo invalido'),
});

export const confirmarResetSchema = z.object({
  token: z.string().min(1),
  passwordNueva: z.string().min(8, 'La nueva contrasena debe tener al menos 8 caracteres'),
});
