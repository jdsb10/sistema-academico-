import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './planes.service.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { docenteId, programaId, periodoId } = req.query as Record<string, string | undefined>;
  res.json(await service.listar({ docenteId, programaId, periodoId }));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const plan = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'PlanMicrocurriculo', registroId: plan.id, valoresNuevos: plan });
  res.status(201).json(plan);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const plan = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'PlanMicrocurriculo', registroId: plan.id, valoresNuevos: plan });
  res.json(plan);
});

export const actualizarAvance = asyncHandler(async (req: Request, res: Response) => {
  const detalle = await service.actualizarAvance(req.params.id, req.params.contenidoId, req.usuario!.perfilId!, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'DetallePlanMicrocurriculo', registroId: detalle.id, valoresNuevos: detalle });
  res.json(detalle);
});
