import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './administradores.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query as unknown as PaginationQuery));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { administrador, passwordTemporal } = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Administrador', registroId: administrador.id, valoresNuevos: administrador });
  res.status(201).json({ ...administrador, passwordTemporal });
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const administrador = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Administrador', registroId: administrador.id, valoresAnteriores: anterior, valoresNuevos: administrador });
  res.json(administrador);
});

export const desactivar = asyncHandler(async (req: Request, res: Response) => {
  await service.desactivar(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Administrador', registroId: req.params.id, descripcion: 'Baja logica' });
  res.status(204).send();
});

export const reactivar = asyncHandler(async (req: Request, res: Response) => {
  await service.reactivar(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Administrador', registroId: req.params.id, descripcion: 'Reactivacion' });
  res.status(204).send();
});
