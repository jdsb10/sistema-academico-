import { z } from 'zod';

export const crearGrupoSchema = z.object({
  codigo: z.string().trim().min(1).max(30),
  materiaId: z.string().min(1),
  programaId: z.string().min(1),
  periodoId: z.string().min(1),
  cupo: z.coerce.number().int().min(1).max(500).default(30),
});

export const actualizarGrupoSchema = crearGrupoSchema.partial().extend({
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});
