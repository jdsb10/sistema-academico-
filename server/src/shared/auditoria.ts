import type { Request } from 'express';
import { prisma } from './prisma.js';
import type { TipoAccion, Rol } from '@prisma/client';

interface RegistrarAuditoriaInput {
  req?: Request;
  usuarioId?: string | null;
  emailUsuario?: string | null;
  rol?: Rol | null;
  accion: TipoAccion;
  entidad: string;
  registroId?: string | null;
  valoresAnteriores?: unknown;
  valoresNuevos?: unknown;
  descripcion?: string;
}

/**
 * Unico punto de escritura en la tabla auditorias. La tabla es inmutable
 * (trigger bloquear_auditoria en la BD impide UPDATE/DELETE), por lo que
 * esta funcion solo hace create.
 */
export async function registrarAuditoria(input: RegistrarAuditoriaInput): Promise<void> {
  const usuario = input.req?.usuario;
  await prisma.auditoria.create({
    data: {
      usuarioId: input.usuarioId ?? usuario?.id ?? null,
      emailUsuario: input.emailUsuario ?? usuario?.email ?? null,
      rol: input.rol ?? usuario?.rol ?? null,
      accion: input.accion,
      entidad: input.entidad,
      registroId: input.registroId ?? null,
      valoresAnteriores: input.valoresAnteriores as never,
      valoresNuevos: input.valoresNuevos as never,
      descripcion: input.descripcion,
      ip: input.req?.ip ?? null,
      userAgent: input.req?.headers['user-agent'] ?? null,
    },
  });
}
