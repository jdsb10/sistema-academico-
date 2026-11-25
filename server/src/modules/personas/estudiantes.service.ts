import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';
import { listarPaginado } from '../../shared/crudFactory.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import { crearUsuarioBase } from './personas.shared.js';
import type { z } from 'zod';
import type { crearEstudianteSchema, actualizarEstudianteSchema } from './estudiantes.schemas.js';

type CrearInput = z.infer<typeof crearEstudianteSchema>;
type ActualizarInput = z.infer<typeof actualizarEstudianteSchema>;

const INCLUDE = {
  usuario: { select: { email: true, estado: true, ultimoAcceso: true } },
  programa: { include: { facultad: { select: { id: true, codigo: true, nombre: true } } } },
};

export function listar(query: PaginationQuery, programaId?: string, facultadId?: string) {
  return listarPaginado(prisma.estudiante, query, {
    where: {
      ...(programaId ? { programaId } : {}),
      ...(facultadId ? { programa: { facultadId } } : {}),
    },
    include: INCLUDE,
    orderByDefault: { apellidos: 'asc' },
    camposBusqueda: ['nombres', 'apellidos', 'numeroDocumento'],
  });
}

export async function obtener(id: string) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id }, include: INCLUDE });
  if (!estudiante) throw new NotFoundError('Estudiante');
  return estudiante;
}

export async function crear(input: CrearInput) {
  const { email, password, programaId, ...datos } = input;
  const programa = await prisma.programa.findUnique({ where: { id: programaId } });
  if (!programa) throw new NotFoundError('Programa');

  const { usuarioId, passwordTemporal } = await crearUsuarioBase(email, 'ESTUDIANTE', password);
  const estudiante = await prisma.estudiante.create({
    data: { ...datos, programaId, usuarioId },
    include: INCLUDE,
  });
  return { estudiante, passwordTemporal: password ? undefined : passwordTemporal };
}

export async function actualizar(id: string, input: ActualizarInput) {
  await obtener(id);
  if (input.programaId) {
    const programa = await prisma.programa.findUnique({ where: { id: input.programaId } });
    if (!programa) throw new NotFoundError('Programa');
  }
  return prisma.estudiante.update({ where: { id }, data: input, include: INCLUDE });
}

export async function desactivar(id: string) {
  const estudiante = await obtener(id);
  return prisma.$transaction([
    prisma.estudiante.update({ where: { id }, data: { estado: 'INACTIVO' } }),
    prisma.usuario.update({ where: { id: estudiante.usuarioId }, data: { estado: 'INACTIVO' } }),
  ]);
}

export async function reactivar(id: string) {
  const estudiante = await obtener(id);
  return prisma.$transaction([
    prisma.estudiante.update({ where: { id }, data: { estado: 'ACTIVO' } }),
    prisma.usuario.update({ where: { id: estudiante.usuarioId }, data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null } }),
  ]);
}

export async function obtenerPerfilCompleto(estudianteId: string) {
  const estudiante = await obtener(estudianteId);
  const [totalAsistencias, totalPresentes] = await Promise.all([
    prisma.detalleAsistencia.count({ where: { estudianteId } }),
    prisma.detalleAsistencia.count({ where: { estudianteId, estado: 'PRESENTE' } }),
  ]);
  return {
    ...estudiante,
    porcentajeAsistencia: totalAsistencias > 0 ? Math.round((totalPresentes / totalAsistencias) * 100) : null,
  };
}
