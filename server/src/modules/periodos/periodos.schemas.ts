import { z } from 'zod';

export const crearPeriodoSchema = z
  .object({
    codigo: z.string().trim().min(2).max(30),
    nombre: z.string().trim().min(3).max(100),
    anio: z.coerce.number().int().min(2000).max(2100),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
  })
  .refine((data) => data.fechaInicio < data.fechaFin, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export const actualizarPeriodoSchema = z.object({
  nombre: z.string().trim().min(3).max(100).optional(),
  estado: z.enum(['PLANEADO', 'ACTIVO', 'CERRADO']).optional(),
});
