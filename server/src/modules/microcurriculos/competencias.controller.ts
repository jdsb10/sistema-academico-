import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import * as service from './competencias.service.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query.microcurriculoId as string | undefined));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await service.crear(req.body));
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.actualizar(req.params.id, req.body));
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await service.eliminar(req.params.id);
  res.status(204).send();
});
