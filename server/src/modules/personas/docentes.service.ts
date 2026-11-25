import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import { crearUsuarioBase } from './personas.shared.js';
import type { z } from 'zod';
import type { crearDocenteSchema, actualizarDocenteSchema } from './docentes.schemas.js';

type CrearInput = z.infer<typeof crearDocenteSchema>;
type ActualizarInput = z.infer<typeof actualizarDocenteSchema>;

const INCLUDE = {
  usuario: { select: { email: true, estado: true, ultimoAcceso: true } },
  materias: { include: { materia: { select: { id: true, codigo: true, nombre: true } } } },
};

export function listar(query: PaginationQuery) {
  return listarPaginado(prisma.docente, query, {
    include: INCLUDE,
    orderByDefault: { apellidos: 'asc' },
    camposBusqueda: ['nombres', 'apellidos', 'numeroDocumento'],
  });
}

export async function obtener(id: string) {
  const docente = await prisma.docente.findUnique({ where: { id }, include: INCLUDE });
  if (!docente) throw new NotFoundError('Docente');
  return docente;
}

export async function crear(input: CrearInput) {
  const { email, password, ...datos } = input;
  const { usuarioId, passwordTemporal } = await crearUsuarioBase(email, 'DOCENTE', password);
  const docente = await prisma.docente.create({ data: { ...datos, usuarioId }, include: INCLUDE });
  return { docente, passwordTemporal: password ? undefined : passwordTemporal };
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  return prisma.docente.update({ where: { id }, data: input, include: INCLUDE });
}

export async function desactivar(id: string) {
  const docente = await obtener(id);
  return prisma.$transaction([
    prisma.docente.update({ where: { id }, data: { estado: 'INACTIVO' } }),
    prisma.usuario.update({ where: { id: docente.usuarioId }, data: { estado: 'INACTIVO' } }),
  ]);
}

export async function reactivar(id: string) {
  const docente = await obtener(id);
  return prisma.$transaction([
    prisma.docente.update({ where: { id }, data: { estado: 'ACTIVO' } }),
    prisma.usuario.update({ where: { id: docente.usuarioId }, data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null } }),
  ]);
}

export async function obtenerCargaAcademica(docenteId: string, periodoId?: string) {
  await obtener(docenteId);
  return prisma.cargaAcademica.findMany({
    where: { docenteId, periodoId, estado: 'ACTIVA' },
    include: {
      grupo: { include: { materia: { select: { codigo: true, nombre: true } }, periodo: true } },
      aula: { select: { codigo: true, nombre: true } },
    },
    orderBy: [{ dia: 'asc' }, { horaInicio: 'asc' }],
  });
}
