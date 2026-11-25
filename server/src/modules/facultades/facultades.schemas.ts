import { z } from 'zod';

export const crearFacultadSchema = z.object({
  codigo: z.string().trim().min(2).max(20),
  nombre: z.string().trim().min(3).max(150),
  descripcion: z.string().trim().max(500).optional(),
});

export const actualizarFacultadSchema = crearFacultadSchema.partial().extend({
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export const idParamSchema = z.object({ id: z.string().min(1) });
