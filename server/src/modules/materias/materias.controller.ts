import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './materias.service.js';
import type { PaginationQuery } from '../../shared/pagination.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listar(req.query as unknown as PaginationQuery, req.query.programaId as string | undefined));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const materia = await service.crear(req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Materia', registroId: materia.id, valoresNuevos: materia });
  res.status(201).json(materia);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const materia = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Materia', registroId: materia.id, valoresAnteriores: anterior, valoresNuevos: materia });
  res.json(materia);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.eliminar(req.params.id);
  await registrarAuditoria({ req, accion: 'ELIMINAR', entidad: 'Materia', registroId: req.params.id, valoresAnteriores: anterior });
  res.status(204).send();
});

export const asignarDocente = asyncHandler(async (req: Request, res: Response) => {
  const asignacion = await service.asignarDocente(req.params.id, req.body.docenteId);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Materia.docente', registroId: req.params.id, valoresNuevos: asignacion });
  res.status(201).json(asignacion);
});

export const quitarDocente = asyncHandler(async (req: Request, res: Response) => {
  await service.quitarDocente(req.params.id, req.params.docenteId);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Materia.docente', registroId: req.params.id, descripcion: `Se retiro al docente ${req.params.docenteId}` });
  res.status(204).send();
});
