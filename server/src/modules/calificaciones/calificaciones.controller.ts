import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import { ForbiddenError } from '../../shared/errors.js';
import * as service from './calificaciones.service.js';

export const obtenerConfiguracion = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.obtenerConfiguracion(req.params.grupoId, req.query.periodoId as string));
});

export const crearConfiguracion = asyncHandler(async (req: Request, res: Response) => {
  const { grupoId, periodoId } = req.body as { grupoId: string; periodoId: string };
  const configuracion = await service.crearConfiguracion(grupoId, periodoId);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'ConfiguracionEvaluacion', registroId: configuracion.id, valoresNuevos: configuracion });
  res.status(201).json(configuracion);
});

export const agregarEvaluacion = asyncHandler(async (req: Request, res: Response) => {
  const evaluacion = await service.agregarEvaluacion(req.params.configuracionId, req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Evaluacion', registroId: evaluacion.id, valoresNuevos: evaluacion });
  res.status(201).json(evaluacion);
});

export const cerrarConfiguracion = asyncHandler(async (req: Request, res: Response) => {
  const configuracion = await service.cerrarConfiguracion(req.params.configuracionId, req.usuario!.id);
  await registrarAuditoria({ req, accion: 'CIERRE_NOTAS', entidad: 'ConfiguracionEvaluacion', registroId: configuracion.id, valoresNuevos: configuracion });
  res.json(configuracion);
});

export const registrarNota = asyncHandler(async (req: Request, res: Response) => {
  const { estudianteId, valor } = req.body as { estudianteId: string; valor: number };
  const calificacion = await service.registrarNota(req.params.evaluacionId, estudianteId, valor, req.usuario!.perfilId!, req.usuario!.id);
  await registrarAuditoria({ req, accion: 'CAMBIO_NOTA', entidad: 'Calificacion', registroId: calificacion.id, valoresNuevos: calificacion });
  res.status(201).json(calificacion);
});

export const resultadosPorEstudiante = asyncHandler(async (req: Request, res: Response) => {
  if (req.usuario!.rol === 'ESTUDIANTE' && req.usuario!.perfilId !== req.params.estudianteId) {
    throw new ForbiddenError('Solo puede consultar sus propias calificaciones');
  }
  res.json(await service.resultadosPorEstudiante(req.params.estudianteId, req.params.grupoId));
});

export const resultadosPorGrupo = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.resultadosPorGrupo(req.params.grupoId));
});
