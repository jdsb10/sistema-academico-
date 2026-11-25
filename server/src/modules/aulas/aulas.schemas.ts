import { z } from 'zod';

export const crearAulaSchema = z.object({
  codigo: z.string().trim().min(2).max(30),
  nombre: z.string().trim().min(2).max(120),
  sedeId: z.string().min(1).optional(),
  capacidad: z.coerce.number().int().min(0).max(1000).default(0),
  descripcion: z.string().trim().max(300).optional(),
});

export const actualizarAulaSchema = crearAulaSchema.partial().extend({
  estado: z.enum(['DISPONIBLE', 'MANTENIMIENTO', 'INACTIVA']).optional(),
});

export const disponibilidadQuerySchema = z.object({
  dia: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
  periodoId: z.string().min(1),
});
