import { z } from 'zod';
import { crearUsuarioSchema, datosPersonaBaseSchema } from './personas.shared.js';

export const crearDocenteSchema = z.object({
  ...datosPersonaBaseSchema,
  ...crearUsuarioSchema.shape,
});

export const actualizarDocenteSchema = z
  .object(datosPersonaBaseSchema)
  .partial()
  .extend({ estado: z.enum(['ACTIVO', 'INACTIVO']).optional() });
