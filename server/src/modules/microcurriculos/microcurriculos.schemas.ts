import { z } from 'zod';

export const crearMicrocurriculoSchema = z.object({
  codigo: z.string().trim().min(2).max(40),
  materiaId: z.string().min(1),
  programaId: z.string().min(1),
  numeroCreditos: z.coerce.number().int().min(1).max(10),
  nivelSuperior: z.string().trim().min(1),
  nivelNormal: z.string().trim().min(1),
  nivelBajo: z.string().trim().min(1),
  nivelDeficiente: z.string().trim().min(1),
  departamentoOferente: z.string().trim().min(2).max(150),
  tipoAsignatura: z.string().trim().min(2).max(80),
  naturalezaAsignatura: z.string().trim().min(2).max(80),
  descripcionAsignatura: z.string().trim().min(1),
  objetivoGeneral: z.string().trim().min(1),
  objetivosEspecificos: z.string().trim().min(1),
  competenciasGenericas: z.string().trim().min(1),
  estrategiasPedagogicasMetodologicas: z.string().trim().min(1),
  referenciasBibliograficas: z.string().trim().min(1),
  primerParcial: z.string().trim().min(1),
  segundoParcial: z.string().trim().min(1),
  tercerParcial: z.string().trim().min(1),
});

export const actualizarMicrocurriculoSchema = crearMicrocurriculoSchema.partial().extend({
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export const prerequisitoSchema = z.object({
  prerequisitoMicrocurriculoId: z.string().min(1),
});
