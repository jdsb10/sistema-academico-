import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import { crearUsuarioBase } from './personas.shared.js';
import type { z } from 'zod';
import type { crearAdministradorSchema, actualizarAdministradorSchema } from './administradores.schemas.js';

type CrearInput = z.infer<typeof crearAdministradorSchema>;
type ActualizarInput = z.infer<typeof actualizarAdministradorSchema>;

const INCLUDE = { usuario: { select: { email: true, estado: true, ultimoAcceso: true } } };

export function listar(query: PaginationQuery) {
  return listarPaginado(prisma.administrador, query, {
    include: INCLUDE,
    orderByDefault: { apellidos: 'asc' },
    camposBusqueda: ['nombres', 'apellidos', 'numeroDocumento'],
  });
}

export async function obtener(id: string) {
  const admin = await prisma.administrador.findUnique({ where: { id }, include: INCLUDE });
  if (!admin) throw new NotFoundError('Administrador');
  return admin;
}

export async function crear(input: CrearInput) {
  const { email, password, ...datos } = input;
  const { usuarioId, passwordTemporal } = await crearUsuarioBase(email, 'ADMINISTRADOR', password);
  const administrador = await prisma.administrador.create({
    data: { ...datos, usuarioId },
    include: INCLUDE,
  });
  return { administrador, passwordTemporal: password ? undefined : passwordTemporal };
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.administrador.update({ where: { id }, data: input, include: INCLUDE });
}

/** Baja logica: nunca se borra fisicamente a una persona con historial en el sistema. */
export async function desactivar(id: string) {
  const admin = await obtener(id);
  return prisma.$transaction([
    prisma.administrador.update({ where: { id }, data: { estado: 'INACTIVO' } }),
    prisma.usuario.update({ where: { id: admin.usuarioId }, data: { estado: 'INACTIVO' } }),
  ]);
}

export async function reactivar(id: string) {
  const admin = await obtener(id);
  return prisma.$transaction([
    prisma.administrador.update({ where: { id }, data: { estado: 'ACTIVO' } }),
    prisma.usuario.update({ where: { id: admin.usuarioId }, data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null } }),
  ]);
}
