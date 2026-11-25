import { z } from 'zod';
import { crearUsuarioSchema, datosPersonaBaseSchema } from './personas.shared.js';

export const crearAdministradorSchema = z.object({
  ...datosPersonaBaseSchema,
  ...crearUsuarioSchema.shape,
  nivel: z.string().trim().max(30).default('ADMIN'),
});

export const actualizarAdministradorSchema = z
  .object(datosPersonaBaseSchema)
  .partial()
  .extend({
    estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
    nivel: z.string().trim().max(30).optional(),
  });
