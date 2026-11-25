import { z } from 'zod';
import { TipoAccion } from '@prisma/client';

// Un parametro vacio en la querystring significa "sin filtro", no un valor.
// Normalizarlo evita enviar '' a un campo enum de Prisma (500).
const textoOpcional = z
  .string()
  .trim()
  .transform((valor) => (valor === '' ? undefined : valor))
  .optional();

export const auditoriaQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  tamano: z.coerce.number().int().min(1).max(100).default(20),
  entidad: textoOpcional,
  usuarioId: textoOpcional,
  accion: textoOpcional.pipe(z.nativeEnum(TipoAccion).optional()),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});
