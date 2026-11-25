import { z } from 'zod';

export const crearSensorSchema = z.object({
  codigo: z.string().trim().min(2).max(40),
  aulaId: z.string().min(1),
});

export const actualizarSensorSchema = z.object({
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export const lecturaSensorSchema = z.object({
  numeroDocumento: z.string().trim().min(1).max(30),
  conectado: z.boolean().default(true),
});
