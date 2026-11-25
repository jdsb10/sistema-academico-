import { z } from 'zod';

export const crearConfiguracionSchema = z.object({
  grupoId: z.string().min(1),
  periodoId: z.string().min(1),
});

export const crearEvaluacionSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  porcentaje: z.coerce.number().min(0.01).max(100),
  orden: z.coerce.number().int().min(1).default(1),
});

export const registrarNotaSchema = z.object({
  estudianteId: z.string().min(1),
  valor: z.coerce.number().min(0).max(5),
});
