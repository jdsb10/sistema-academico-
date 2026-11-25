import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './programas.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.listar(req.query as unknown as PaginationQuery, req.query.facultadId as string | undefined);
  res.json(resultado);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const programa = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Programa', registroId: programa.id, valoresNuevos: programa });
  res.status(201).json(programa);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const programa = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Programa', registroId: programa.id, valoresAnteriores: anterior, valoresNuevos: programa });
  res.json(programa);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.eliminar(req.params.id);
  await registrarAuditoria({ req, accion: 'ELIMINAR', entidad: 'Programa', registroId: req.params.id, valoresAnteriores: anterior });
  res.status(204).send();
});

export const asignarCoordinador = asyncHandler(async (req: Request, res: Response) => {
  const asignacion = await service.asignarCoordinador(req.params.id, req.body.coordinadorId);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Programa.coordinador', registroId: req.params.id, valoresNuevos: asignacion });
  res.status(201).json(asignacion);
});
