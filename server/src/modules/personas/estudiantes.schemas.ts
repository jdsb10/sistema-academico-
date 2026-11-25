import { z } from 'zod';
import { crearUsuarioSchema } from './personas.shared.js';

export const crearEstudianteSchema = z.object({
  ...crearUsuarioSchema.shape,
  tipoDocumento: z.enum(['CC', 'TI', 'CE', 'PASAPORTE', 'NIT']).default('CC'),
  numeroDocumento: z.string().trim().min(5).max(30),
  fechaExpedicion: z.coerce.date().optional(),
  nombres: z.string().trim().min(2).max(120),
  apellidos: z.string().trim().min(2).max(120),
  fechaNacimiento: z.coerce.date().optional(),
  sexo: z.enum(['M', 'F', 'OTRO']).optional(),
  celular: z.string().trim().max(30).optional(),
  estadoCivil: z.enum(['SOLTERO', 'CASADO', 'VIUDO', 'DIVORCIADO', 'UNION_LIBRE']).optional(),
  direccion: z.string().trim().max(250).optional(),
  ciudad: z.string().trim().max(100).optional(),
  departamento: z.string().trim().max(100).optional(),
  pais: z.string().trim().max(100).default('Colombia'),
  puntajeIcfes: z.coerce.number().int().min(0).max(500).optional(),
  nombreAcudiente: z.string().trim().max(120).optional(),
  apellidoAcudiente: z.string().trim().max(120).optional(),
  celularAcudiente: z.string().trim().max(30).optional(),
  sisben: z.string().trim().max(50).optional(),
  programaId: z.string().min(1, 'El programa es obligatorio'),
});

export const actualizarEstudianteSchema = crearEstudianteSchema
  .omit({ email: true, password: true })
  .partial()
  .extend({ estado: z.enum(['ACTIVO', 'INACTIVO']).optional() });
