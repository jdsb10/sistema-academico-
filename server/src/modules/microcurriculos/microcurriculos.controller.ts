import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './microcurriculos.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query as unknown as PaginationQuery, req.query.programaId as string | undefined));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const microcurriculo = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Microcurriculo', registroId: microcurriculo.id, valoresNuevos: microcurriculo });
  res.status(201).json(microcurriculo);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const microcurriculo = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Microcurriculo', registroId: microcurriculo.id, valoresAnteriores: anterior, valoresNuevos: microcurriculo });
  res.json(microcurriculo);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.eliminar(req.params.id);
  await registrarAuditoria({ req, accion: 'ELIMINAR', entidad: 'Microcurriculo', registroId: req.params.id, valoresAnteriores: anterior });
  res.status(204).send();
});

export const agregarPrerequisito = asyncHandler(async (req: Request, res: Response) => {
  const prerequisito = await service.agregarPrerequisito(req.params.id, req.body.prerequisitoMicrocurriculoId);
  res.status(201).json(prerequisito);
});

export const quitarPrerequisito = asyncHandler(async (req: Request, res: Response) => {
  await service.quitarPrerequisito(req.params.id, req.params.prerequisitoId);
  res.status(204).send();
});
