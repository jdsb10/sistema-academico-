import { z } from 'zod';

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora invalido (HH:MM)');

export const crearCargaSchema = z
  .object({
    grupoId: z.string().min(1),
    docenteId: z.string().min(1),
    aulaId: z.string().min(1),
    periodoId: z.string().min(1),
    dia: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
    horaInicio: horaSchema,
    horaFin: horaSchema,
  })
  .refine((data) => data.horaInicio < data.horaFin, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  });

export const actualizarCargaSchema = z.object({
  docenteId: z.string().min(1).optional(),
  aulaId: z.string().min(1).optional(),
  dia: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']).optional(),
  horaInicio: horaSchema.optional(),
  horaFin: horaSchema.optional(),
  estado: z.enum(['ACTIVA', 'CANCELADA']).optional(),
});

export const cargasQuerySchema = z.object({
  periodoId: z.string().optional(),
  programaId: z.string().optional(),
  docenteId: z.string().optional(),
  aulaId: z.string().optional(),
  grupoId: z.string().optional(),
});
