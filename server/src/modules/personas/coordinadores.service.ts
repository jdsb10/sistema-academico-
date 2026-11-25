import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import { crearUsuarioBase } from './personas.shared.js';
import type { z } from 'zod';
import type { crearCoordinadorSchema, actualizarCoordinadorSchema } from './coordinadores.schemas.js';

type CrearInput = z.infer<typeof crearCoordinadorSchema>;
type ActualizarInput = z.infer<typeof actualizarCoordinadorSchema>;

const INCLUDE = {
  usuario: { select: { email: true, estado: true, ultimoAcceso: true } },
  programas: { where: { fechaFin: null }, include: { programa: { select: { id: true, codigo: true, nombre: true } } } },
};

export function listar(query: PaginationQuery) {
  return listarPaginado(prisma.coordinador, query, {
    include: INCLUDE,
    orderByDefault: { apellidos: 'asc' },
    camposBusqueda: ['nombres', 'apellidos', 'numeroDocumento'],
  });
}

export async function obtener(id: string) {
  const coordinador = await prisma.coordinador.findUnique({ where: { id }, include: INCLUDE });
  if (!coordinador) throw new NotFoundError('Coordinador');
  return coordinador;
}

export async function crear(input: CrearInput) {
  const { email, password, programaId, ...datos } = input;
  const { usuarioId, passwordTemporal } = await crearUsuarioBase(email, 'COORDINADOR', password);
  const coordinador = await prisma.coordinador.create({
    data: {
      ...datos,
      usuarioId,
      programas: programaId ? { create: { programaId } } : undefined,
    },
    include: INCLUDE,
  });
  return { coordinador, passwordTemporal: password ? undefined : passwordTemporal };
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.coordinador.update({ where: { id }, data: input, include: INCLUDE });
}

export async function desactivar(id: string) {
  const coordinador = await obtener(id);
  return prisma.$transaction([
    prisma.coordinador.update({ where: { id }, data: { estado: 'INACTIVO' } }),
    prisma.usuario.update({ where: { id: coordinador.usuarioId }, data: { estado: 'INACTIVO' } }),
  ]);
}

export async function reactivar(id: string) {
  const coordinador = await obtener(id);
  return prisma.$transaction([
    prisma.coordinador.update({ where: { id }, data: { estado: 'ACTIVO' } }),
    prisma.usuario.update({ where: { id: coordinador.usuarioId }, data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null } }),
  ]);
}

/** Verifica que el coordinador autenticado gestione el programa indicado (control de acceso por datos, no solo por rol). */
export async function verificarPropietarioDePrograma(coordinadorId: string, programaId: string): Promise<boolean> {
  const asignacion = await prisma.coordinadorPrograma.findFirst({
    where: { coordinadorId, programaId, fechaFin: null },
  });
  return Boolean(asignacion);
}
