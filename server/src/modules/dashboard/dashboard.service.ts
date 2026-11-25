import { prisma } from '../../shared/prisma.js';
import { NotFoundError } from '../../shared/errors.js';

export async function dashboardAdministrador() {
  const [totalEstudiantes, totalDocentes, totalCoordinadores, totalFacultades, totalProgramas, totalMaterias, totalAulas, porFacultad, porPrograma, asistenciasUltimos30d] =
    await Promise.all([
      prisma.estudiante.count({ where: { estado: 'ACTIVO' } }),
      prisma.docente.count({ where: { estado: 'ACTIVO' } }),
      prisma.coordinador.count({ where: { estado: 'ACTIVO' } }),
      prisma.facultad.count({ where: { estado: 'ACTIVO' } }),
      prisma.programa.count({ where: { estado: 'ACTIVO' } }),
      prisma.materia.count({ where: { estado: 'ACTIVO' } }),
      prisma.aula.count(),
      prisma.facultad.findMany({
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true, _count: { select: { programas: true } } },
      }),
      prisma.programa.findMany({
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true, _count: { select: { estudiantes: true } } },
      }),
      prisma.detalleAsistencia.groupBy({
        by: ['estado'],
        where: { horaRegistro: { gte: new Date(Date.now() - 30 * 86_400_000) } },
        _count: true,
      }),
    ]);

  const distribucionEstudiantesPorFacultad = await Promise.all(
    porFacultad.map(async (f) => ({
      facultad: f.nombre,
      programas: f._count.programas,
      estudiantes: await prisma.estudiante.count({ where: { programa: { facultadId: f.id } } }),
    })),
  );

  return {
    totales: { totalEstudiantes, totalDocentes, totalCoordinadores, totalFacultades, totalProgramas, totalMaterias, totalAulas },
    distribucionEstudiantesPorFacultad,
    distribucionEstudiantesPorPrograma: porPrograma.map((p) => ({ programa: p.nombre, estudiantes: p._count.estudiantes })),
    estadisticasAsistencia: asistenciasUltimos30d.map((a) => ({ estado: a.estado, total: a._count })),
  };
}

export async function dashboardCoordinador(coordinadorId: string) {
  const asignaciones = await prisma.coordinadorPrograma.findMany({
    where: { coordinadorId, fechaFin: null },
    include: { programa: { include: { facultad: true } } },
  });
  if (asignaciones.length === 0) {
    throw new NotFoundError('Programa', 'El coordinador no tiene un programa asignado actualmente');
  }

  const programaIds = asignaciones.map((a) => a.programaId);

  const [estudiantes, docentes, materias, microcurriculos, cargas] = await Promise.all([
    prisma.estudiante.count({ where: { programaId: { in: programaIds }, estado: 'ACTIVO' } }),
    prisma.cargaAcademica.findMany({ where: { grupo: { programaId: { in: programaIds } }, estado: 'ACTIVA' }, select: { docenteId: true }, distinct: ['docenteId'] }),
    prisma.materia.count({ where: { programas: { some: { programaId: { in: programaIds } } } } }),
    prisma.microcurriculo.findMany({ where: { programaId: { in: programaIds } }, select: { id: true, codigo: true, estado: true } }),
    prisma.cargaAcademica.count({ where: { grupo: { programaId: { in: programaIds } }, estado: 'ACTIVA' } }),
  ]);

  return {
    programas: asignaciones.map((a) => ({ id: a.programa.id, nombre: a.programa.nombre, facultad: a.programa.facultad.nombre })),
    totales: { estudiantes, docentes: docentes.length, materias, cargasAcademicas: cargas },
    microcurriculos: { total: microcurriculos.length, activos: microcurriculos.filter((m) => m.estado === 'ACTIVO').length },
  };
}

export async function dashboardDocente(docenteId: string) {
  const [materias, grupos, proximasClases, resumenAsistencia] = await Promise.all([
    prisma.materiaDocente.count({ where: { docenteId } }),
    prisma.cargaAcademica.findMany({
      where: { docenteId, estado: 'ACTIVA' },
      distinct: ['grupoId'],
      select: { grupoId: true },
    }),
    prisma.cargaAcademica.findMany({
      where: { docenteId, estado: 'ACTIVA' },
      include: { grupo: { include: { materia: { select: { nombre: true } } } }, aula: { select: { nombre: true } } },
      orderBy: [{ dia: 'asc' }, { horaInicio: 'asc' }],
      take: 5,
    }),
    prisma.detalleAsistencia.groupBy({
      by: ['estado'],
      where: { asistencia: { carga: { docenteId } }, horaRegistro: { gte: new Date(Date.now() - 14 * 86_400_000) } },
      _count: true,
    }),
  ]);

  const totalEstudiantes = await prisma.horarioEstudiante.findMany({
    where: { estado: 'ACTIVA', carga: { docenteId } },
    distinct: ['estudianteId'],
    select: { estudianteId: true },
  });

  return {
    totales: { materias, grupos: grupos.length, estudiantes: totalEstudiantes.length },
    proximasClases: proximasClases.map((c) => ({ materia: c.grupo.materia.nombre, aula: c.aula.nombre, dia: c.dia })),
    asistenciasRecientes: resumenAsistencia.map((r) => ({ estado: r.estado, total: r._count })),
  };
}

export async function dashboardEstudiante(estudianteId: string) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId }, include: { programa: { include: { facultad: true } } } });
  if (!estudiante) throw new NotFoundError('Estudiante');

  const [materiasInscritas, proximasClases, totalAsistencias, presentes] = await Promise.all([
    prisma.horarioEstudiante.count({ where: { estudianteId, estado: 'ACTIVA' } }),
    prisma.horarioEstudiante.findMany({
      where: { estudianteId, estado: 'ACTIVA' },
      include: { carga: { include: { grupo: { include: { materia: { select: { nombre: true } } } }, aula: true } } },
      orderBy: [{ carga: { dia: 'asc' } }, { carga: { horaInicio: 'asc' } }],
      take: 5,
    }),
    prisma.detalleAsistencia.count({ where: { estudianteId } }),
    prisma.detalleAsistencia.count({ where: { estudianteId, estado: { in: ['PRESENTE', 'TARDANZA'] } } }),
  ]);

  return {
    programa: estudiante.programa.nombre,
    facultad: estudiante.programa.facultad.nombre,
    totales: { materiasInscritas, porcentajeAsistencia: totalAsistencias > 0 ? Math.round((presentes / totalAsistencias) * 100) : null },
    proximasClases: proximasClases.map((h) => ({ materia: h.carga.grupo.materia.nombre, aula: h.carga.aula.nombre, dia: h.carga.dia })),
  };
}
