import { z } from 'zod';

export const crearSesionSchema = z.object({
  cargaId: z.string().min(1),
  tema: z.string().trim().min(3).max(300),
  fecha: z.coerce.date(),
  hora: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora invalido (HH:MM)'),
});

export const registrarDetalleSchema = z.object({
  estudianteId: z.string().min(1),
  estado: z.enum(['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO']),
  justificacion: z.string().trim().max(500).optional(),
});

export const sesionesQuerySchema = z.object({
  docenteId: z.string().optional(),
  grupoId: z.string().optional(),
  materiaId: z.string().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});
