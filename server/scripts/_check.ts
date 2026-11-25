/**
 * Verificacion de las restricciones de exclusión de la migracion de integridad
 * (equivale al caso CP-02 a nivel de base de datos).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function expectError(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
    console.log(`FALLO  ${label}: la operacion NO fue rechazada`);
    process.exitCode = 1;
  } catch (error) {
    const msg = (error as Error).message.replace(/\n/g, ' ').slice(0, 150);
    console.log(`OK     ${label} -> rechazado: ${msg}`);
  }
}

async function main(): Promise<void> {
  // Limpieza en orden inverso de dependencias para que la verificacion sea
  // repetible (los datos de esta corrida son de prueba, no semilla).
  await prisma.historialCalificacion.deleteMany();
  await prisma.calificacion.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.configuracionEvaluacion.deleteMany();
  await prisma.detallePlanMicrocurriculo.deleteMany();
  await prisma.planMicrocurriculo.deleteMany();
  await prisma.contenidoCompetenciaEspecifica.deleteMany();
  await prisma.microcurriculoPrerequisito.deleteMany();
  await prisma.microcurriculo.deleteMany();
  await prisma.detalleAsistencia.deleteMany();
  await prisma.sensorLectura.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.sensorAsistencia.deleteMany();
  await prisma.horarioEstudiante.deleteMany();
  await prisma.cargaAcademica.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.materiaPrograma.deleteMany();
  await prisma.materiaDocente.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.sede.deleteMany();
  // La bitacora es inmutable (trigger de fila): para limpiar datos de prueba
  // se usa TRUNCATE, que no dispara triggers a nivel de fila.
  await prisma.$executeRawUnsafe('TRUNCATE TABLE auditorias CASCADE');
  await prisma.coordinadorPrograma.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.estudiante.deleteMany();
  await prisma.coordinador.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.facultad.deleteMany();
  await prisma.periodoAcademico.deleteMany();
  await prisma.respaldo.deleteMany();
  await prisma.usuario.deleteMany();

  const sede = await prisma.sede.create({
    data: { codigo: 'SDE-1', nombre: 'Sede Principal' },
  });
  const facultad = await prisma.facultad.create({
    data: { codigo: 'FAC-1', nombre: 'Facultad de Ingenieria' },
  });
  const programa = await prisma.programa.create({
    data: { codigo: 'PROG-1', nombre: 'Ingenieria de Software', numeroCreditos: 160, facultadId: facultad.id },
  });
  const periodo = await prisma.periodoAcademico.create({
    data: {
      codigo: '2026-1',
      nombre: 'Primer semestre 2026',
      anio: 2026,
      fechaInicio: new Date('2026-02-02'),
      fechaFin: new Date('2026-06-20'),
      estado: 'ACTIVO',
    },
  });
  const materiaM1 = await prisma.materia.create({ data: { codigo: 'M1', nombre: 'Materia Uno', numeroCreditos: 3 } });
  const materiaM2 = await prisma.materia.create({ data: { codigo: 'M2', nombre: 'Materia Dos', numeroCreditos: 3 } });

  const usuarioDocente = await prisma.usuario.create({
    data: { email: 'd1@test.edu.co', passwordHash: 'x', rol: 'DOCENTE' },
  });
  const docente1 = await prisma.docente.create({
    data: { usuarioId: usuarioDocente.id, numeroDocumento: '1001', nombres: 'Diego', apellidos: 'Uno' },
  });
  const usuarioDocente2 = await prisma.usuario.create({
    data: { email: 'd2@test.edu.co', passwordHash: 'x', rol: 'DOCENTE' },
  });
  const docente2 = await prisma.docente.create({
    data: { usuarioId: usuarioDocente2.id, numeroDocumento: '1002', nombres: 'Diego', apellidos: 'Dos' },
  });

  const aula101 = await prisma.aula.create({ data: { codigo: 'A101', nombre: 'Aula 101', sedeId: sede.id } });
  const aula205 = await prisma.aula.create({ data: { codigo: 'A205', nombre: 'Aula 205', sedeId: sede.id } });

  const grupoM1 = await prisma.grupo.create({
    data: { codigo: 'G-M1', materiaId: materiaM1.id, programaId: programa.id, periodoId: periodo.id, cupo: 40 },
  });
  const grupoM2 = await prisma.grupo.create({
    data: { codigo: 'G-M2', materiaId: materiaM2.id, programaId: programa.id, periodoId: periodo.id, cupo: 40 },
  });

  const t = (hhmm: string): Date => new Date(`1970-01-01T${hhmm}.000Z`);
  const lunes8a10 = { dia: 'LUNES' as const, horaInicio: t('08:00:00'), horaFin: t('10:00:00') };
  const base = {
    grupoId: grupoM1.id,
    docenteId: docente1.id,
    aulaId: aula101.id,
    periodoId: periodo.id,
    ...lunes8a10,
  };

  // Caso base: D1, M1, A101, lunes 8:00-10:00
  const carga1 = await prisma.cargaAcademica.create({ data: base });
  console.log('OK     carga base creada');

  // CP-02 Caso A: D1 (mismo docente) en otra materia/aula a la misma hora
  await expectError('CP-02 Caso A (docente con choque)', () =>
    prisma.cargaAcademica.create({
      data: { ...base, grupoId: grupoM2.id, aulaId: aula205.id },
    }),
  );

  // CP-02 Caso B: D2 en el aula A101 a la misma hora
  await expectError('CP-02 Caso B (aula ocupada)', () =>
    prisma.cargaAcademica.create({
      data: { ...base, docenteId: docente2.id, grupoId: grupoM2.id, aulaId: aula101.id },
    }),
  );

  // CP-02 Caso C: D1, M2, A205, lunes 10:00-12:00 (horas contiguas, sin traslape)
  try {
    await prisma.cargaAcademica.create({
      data: {
        ...base,
        grupoId: grupoM2.id,
        aulaId: aula205.id,
        horaInicio: t('10:00:00'),
        horaFin: t('12:00:00'),
      },
    });
    console.log('OK     CP-02 Caso C (horas contiguas aceptadas)');
  } catch (error) {
    console.log('FALLO  CP-02 Caso C rechazado:', (error as Error).message.split('\n')[0]);
    process.exitCode = 1;
  }

  // Bitacora inmutable
  const audit = await prisma.auditoria.create({
    data: { accion: 'CREAR', entidad: 'prueba', descripcion: 'verificacion' },
  });
  await expectError('HU-23 bitacora inmutable', () =>
    prisma.auditoria.update({ where: { id: audit.id }, data: { descripcion: 'hackeado' } }),
  );

  // Vista horario_docente
  const vista = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    'SELECT codigo_horario_docente, nombre_docente, nombre_aula, dia FROM horario_docente ORDER BY nombre_aula',
  );
  const vistaOk =
    vista.length === 2 &&
    vista[0].nombre_aula === 'Aula 101' &&
    vista[1].nombre_aula === 'Aula 205' &&
    vista[0].nombre_docente === 'Diego Uno';
  console.log(
    vistaOk
      ? 'OK     vista horario_docente: 2 filas con docente, aula y dia resueltos'
      : `FALLO  vista horario_docente: ${JSON.stringify(vista)}`,
  );
  if (!vistaOk) process.exitCode = 1;

  console.log('\nCarga base:', carga1.id);
}

main()
  .catch((error) => {
    console.error('ERROR GENERAL:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
