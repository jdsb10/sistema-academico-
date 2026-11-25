import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './sensores.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query as unknown as PaginationQuery));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const sensor = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'SensorAsistencia', registroId: sensor.id, valoresNuevos: sensor });
  res.status(201).json(sensor);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const sensor = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'SensorAsistencia', registroId: sensor.id, valoresNuevos: sensor });
  res.json(sensor);
});

export const registrarLectura = asyncHandler(async (req: Request, res: Response) => {
  const { numeroDocumento, conectado } = req.body as { numeroDocumento: string; conectado: boolean };
  const resultado = await service.registrarLectura(req.params.id, numeroDocumento, conectado);
  res.status(201).json(resultado);
});

export const sincronizar = asyncHandler(async (req: Request, res: Response) => {
  const resultados = await service.sincronizarPendientes(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'SensorAsistencia', registroId: req.params.id, descripcion: `Sincronizadas ${resultados.length} lecturas pendientes` });
  res.json(resultados);
});

export const listarLecturas = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listarLecturas(req.params.id));
});
