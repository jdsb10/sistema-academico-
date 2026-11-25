import { z } from 'zod';

export const crearProgramaSchema = z.object({
  codigo: z.string().trim().min(2).max(30),
  nombre: z.string().trim().min(3).max(180),
  numeroCreditos: z.coerce.number().int().min(1).max(400),
  facultadId: z.string().min(1, 'La facultad es obligatoria'),
  descripcion: z.string().trim().max(1000).optional(),
});

export const actualizarProgramaSchema = crearProgramaSchema.partial().extend({
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export const asignarCoordinadorSchema = z.object({
  coordinadorId: z.string().min(1),
});
