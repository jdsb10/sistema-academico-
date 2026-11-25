import { z } from 'zod';

export const inscribirGrupoSchema = z.object({
  grupoId: z.string().min(1),
});

export const horarioQuerySchema = z.object({
  periodoId: z.string().optional(),
});
