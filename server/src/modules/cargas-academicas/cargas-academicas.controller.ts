import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './cargas-academicas.service.js';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { periodoId, programaId, docenteId, aulaId, grupoId } = req.query as Record<string, string | undefined>;
  res.json(await service.listar({ periodoId, programaId, docenteId, aulaId, grupoId }));
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtener(req.params.id));
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  // creadoPor referencia Coordinador (columna coordinador_origen): solo se
  // registra cuando quien crea la carga es un coordinador. Un administrador
  // tambien puede crear cargas, pero no tiene fila en esa tabla.
  const creadoPor = req.usuario?.rol === 'COORDINADOR' ? (req.usuario.perfilId ?? undefined) : undefined;
  const carga = await service.crear(req.body, creadoPor);
  await registrarAuditoria({ req, accion: 'CAMBIO_CARGA', entidad: 'CargaAcademica', registroId: carga.id, valoresNuevos: carga });
  res.status(201).json(carga);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  const carga = await service.actualizar(req.params.id, req.body);
  await registrarAuditoria({ req, accion: 'CAMBIO_CARGA', entidad: 'CargaAcademica', registroId: carga.id, valoresAnteriores: anterior, valoresNuevos: carga });
  res.json(carga);
});

export const cancelar = asyncHandler(async (req: Request, res: Response) => {
  const anterior = await service.obtener(req.params.id);
  await service.cancelar(req.params.id);
  await registrarAuditoria({ req, accion: 'CAMBIO_CARGA', entidad: 'CargaAcademica', registroId: req.params.id, valoresAnteriores: anterior, descripcion: 'Carga cancelada' });
  res.status(204).send();
});
