import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './docentes.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query as unknown as PaginationQuery));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { docente, passwordTemporal } = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Docente', registroId: docente.id, valoresNuevos: docente });
  res.status(201).json({ ...docente, passwordTemporal });
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const docente = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Docente', registroId: docente.id, valoresAnteriores: anterior, valoresNuevos: docente });
  res.json(docente);
});

export const desactivar = asyncHandler(async (req: Request, res: Response) => {
  await service.desactivar(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Docente', registroId: req.params.id, descripcion: 'Baja logica' });
  res.status(204).send();
});

export const reactivar = asyncHandler(async (req: Request, res: Response) => {
  await service.reactivar(req.params.id);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Docente', registroId: req.params.id, descripcion: 'Reactivacion' });
  res.status(204).send();
});

export const obtenerCargaAcademica = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtenerCargaAcademica(req.params.id, req.query.periodoId as string | undefined));
});
