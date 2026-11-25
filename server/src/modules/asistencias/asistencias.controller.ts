import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import { ForbiddenError } from '../../shared/errors.js';
import * as service from './asistencias.service.js';

export const crearSesion = asyncHandler(async (req: Request, res: Response) => {
  const sesion = await service.crearSesion(req.usuario!.perfilId!, req.body);
  await registrarAuditoria({ req, accion: 'CREAR', entidad: 'Asistencia', registroId: sesion.id, valoresNuevos: sesion });
  res.status(201).json(sesion);
});

export const listarSesiones = asyncHandler(async (req: Request, res: Response) => {
  const { docenteId, grupoId, materiaId, desde, hasta } = req.query as Record<string, string | undefined>;
  // El docente solo ve sus propias sesiones salvo administradores/coordinadores.
  const docenteFiltro = req.usuario!.rol === 'DOCENTE' ? req.usuario!.perfilId! : docenteId;
  res.json(
    await service.listarSesiones({
      docenteId: docenteFiltro,
      grupoId,
      materiaId,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
    }),
  );
});

export const obtenerSesion = asyncHandler(async (req: Request, res: Response) => {
  const sesion = await service.obtenerSesion(req.params.id);
  if (req.usuario!.rol === 'DOCENTE' && sesion.carga.docenteId !== req.usuario!.perfilId) {
    throw new ForbiddenError('Solo puede consultar sus propias sesiones');
  }
  res.json(sesion);
});

export const registrarDetalle = asyncHandler(async (req: Request, res: Response) => {
  const detalle = await service.registrarDetalle(req.params.id, req.usuario!.perfilId!, req.body);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'DetalleAsistencia', registroId: detalle.id, valoresNuevos: detalle });
  res.status(201).json(detalle);
});

export const cerrarSesion = asyncHandler(async (req: Request, res: Response) => {
  const sesion = await service.cerrarSesion(req.params.id, req.usuario!.perfilId!);
  await registrarAuditoria({ req, accion: 'ACTUALIZAR', entidad: 'Asistencia', registroId: sesion.id, descripcion: 'Sesion cerrada' });
  res.json(sesion);
});

export const consultarPorEstudiante = asyncHandler(async (req: Request, res: Response) => {
  if (req.usuario!.rol === 'ESTUDIANTE' && req.usuario!.perfilId !== req.params.estudianteId) {
    throw new ForbiddenError('Solo puede consultar sus propias asistencias');
  }
  res.json(await service.consultarPorEstudiante(req.params.estudianteId, req.query.materiaId as string | undefined));
});
