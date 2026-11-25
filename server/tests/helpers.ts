import bcrypt from 'bcryptjs';
import { prisma } from '../src/shared/prisma.js';

const PASSWORD_PRUEBA = 'Prueba1234!';

/** Mismo orden de dependencias que prisma/seed.ts y scripts/_check.ts. */
export async function limpiarBaseDeDatos(): Promise<void> {
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
}

export async function crearUsuarioConPassword(email: string, rol: 'ADMINISTRADOR' | 'COORDINADOR' | 'DOCENTE' | 'ESTUDIANTE') {
  const passwordHash = await bcrypt.hash(PASSWORD_PRUEBA, 4); // rondas bajas: las pruebas no necesitan el costo de produccion
  return prisma.usuario.create({ data: { email, passwordHash, rol } });
}

export { PASSWORD_PRUEBA };

/** Crea un escenario academico minimo y coherente, reutilizado por varias pruebas. */
export async function crearFixturesBase() {
  const sede = await prisma.sede.create({ data: { codigo: 'T-SDE', nombre: 'Sede de pruebas' } });
  const facultad = await prisma.facultad.create({ data: { codigo: 'T-FAC', nombre: 'Facultad de pruebas' } });
  const programa = await prisma.programa.create({
    data: { codigo: 'T-PROG', nombre: 'Programa de pruebas', numeroCreditos: 160, facultadId: facultad.id },
  });
  const periodo = await prisma.periodoAcademico.create({
    data: { codigo: 'T-2026-1', nombre: 'Periodo de pruebas', anio: 2026, fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2026-06-01'), estado: 'ACTIVO' },
  });
  const materia = await prisma.materia.create({ data: { codigo: 'T-MAT', nombre: 'Materia de pruebas', numeroCreditos: 3 } });
  const materia2 = await prisma.materia.create({ data: { codigo: 'T-MAT2', nombre: 'Materia de pruebas 2', numeroCreditos: 3 } });
  const aula = await prisma.aula.create({ data: { codigo: 'T-A1', nombre: 'Aula de pruebas 1', sedeId: sede.id } });
  const aula2 = await prisma.aula.create({ data: { codigo: 'T-A2', nombre: 'Aula de pruebas 2', sedeId: sede.id } });

  const usuarioAdmin = await crearUsuarioConPassword('admin.test@universidad.edu.co', 'ADMINISTRADOR');
  const administrador = await prisma.administrador.create({
    data: { usuarioId: usuarioAdmin.id, numeroDocumento: 'T-ADMIN-1', nombres: 'Admin', apellidos: 'Prueba' },
  });

  const usuarioDocente1 = await crearUsuarioConPassword('docente1.test@universidad.edu.co', 'DOCENTE');
  const docente1 = await prisma.docente.create({
    data: { usuarioId: usuarioDocente1.id, numeroDocumento: 'T-DOC-1', nombres: 'Docente', apellidos: 'Uno' },
  });

  const usuarioDocente2 = await crearUsuarioConPassword('docente2.test@universidad.edu.co', 'DOCENTE');
  const docente2 = await prisma.docente.create({
    data: { usuarioId: usuarioDocente2.id, numeroDocumento: 'T-DOC-2', nombres: 'Docente', apellidos: 'Dos' },
  });

  const usuarioEstudiante1 = await crearUsuarioConPassword('estudiante1.test@universidad.edu.co', 'ESTUDIANTE');
  const estudiante1 = await prisma.estudiante.create({
    data: { usuarioId: usuarioEstudiante1.id, numeroDocumento: 'T-EST-1', nombres: 'Estudiante', apellidos: 'Uno', programaId: programa.id },
  });

  const usuarioEstudiante2 = await crearUsuarioConPassword('estudiante2.test@universidad.edu.co', 'ESTUDIANTE');
  const estudiante2 = await prisma.estudiante.create({
    data: { usuarioId: usuarioEstudiante2.id, numeroDocumento: 'T-EST-2', nombres: 'Estudiante', apellidos: 'Dos', programaId: programa.id },
  });

  const grupo1 = await prisma.grupo.create({
    data: { codigo: 'T-G1', materiaId: materia.id, programaId: programa.id, periodoId: periodo.id, cupo: 2 },
  });
  const grupo2 = await prisma.grupo.create({
    data: { codigo: 'T-G2', materiaId: materia2.id, programaId: programa.id, periodoId: periodo.id, cupo: 2 },
  });

  return {
    sede, facultad, programa, periodo, materia, materia2, aula, aula2,
    administrador, docente1, docente2, estudiante1, estudiante2, grupo1, grupo2,
  };
}
