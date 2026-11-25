import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './aulas.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';
import type { DiaSemana } from '@prisma/client';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query as unknown as PaginationQuery));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const aula = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Aula', registroId: aula.id, valoresNuevos: aula });
  res.status(201).json(aula);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const aula = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Aula', registroId: aula.id, valoresAnteriores: anterior, valoresNuevos: aula });
  res.json(aula);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.eliminar(req.params.id);
  await registrarAuditoria({ req, accion: 'ELIMINAR', entidad: 'Aula', registroId: req.params.id, valoresAnteriores: anterior });
  res.status(204).send();
});

export const consultarDisponibilidad = asyncHandler(async (req: Request, res: Response) => {
  const { dia, periodoId } = req.query as { dia: DiaSemana; periodoId: string };
  res.json(await service.consultarDisponibilidad(req.params.id, dia, periodoId));
});
