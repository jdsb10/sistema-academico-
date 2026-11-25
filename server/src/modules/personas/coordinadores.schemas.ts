import { z } from 'zod';
import { crearUsuarioSchema, datosPersonaBaseSchema } from './personas.shared.js';

export const crearCoordinadorSchema = z.object({
  ...datosPersonaBaseSchema,
  ...crearUsuarioSchema.shape,
  programaId: z.string().min(1).optional(),
});

export const actualizarCoordinadorSchema = z
  .object(datosPersonaBaseSchema)
  .partial()
  .extend({ estado: z.enum(['ACTIVO', 'INACTIVO']).optional() });
