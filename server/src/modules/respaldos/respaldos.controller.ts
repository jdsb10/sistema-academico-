import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './respaldos.service.js';

export const listar = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await service.listarRespaldos());
});

export const generar = asyncHandler(async (req: Request, res: Response) => {
  const respaldo = await service.generarRespaldo();
  await registrarAuditoria({ req, accion: 'RESPALDO', entidad: 'Respaldo', registroId: respaldo.id, descripcion: respaldo.nombreArchivo });
  res.status(201).json(respaldo);
});

export const restaurar = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.restaurarRespaldo(req.params.id);
  await registrarAuditoria({ req, accion: 'RESTAURACION', entidad: 'Respaldo', registroId: req.params.id, descripcion: `Restaurado en ${resultado.duracionSegundos}s` });
  res.json(resultado);
});
