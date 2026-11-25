import { z } from 'zod';

export const crearCompetenciaSchema = z.object({
  codigo: z.string().trim().min(2).max(40),
  microcurriculoId: z.string().min(1),
  unidadTematica: z.string().trim().min(2).max(200),
  competenciasEspecificas: z.string().trim().min(1),
  resultadosAprendizaje: z.string().trim().min(1),
  nivelSuperior: z.string().trim().min(1),
  nivelNormal: z.string().trim().min(1),
  nivelBajo: z.string().trim().min(1),
  nivelDeficiente: z.string().trim().min(1),
  orden: z.coerce.number().int().min(1).default(1),
});

export const actualizarCompetenciaSchema = crearCompetenciaSchema.omit({ microcurriculoId: true }).partial();
