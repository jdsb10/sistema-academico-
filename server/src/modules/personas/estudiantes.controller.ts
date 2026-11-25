import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './estudiantes.service.js';
import { ForbiddenError } from '../../shared/errors.js';
import type { PaginationQuery } from '../../shared/pagination.js';

/**
 * Un estudiante autenticado solo puede consultar su propio perfil. Esta
 * verificacion es obligatoria aqui (no en el frontend): cambiar la URL o el
 * id en la peticion no debe exponer datos de otro estudiante.
 */
async function asegurarPropioRegistroOEquipo(req: Request, estudianteId: string) {
  if (req.usuario!.rol === 'ESTUDIANTE' && req.usuario!.perfilId !== estudianteId) {
    throw new ForbiddenError('Solo puede consultar su propia informacion');
  }
}

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(
    await service.listar(
      req.query as unknown as PaginationQuery,
      req.query.programaId as string | undefined,
      req.query.facultadId as string | undefined,
    ),
  );
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  await asegurarPropioRegistroOEquipo(req, req.params.id);
  res.json(await service.obtenerPerfilCompleto(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { estudiante, passwordTemporal } = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Estudiante', registroId: estudiante.id, valoresNuevos: estudiante });
  res.status(201).json({ ...estudiante, passwordTemporal });
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const estudiante = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Estudiante', registroId: estudiante.id, valoresAnteriores: anterior, valoresNuevos: estudiante });
  res.json(estudiante);
});

export const desactivar = asyncHandler(async (req: Request, res: Response) => {
  await service.desactivar(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Estudiante', registroId: req.params.id, descripcion: 'Baja logica' });
  res.status(204).send();
});

export const reactivar = asyncHandler(async (req: Request, res: Response) => {
  await service.reactivar(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Estudiante', registroId: req.params.id, descripcion: 'Reactivacion' });
  res.status(204).send();
});
