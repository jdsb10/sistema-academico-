import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { registrarAuditoria } from '../../shared/auditoria.js';
import * as service from './reportes.service.js';
import { exportarExcel, exportarPdf } from './reportes.export.js';

type Formato = 'json' | 'excel' | 'pdf';

export const reporteAsistencia = asyncHandler(async (req: Request, res: Response) => {
  const { periodoId, programaId, formato } = req.query as { periodoId: string; programaId?: string; formato: Formato };
  const datos = await service.reporteAsistenciaPorPrograma(periodoId, programaId);
  await registrarAuditoria({ req, accion: 'EXPORTACION', entidad: 'ReporteAsistencia', descripcion: `formato=${formato}` });

  const columnas = [
    { header: 'Estudiante', key: 'nombre' },
    { header: 'Documento', key: 'documento' },
    { header: 'Programa', key: 'programa' },
    { header: 'Sesiones', key: 'total' },
    { header: 'Presentes', key: 'presentes' },
    { header: '% Asistencia', key: 'porcentajeAsistencia' },
    { header: '% Inasistencia', key: 'porcentajeInasistencia' },
  ];

  if (formato === 'excel') return exportarExcel(res, 'reporte-asistencia', columnas, datos);
  if (formato === 'pdf') return exportarPdf(res, 'Reporte de Asistencia', 'reporte-asistencia', columnas, datos);
  res.json(datos);
});

export const reporteCargaAcademica = asyncHandler(async (req: Request, res: Response) => {
  const { periodoId, programaId, formato } = req.query as { periodoId: string; programaId?: string; formato: Formato };
  const datos = await service.reporteCargaAcademica(periodoId, programaId);
  await registrarAuditoria({ req, accion: 'EXPORTACION', entidad: 'ReporteCargaAcademica', descripcion: `formato=${formato}` });

  const columnas = [
    { header: 'Programa', key: 'programa' },
    { header: 'Materia', key: 'materia' },
    { header: 'Grupo', key: 'grupo' },
    { header: 'Docente', key: 'docente' },
    { header: 'Aula', key: 'aula' },
    { header: 'Dia', key: 'dia' },
    { header: 'Inicio', key: 'horaInicio' },
    { header: 'Fin', key: 'horaFin' },
  ];

  if (formato === 'excel') return exportarExcel(res, 'reporte-carga-academica', columnas, datos);
  if (formato === 'pdf') return exportarPdf(res, 'Reporte de Carga Academica', 'reporte-carga-academica', columnas, datos);
  res.json(datos);
});

export const reporteDesempeno = asyncHandler(async (req: Request, res: Response) => {
  const { periodoId, programaId, formato } = req.query as { periodoId: string; programaId?: string; formato: Formato };
  const datos = await service.reporteDesempenoAcademico(periodoId, programaId);
  await registrarAuditoria({ req, accion: 'EXPORTACION', entidad: 'ReporteDesempeno', descripcion: `formato=${formato}` });

  const columnas = [
    { header: 'Grupo', key: 'grupo' },
    { header: 'Materia', key: 'materia' },
    { header: 'Estudiantes evaluados', key: 'estudiantesEvaluados' },
    { header: 'Promedio', key: 'promedio' },
  ];

  if (formato === 'excel') return exportarExcel(res, 'reporte-desempeno', columnas, datos);
  if (formato === 'pdf') return exportarPdf(res, 'Reporte de Desempeno Academico', 'reporte-desempeno', columnas, datos);
  res.json(datos);
});
