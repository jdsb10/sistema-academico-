/**
 * Datos de demostracion (Fase 12 / HU del documento de requerimientos).
 * Crea una institucion de ejemplo completa: facultades, programas, materias,
 * aulas, personas de los 4 roles, carga academica sin choques, horarios de
 * estudiante, un sensor con historial de lecturas, un microcurriculo con
 * seguimiento y una configuracion de evaluacion con notas parciales.
 *
 * Todas las cuentas de demostracion usan la misma contrasena temporal
 * (ver docs/PROGRESS.md y README.md): DemoAcademico2026!
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PASSWORD_DEMO = 'DemoAcademico2026!';

function t(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

async function crearUsuario(email: string, rol: 'ADMINISTRADOR' | 'COORDINADOR' | 'DOCENTE' | 'ESTUDIANTE') {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);
  return prisma.usuario.create({ data: { email, passwordHash, rol, debeCambiarPassword: false } });
}

async function main() {
  console.log('[seed] Limpiando datos existentes...');
  await prisma.historialCalificacion.deleteMany();
  await prisma.calificacion.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.configuracionEvaluacion.deleteMany();
  await prisma.detallePlanMicrocurriculo.deleteMany();
  await prisma.planMicrocurriculo.deleteMany();
  await prisma.contenidoCompetenciaEspecifica.deleteMany();
  await prisma.microcurriculoPrerequisito.deleteMany();
  await prisma.microcurriculo.deleteMany();
  await prisma.sensorLectura.deleteMany();
  await prisma.detalleAsistencia.deleteMany();
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
  await prisma.$executeRawUnsafe('TRUNCATE TABLE auditorias CASCADE');
  await prisma.notificacionCorreo.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.intentoAcceso.deleteMany();
  await prisma.coordinadorPrograma.deleteMany();
  // Las personas referencian programa (estudiante) y usuario: deben borrarse
  // antes que programa/facultad y antes que usuario.
  await prisma.estudiante.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.coordinador.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.facultad.deleteMany();
  await prisma.periodoAcademico.deleteMany();
  await prisma.respaldo.deleteMany();
  await prisma.parametroSistema.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('[seed] Creando estructura academica...');
  const sede = await prisma.sede.create({ data: { codigo: 'SDE-01', nombre: 'Sede Principal', ciudad: 'Bogota' } });

  const facultadIngenieria = await prisma.facultad.create({
    data: { codigo: 'FAC-ING', nombre: 'Facultad de Ingenieria', descripcion: 'Programas de ingenieria y tecnologia' },
  });
  const facultadEconomicas = await prisma.facultad.create({
    data: { codigo: 'FAC-ECO', nombre: 'Facultad de Ciencias Economicas', descripcion: 'Programas de administracion y economia' },
  });

  const programaISW = await prisma.programa.create({
    data: { codigo: 'ISW', nombre: 'Ingenieria de Software', numeroCreditos: 160, facultadId: facultadIngenieria.id },
  });
  const programaIndustrial = await prisma.programa.create({
    data: { codigo: 'IND', nombre: 'Ingenieria Industrial', numeroCreditos: 158, facultadId: facultadIngenieria.id },
  });
  const programaAdmon = await prisma.programa.create({
    data: { codigo: 'ADM', nombre: 'Administracion de Empresas', numeroCreditos: 150, facultadId: facultadEconomicas.id },
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

  console.log('[seed] Creando materias y aulas...');
  const materiaProg1 = await prisma.materia.create({ data: { codigo: 'ISW-101', nombre: 'Programacion I', numeroCreditos: 4, departamentoOfertante: 'Ingenieria de Sistemas' } });
  const materiaBD = await prisma.materia.create({ data: { codigo: 'ISW-205', nombre: 'Bases de Datos', numeroCreditos: 3, departamentoOfertante: 'Ingenieria de Sistemas' } });
  const materiaCalculo = await prisma.materia.create({ data: { codigo: 'MAT-101', nombre: 'Calculo I', numeroCreditos: 4, departamentoOfertante: 'Ciencias Basicas' } });
  const materiaISWII = await prisma.materia.create({ data: { codigo: 'ISW-402', nombre: 'Ingenieria de Software II', numeroCreditos: 3, departamentoOfertante: 'Ingenieria de Sistemas' } });
  const materiaContabilidad = await prisma.materia.create({ data: { codigo: 'ADM-110', nombre: 'Contabilidad I', numeroCreditos: 3, departamentoOfertante: 'Ciencias Economicas' } });

  await prisma.materiaPrograma.createMany({
    data: [
      { materiaId: materiaProg1.id, programaId: programaISW.id },
      { materiaId: materiaBD.id, programaId: programaISW.id },
      { materiaId: materiaCalculo.id, programaId: programaISW.id },
      { materiaId: materiaCalculo.id, programaId: programaIndustrial.id },
      { materiaId: materiaISWII.id, programaId: programaISW.id },
      { materiaId: materiaContabilidad.id, programaId: programaAdmon.id },
    ],
  });

  const aulaA101 = await prisma.aula.create({ data: { codigo: 'A101', nombre: 'Aula 101', sedeId: sede.id, capacidad: 40 } });
  const aulaA102 = await prisma.aula.create({ data: { codigo: 'A102', nombre: 'Aula 102', sedeId: sede.id, capacidad: 35 } });
  const aulaB201 = await prisma.aula.create({ data: { codigo: 'B201', nombre: 'Aula 201 - Bloque B', sedeId: sede.id, capacidad: 30 } });

  console.log('[seed] Creando usuarios y personas...');
  const usuarioAdmin = await crearUsuario('admin@universidad.edu.co', 'ADMINISTRADOR');
  const administrador = await prisma.administrador.create({
    data: { usuarioId: usuarioAdmin.id, numeroDocumento: '1000000001', nombres: 'Laura', apellidos: 'Martinez', nivel: 'ADMIN' },
  });

  const usuarioCoord1 = await crearUsuario('coordinador.isw@universidad.edu.co', 'COORDINADOR');
  const coordinadorISW = await prisma.coordinador.create({
    data: { usuarioId: usuarioCoord1.id, numeroDocumento: '1000000002', nombres: 'Carlos', apellidos: 'Ramirez' },
  });
  await prisma.coordinadorPrograma.create({ data: { coordinadorId: coordinadorISW.id, programaId: programaISW.id } });

  const usuarioCoord2 = await crearUsuario('coordinador.adm@universidad.edu.co', 'COORDINADOR');
  const coordinadorAdm = await prisma.coordinador.create({
    data: { usuarioId: usuarioCoord2.id, numeroDocumento: '1000000003', nombres: 'Marcela', apellidos: 'Gomez' },
  });
  await prisma.coordinadorPrograma.create({ data: { coordinadorId: coordinadorAdm.id, programaId: programaAdmon.id } });

  const usuarioDoc1 = await crearUsuario('docente.rendon@universidad.edu.co', 'DOCENTE');
  const docente1 = await prisma.docente.create({
    data: { usuarioId: usuarioDoc1.id, numeroDocumento: '1000000010', nombres: 'Alex', apellidos: 'Rendon', celular: '3001234567' },
  });

  const usuarioDoc2 = await crearUsuario('docente.lafont@universidad.edu.co', 'DOCENTE');
  const docente2 = await prisma.docente.create({
    data: { usuarioId: usuarioDoc2.id, numeroDocumento: '1000000011', nombres: 'Esteban', apellidos: 'Lafont', celular: '3001234568' },
  });

  const usuarioDoc3 = await crearUsuario('docente.salas@universidad.edu.co', 'DOCENTE');
  const docente3 = await prisma.docente.create({
    data: { usuarioId: usuarioDoc3.id, numeroDocumento: '1000000012', nombres: 'Juan David', apellidos: 'Salas', celular: '3001234569' },
  });

  await prisma.materiaDocente.createMany({
    data: [
      { materiaId: materiaProg1.id, docenteId: docente1.id },
      { materiaId: materiaCalculo.id, docenteId: docente1.id },
      { materiaId: materiaBD.id, docenteId: docente2.id },
      { materiaId: materiaISWII.id, docenteId: docente3.id },
      { materiaId: materiaContabilidad.id, docenteId: docente3.id },
    ],
  });

  const estudiantesData = [
    { email: 'est.brochero@universidad.edu.co', doc: '1000000020', nombres: 'Javier', apellidos: 'Brochero', programa: programaISW.id },
    { email: 'est.molina@universidad.edu.co', doc: '1000000021', nombres: 'Victor', apellidos: 'Molina', programa: programaISW.id },
    { email: 'est.perez@universidad.edu.co', doc: '1000000022', nombres: 'Natalia', apellidos: 'Perez', programa: programaISW.id },
    { email: 'est.gutierrez@universidad.edu.co', doc: '1000000023', nombres: 'Sebastian', apellidos: 'Gutierrez', programa: programaISW.id },
    { email: 'est.rojas@universidad.edu.co', doc: '1000000024', nombres: 'Daniela', apellidos: 'Rojas', programa: programaAdmon.id },
    { email: 'est.vargas@universidad.edu.co', doc: '1000000025', nombres: 'Andres', apellidos: 'Vargas', programa: programaAdmon.id },
  ];

  const estudiantes = [];
  for (const e of estudiantesData) {
    const usuario = await crearUsuario(e.email, 'ESTUDIANTE');
    const estudiante = await prisma.estudiante.create({
      data: {
        usuarioId: usuario.id,
        numeroDocumento: e.doc,
        nombres: e.nombres,
        apellidos: e.apellidos,
        programaId: e.programa,
        puntajeIcfes: 320 + Math.floor(Math.random() * 150),
        sisben: 'III',
      },
    });
    estudiantes.push(estudiante);
  }
  const [eBrochero, eMolina, ePerez, eGutierrez, eRojas, eVargas] = estudiantes;

  console.log('[seed] Creando grupos y carga academica (sin choques)...');
  const grupoProg1 = await prisma.grupo.create({ data: { codigo: 'G1', materiaId: materiaProg1.id, programaId: programaISW.id, periodoId: periodo.id, cupo: 10 } });
  const grupoBD = await prisma.grupo.create({ data: { codigo: 'G1', materiaId: materiaBD.id, programaId: programaISW.id, periodoId: periodo.id, cupo: 10 } });
  const grupoCalculo = await prisma.grupo.create({ data: { codigo: 'G1', materiaId: materiaCalculo.id, programaId: programaISW.id, periodoId: periodo.id, cupo: 10 } });
  const grupoISWII = await prisma.grupo.create({ data: { codigo: 'G1', materiaId: materiaISWII.id, programaId: programaISW.id, periodoId: periodo.id, cupo: 10 } });
  const grupoContabilidad = await prisma.grupo.create({ data: { codigo: 'G1', materiaId: materiaContabilidad.id, programaId: programaAdmon.id, periodoId: periodo.id, cupo: 10 } });

  const cargaProg1 = await prisma.cargaAcademica.create({
    data: { grupoId: grupoProg1.id, docenteId: docente1.id, aulaId: aulaA101.id, periodoId: periodo.id, dia: 'LUNES', horaInicio: t('08:00'), horaFin: t('10:00'), creadoPor: coordinadorISW.id },
  });
  await prisma.cargaAcademica.create({
    data: { grupoId: grupoCalculo.id, docenteId: docente1.id, aulaId: aulaA101.id, periodoId: periodo.id, dia: 'LUNES', horaInicio: t('10:00'), horaFin: t('12:00'), creadoPor: coordinadorISW.id },
  });
  await prisma.cargaAcademica.create({
    data: { grupoId: grupoBD.id, docenteId: docente2.id, aulaId: aulaA102.id, periodoId: periodo.id, dia: 'MARTES', horaInicio: t('08:00'), horaFin: t('10:00'), creadoPor: coordinadorISW.id },
  });
  await prisma.cargaAcademica.create({
    data: { grupoId: grupoISWII.id, docenteId: docente3.id, aulaId: aulaB201.id, periodoId: periodo.id, dia: 'MIERCOLES', horaInicio: t('08:00'), horaFin: t('10:00'), creadoPor: coordinadorISW.id },
  });
  await prisma.cargaAcademica.create({
    data: { grupoId: grupoContabilidad.id, docenteId: docente3.id, aulaId: aulaA102.id, periodoId: periodo.id, dia: 'LUNES', horaInicio: t('08:00'), horaFin: t('10:00'), creadoPor: coordinadorAdm.id },
  });

  console.log('[seed] Inscribiendo horarios de estudiantes...');
  for (const est of [eBrochero, eMolina, ePerez, eGutierrez]) {
    await prisma.horarioEstudiante.create({ data: { codigo: `HE-${est.numeroDocumento}-G1`, estudianteId: est.id, cargaId: cargaProg1.id } });
  }
  for (const est of [eRojas, eVargas]) {
    const cargaContabilidad = await prisma.cargaAcademica.findFirstOrThrow({ where: { grupoId: grupoContabilidad.id } });
    await prisma.horarioEstudiante.create({ data: { codigo: `HE-${est.numeroDocumento}-CONT`, estudianteId: est.id, cargaId: cargaContabilidad.id } });
  }

  console.log('[seed] Configurando el sensor de asistencia y una sesion de ejemplo...');
  const sensorA101 = await prisma.sensorAsistencia.create({ data: { codigo: 'SNS-A101', aulaId: aulaA101.id, estado: 'ACTIVO', online: true, ultimoHeartbeat: new Date() } });

  const sesion1 = await prisma.asistencia.create({
    data: {
      codigo: 'AS-0001',
      cargaId: cargaProg1.id,
      tema: 'Introduccion a la programacion y variables',
      fecha: new Date('2026-02-09'),
      hora: t('08:00'),
      creadoPor: docente1.id,
      estado: 'CERRADA',
      cerradaEn: new Date('2026-02-09T10:05:00Z'),
    },
  });
  await prisma.detalleAsistencia.createMany({
    data: [
      { asistenciaId: sesion1.id, estudianteId: eBrochero.id, estado: 'PRESENTE', origen: 'SENSOR' },
      { asistenciaId: sesion1.id, estudianteId: eMolina.id, estado: 'PRESENTE', origen: 'SENSOR' },
      { asistenciaId: sesion1.id, estudianteId: ePerez.id, estado: 'TARDANZA', origen: 'MANUAL' },
      { asistenciaId: sesion1.id, estudianteId: eGutierrez.id, estado: 'AUSENTE', origen: 'MANUAL' },
    ],
  });
  await prisma.sensorLectura.createMany({
    data: [
      { sensorId: sensorA101.id, asistenciaId: sesion1.id, numeroDocumento: eBrochero.numeroDocumento, estado: 'PROCESADA', resultado: 'REGISTRADO', recibidaEn: new Date(), sincronizadaEn: new Date() },
      { sensorId: sensorA101.id, asistenciaId: sesion1.id, numeroDocumento: eMolina.numeroDocumento, estado: 'PROCESADA', resultado: 'REGISTRADO', recibidaEn: new Date(), sincronizadaEn: new Date() },
    ],
  });

  console.log('[seed] Creando microcurriculo, competencias y plan de seguimiento...');
  const microISWII = await prisma.microcurriculo.create({
    data: {
      codigo: 'MC-ISW-402',
      materiaId: materiaISWII.id,
      programaId: programaISW.id,
      numeroCreditos: 3,
      nivelSuperior: 'Disena, documenta y verifica arquitecturas de software completas de forma autonoma.',
      nivelNormal: 'Aplica el proceso de ingenieria de software con apoyo puntual del docente.',
      nivelBajo: 'Reconoce las fases del proceso pero requiere guia constante para aplicarlas.',
      nivelDeficiente: 'No identifica las fases basicas del ciclo de vida del software.',
      departamentoOferente: 'Ingenieria de Sistemas',
      tipoAsignatura: 'Teorico-practica',
      naturalezaAsignatura: 'Obligatoria',
      descripcionAsignatura: 'Desarrollo integral de un proyecto de software aplicando analisis, diseno, arquitectura, pruebas y documentacion.',
      objetivoGeneral: 'Formar al estudiante en el desarrollo de software profesional de principio a fin.',
      objetivosEspecificos: 'Analizar requerimientos; disenar arquitectura; implementar modulos; verificar calidad; documentar el proyecto.',
      competenciasGenericas: 'Trabajo en equipo, comunicacion tecnica, pensamiento critico, gestion del tiempo.',
      estrategiasPedagogicasMetodologicas: 'Aprendizaje basado en proyectos, revisiones de codigo entre pares, sprints quincenales.',
      referenciasBibliograficas: 'Sommerville, I. Ingenieria de Software. Pressman, R. Ingenieria del Software: un enfoque practico.',
      primerParcial: 'Analisis de requerimientos y arquitectura propuesta.',
      segundoParcial: 'Avance funcional del sistema con pruebas unitarias.',
      tercerParcial: 'Entrega final, documentacion y sustentacion.',
    },
  });

  const contenido1 = await prisma.contenidoCompetenciaEspecifica.create({
    data: {
      codigo: 'CT-ISW402-01',
      microcurriculoId: microISWII.id,
      unidadTematica: 'Analisis de requerimientos',
      competenciasEspecificas: 'Elicita y documenta requerimientos funcionales y no funcionales.',
      resultadosAprendizaje: 'El estudiante redacta historias de usuario con criterios de aceptacion claros.',
      nivelSuperior: 'Elicita requerimientos completos y priorizados sin apoyo.',
      nivelNormal: 'Elicita requerimientos con apoyo ocasional.',
      nivelBajo: 'Requiere guia constante para documentar requerimientos.',
      nivelDeficiente: 'No logra documentar requerimientos basicos.',
      orden: 1,
    },
  });
  const contenido2 = await prisma.contenidoCompetenciaEspecifica.create({
    data: {
      codigo: 'CT-ISW402-02',
      microcurriculoId: microISWII.id,
      unidadTematica: 'Arquitectura y diseno de software',
      competenciasEspecificas: 'Propone una arquitectura modular y justifica las decisiones tecnicas.',
      resultadosAprendizaje: 'El estudiante documenta un diagrama de componentes coherente con los requerimientos.',
      nivelSuperior: 'Disena arquitecturas escalables y bien documentadas.',
      nivelNormal: 'Disena arquitecturas funcionales con observaciones menores.',
      nivelBajo: 'Propone arquitecturas incompletas o poco justificadas.',
      nivelDeficiente: 'No logra proponer una arquitectura coherente.',
      orden: 2,
    },
  });

  const plan = await prisma.planMicrocurriculo.create({
    data: {
      codigo: 'PLAN-ISW402-2026-1',
      microcurriculoId: microISWII.id,
      docenteId: docente3.id,
      materiaId: materiaISWII.id,
      programaId: programaISW.id,
      periodoId: periodo.id,
      anioLectivo: 2026,
      fechaInicio: new Date('2026-02-02'),
      fechaTerminacion: new Date('2026-06-20'),
      totalHoras: 48,
      estado: 'ACTIVO',
    },
  });
  await prisma.detallePlanMicrocurriculo.create({
    data: { planId: plan.id, contenidoId: contenido1.id, avance: 'DESARROLLADO', porcentajeAvance: 100, actualizadoPor: docente3.id },
  });
  await prisma.detallePlanMicrocurriculo.create({
    data: { planId: plan.id, contenidoId: contenido2.id, avance: 'EN_CURSO', porcentajeAvance: 40, actualizadoPor: docente3.id },
  });

  console.log('[seed] Configurando evaluaciones y calificaciones de ejemplo...');
  const configuracion = await prisma.configuracionEvaluacion.create({ data: { grupoId: grupoProg1.id, periodoId: periodo.id } });
  const parcial1 = await prisma.evaluacion.create({ data: { configuracionId: configuracion.id, nombre: 'Parcial 1', porcentaje: 30, orden: 1 } });
  await prisma.evaluacion.create({ data: { configuracionId: configuracion.id, nombre: 'Parcial 2', porcentaje: 30, orden: 2 } });
  await prisma.evaluacion.create({ data: { configuracionId: configuracion.id, nombre: 'Proyecto final', porcentaje: 40, orden: 3 } });

  for (const [est, nota] of [[eBrochero, 4.5], [eMolina, 4.0], [ePerez, 3.2], [eGutierrez, 2.8]] as const) {
    const calificacion = await prisma.calificacion.create({
      data: { evaluacionId: parcial1.id, estudianteId: est.id, valor: nota, actualizadoPor: usuarioDoc1.id },
    });
    await prisma.historialCalificacion.create({
      data: { calificacionId: calificacion.id, valorAnterior: null, valorNuevo: nota, usuarioId: usuarioDoc1.id },
    });
  }

  console.log('[seed] Parametros generales...');
  await prisma.parametroSistema.createMany({
    data: [
      { clave: 'nombre_institucion', valor: 'Universidad Demostrativa de Ingenieria', descripcion: 'Nombre institucional mostrado en reportes' },
      { clave: 'anio_lectivo_actual', valor: '2026', descripcion: 'Anio lectivo activo por defecto' },
    ],
  });

  console.log('\n[seed] Completado. Credenciales de demostracion (misma contrasena para todas):');
  console.log(`  Contrasena: ${PASSWORD_DEMO}`);
  console.log('  Administrador : admin@universidad.edu.co');
  console.log('  Coordinador 1 : coordinador.isw@universidad.edu.co (programa Ingenieria de Software)');
  console.log('  Coordinador 2 : coordinador.adm@universidad.edu.co (programa Administracion de Empresas)');
  console.log('  Docente 1     : docente.rendon@universidad.edu.co');
  console.log('  Docente 2     : docente.lafont@universidad.edu.co');
  console.log('  Docente 3     : docente.salas@universidad.edu.co');
  console.log('  Estudiante 1  : est.brochero@universidad.edu.co');
  console.log('  Estudiante 2  : est.molina@universidad.edu.co');
  console.log('  (ver README.md para la lista completa)');

  void administrador;
}

main()
  .catch((error) => {
    console.error('[seed] Error:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
