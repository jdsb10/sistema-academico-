import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import { ForbiddenError } from '../../shared/errors.js';
import * as service from './horarios.service.js';

function asegurarPropioEstudiante(req: Request, estudianteId: string) {
  if (req.usuario!.rol === 'ESTUDIANTE' && req.usuario!.perfilId !== estudianteId) {
    throw new ForbiddenError('Solo puede consultar o modificar su propio horario');
  }
}

function asegurarPropioDocente(req: Request, docenteId: string) {
  if (req.usuario!.rol === 'DOCENTE' && req.usuario!.perfilId !== docenteId) {
    throw new ForbiddenError('Solo puede consultar su propio horario');
  }
}

export const obtenerHorarioEstudiante = asyncHandler(async (req: Request, res: Response) => {
  asegurarPropioEstudiante(req, req.params.estudianteId);
  res.json(await service.obtenerHorarioEstudiante(req.params.estudianteId, req.query.periodoId as string | undefined));
});

export const obtenerHorarioDocente = asyncHandler(async (req: Request, res: Response) => {
  asegurarPropioDocente(req, req.params.docenteId);
  res.json(await service.obtenerHorarioDocente(req.params.docenteId, req.query.periodoId as string | undefined));
});

export const inscribirGrupo = asyncHandler(async (req: Request, res: Response) => {
  asegurarPropioEstudiante(req, req.params.estudianteId);
  const inscripciones = await service.inscribirGrupo(req.params.estudianteId, req.body.grupoId);
  await registrarAuditoria({
    req,
    accion: 'CAMBIO_HORARIO',
    entidad: 'HorarioEstudiante',
    registroId: req.params.estudianteId,
    valoresNuevos: inscripciones,
  });
  res.status(201).json(inscripciones);
});

export const retirarGrupo = asyncHandler(async (req: Request, res: Response) => {
  asegurarPropioEstudiante(req, req.params.estudianteId);
  await service.retirarGrupo(req.params.estudianteId, req.params.grupoId);
  await registrarAuditoria({
    req,
    accion: 'CAMBIO_HORARIO',
    entidad: 'HorarioEstudiante',
    registroId: req.params.estudianteId,
    descripcion: `Retiro del grupo ${req.params.grupoId}`,
  });
  res.status(204).send();
});
