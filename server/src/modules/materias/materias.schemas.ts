import { z } from 'zod';

export const crearMateriaSchema = z.object({
  codigo: z.string().trim().min(2).max(30),
  nombre: z.string().trim().min(3).max(180),
  numeroCreditos: z.coerce.number().int().min(1).max(10),
  departamentoOfertante: z.string().trim().max(150).optional(),
  programaIds: z.array(z.string().min(1)).optional(),
});

export const actualizarMateriaSchema = crearMateriaSchema.partial().extend({
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export const asignarDocenteSchema = z.object({
  docenteId: z.string().min(1),
});
