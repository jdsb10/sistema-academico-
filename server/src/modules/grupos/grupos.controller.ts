import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './grupos.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { materiaId, programaId, periodoId } = req.query as Record<string, string | undefined>;
  res.json(await service.listar(req.query as unknown as PaginationQuery, { materiaId, programaId, periodoId }));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const grupo = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Grupo', registroId: grupo.id, valoresNuevos: grupo });
  res.status(201).json(grupo);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const grupo = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Grupo', registroId: grupo.id, valoresAnteriores: anterior, valoresNuevos: grupo });
  res.json(grupo);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.eliminar(req.params.id);
  await registrarAuditoria({ req, accion: 'ELIMINAR', entidad: 'Grupo', registroId: req.params.id, valoresAnteriores: anterior });
  res.status(204).send();
});

export const cupoDisponible = asyncHandler(async (req: Request, res: Response) => {
  res.json({ cupoDisponible: await service.cupoDisponible(req.params.id) });
});

export const listarEstudiantesInscritos = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listarEstudiantesInscritos(req.params.id));
});
