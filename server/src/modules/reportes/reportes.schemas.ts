import { z } from 'zod';

export const reporteQuerySchema = z.object({
  periodoId: z.string().min(1, 'El periodo academico es obligatorio'),
  programaId: z.string().optional(),
  formato: z.enum(['json', 'excel', 'pdf']).default('json'),
});
