import { prisma } from '../../shared/prisma.js';

export async function reporteAsistenciaPorPrograma(periodoId: string, programaId?: string) {
  const detalles = await prisma.detalleAsistencia.findMany({
    where: {
      asistencia: {
        carga: {
          periodoId,
          grupo: programaId ? { programaId } : undefined,
        },
      },
    },
    include: {
      estudiante: { select: { nombres: true, apellidos: true, numeroDocumento: true, programa: { select: { nombre: true } } } },
      asistencia: { include: { carga: { include: { grupo: { include: { materia: { select: { nombre: true } } } } } } } },
    },
  });

  const porEstudiante = new Map<string, { nombre: string; documento: string; programa: string; total: number; presentes: number }>();
  for (const d of detalles) {
    const key = d.estudianteId;
    const acc = porEstudiante.get(key) ?? {
      nombre: `${d.estudiante.nombres} ${d.estudiante.apellidos}`,
      documento: d.estudiante.numeroDocumento,
      programa: d.estudiante.programa.nombre,
      total: 0,
      presentes: 0,
    };
    acc.total += 1;
    if (d.estado === 'PRESENTE' || d.estado === 'TARDANZA') acc.presentes += 1;
    porEstudiante.set(key, acc);
  }

  return Array.from(porEstudiante.values()).map((r) => ({
    ...r,
    porcentajeAsistencia: r.total > 0 ? Math.round((r.presentes / r.total) * 100) : 0,
    porcentajeInasistencia: r.total > 0 ? Math.round(((r.total - r.presentes) / r.total) * 100) : 0,
  }));
}

export async function reporteCargaAcademica(periodoId: string, programaId?: string) {
  const cargas = await prisma.cargaAcademica.findMany({
    where: { periodoId, estado: 'ACTIVA', grupo: programaId ? { programaId } : undefined },
    include: {
      grupo: { include: { materia: { select: { codigo: true, nombre: true } }, programa: { select: { nombre: true } } } },
      docente: { select: { nombres: true, apellidos: true } },
      aula: { select: { codigo: true, nombre: true } },
    },
    orderBy: [{ dia: 'asc' }, { horaInicio: 'asc' }],
  });

  return cargas.map((c) => ({
    programa: c.grupo.programa.nombre,
    materia: `${c.grupo.materia.codigo} - ${c.grupo.materia.nombre}`,
    grupo: c.grupo.codigo,
    docente: `${c.docente.nombres} ${c.docente.apellidos}`,
    aula: `${c.aula.codigo} - ${c.aula.nombre}`,
    dia: c.dia,
    horaInicio: c.horaInicio.toISOString().slice(11, 16),
    horaFin: c.horaFin.toISOString().slice(11, 16),
  }));
}

export async function reporteDesempenoAcademico(periodoId: string, programaId?: string) {
  const grupos = await prisma.grupo.findMany({
    where: { periodoId, programaId },
    include: {
      materia: { select: { codigo: true, nombre: true } },
      configuracionesEvaluacion: {
        where: { periodoId },
        include: { evaluaciones: { include: { calificaciones: true } } },
      },
    },
  });

  return grupos.map((g) => {
    const notas = g.configuracionesEvaluacion.flatMap((c) => c.evaluaciones.flatMap((e) => e.calificaciones.map((cal) => Number(cal.valor))));
    const promedio = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
    return {
      grupo: g.codigo,
      materia: `${g.materia.codigo} - ${g.materia.nombre}`,
      estudiantesEvaluados: new Set(g.configuracionesEvaluacion.flatMap((c) => c.evaluaciones.flatMap((e) => e.calificaciones.map((cal) => cal.estudianteId)))).size,
      promedio: promedio !== null ? Number(promedio.toFixed(2)) : null,
    };
  });
}
