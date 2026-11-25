import { z } from 'zod';

export const crearPlanSchema = z
  .object({
    microcurriculoId: z.string().min(1),
    docenteId: z.string().min(1),
    materiaId: z.string().min(1),
    programaId: z.string().min(1),
    periodoId: z.string().min(1),
    anioLectivo: z.coerce.number().int().min(2000).max(2100),
    fechaInicio: z.coerce.date(),
    fechaTerminacion: z.coerce.date(),
    totalHoras: z.coerce.number().int().min(1),
  })
  .refine((data) => data.fechaInicio < data.fechaTerminacion, {
    message: 'La fecha de terminacion debe ser posterior a la fecha de inicio',
    path: ['fechaTerminacion'],
  });

export const actualizarPlanSchema = z.object({
  fechaInicio: z.coerce.date().optional(),
  fechaTerminacion: z.coerce.date().optional(),
  totalHoras: z.coerce.number().int().min(1).optional(),
  estado: z.enum(['BORRADOR', 'ACTIVO', 'CERRADO']).optional(),
});

export const actualizarAvanceSchema = z.object({
  avance: z.enum(['PENDIENTE', 'EN_CURSO', 'DESARROLLADO']),
  porcentajeAvance: z.coerce.number().int().min(0).max(100),
  observaciones: z.string().trim().max(1000).optional(),
});

export const planesQuerySchema = z.object({
  docenteId: z.string().optional(),
  programaId: z.string().optional(),
  periodoId: z.string().optional(),
});
