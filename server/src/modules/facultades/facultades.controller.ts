import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './facultades.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.listar(req.query as unknown as PaginationQuery);
  res.json(resultado);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const facultad = await service.obtener(req.params.id);
  res.json(facultad);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const facultad = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Facultad', registroId: facultad.id, valoresNuevos: facultad });
  res.status(201).json(facultad);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const facultad = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({
    req,
    accion: 'ACTUALIZAR',
    entidad: 'Facultad',
    registroId: facultad.id,
    valoresAnteriores: anterior,
    valoresNuevos: facultad,
  });
  res.json(facultad);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.eliminar(req.params.id);
  await registrarAuditoria({ req, accion: 'ELIMINAR', entidad: 'Facultad', registroId: req.params.id, valoresAnteriores: anterior });
  res.status(204).send();
});

export const contarEstudiantes = asyncHandler(async (req: Request, res: Response) => {
  const total = await service.contarEstudiantes(req.params.id);
  res.json({ total });
});
