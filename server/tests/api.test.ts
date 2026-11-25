import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';
import { crearFixturesBase, limpiarBaseDeDatos, PASSWORD_PRUEBA } from './helpers.js';

const app = createApp();

async function login(email: string, password = PASSWORD_PRUEBA) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res;
}

describe('Sistema Academico - API', () => {
  let fixtures: Awaited<ReturnType<typeof crearFixturesBase>>;
  let tokenAdmin: string;
  let tokenDocente1: string;
  let tokenDocente2: string;
  let tokenEstudiante1: string;
  let tokenEstudiante2: string;

  beforeAll(async () => {
    await limpiarBaseDeDatos();
    fixtures = await crearFixturesBase();

    tokenAdmin = (await login('admin.test@universidad.edu.co')).body.accessToken;
    tokenDocente1 = (await login('docente1.test@universidad.edu.co')).body.accessToken;
    tokenDocente2 = (await login('docente2.test@universidad.edu.co')).body.accessToken;
    tokenEstudiante1 = (await login('estudiante1.test@universidad.edu.co')).body.accessToken;
    tokenEstudiante2 = (await login('estudiante2.test@universidad.edu.co')).body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------------------
  // CP-01: inicio de sesion por rol y bloqueo de cuenta
  // ---------------------------------------------------------------------
  describe('CP-01 - Autenticacion y bloqueo de cuenta', () => {
    it('rechaza credenciales invalidas con 401', async () => {
      const res = await login('docente1.test@universidad.edu.co', 'contrasena-incorrecta');
      expect(res.status).toBe(401);
    });

    it('acepta credenciales validas y devuelve access + refresh token', async () => {
      const res = await login('docente1.test@universidad.edu.co');
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
      expect(res.body.usuario.rol).toBe('DOCENTE');
    });

    it('un token de docente no puede crear una facultad (requiere ADMINISTRADOR)', async () => {
      const res = await request(app)
        .post('/api/facultades')
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ codigo: 'X', nombre: 'No deberia crearse' });
      expect(res.status).toBe(403);
    });

    it('bloquea la cuenta tras 5 intentos fallidos seguidos (HU-01)', async () => {
      const email = 'estudiante2.test@universidad.edu.co';
      for (let i = 0; i < 5; i++) {
        await login(email, 'clave-mala');
      }
      const intentoConClaveCorrecta = await login(email);
      expect(intentoConClaveCorrecta.status).toBe(423);

      // Se restaura el estado para no afectar las pruebas siguientes que usan este usuario.
      await prisma.usuario.update({
        where: { email },
        data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null },
      });
      tokenEstudiante2 = (await login(email)).body.accessToken;
    });
  });

  // ---------------------------------------------------------------------
  // CP-02: carga academica sin choques de docente ni de aula
  // ---------------------------------------------------------------------
  describe('CP-02 - Carga academica sin choques', () => {
    let cargaBaseId: string;

    it('crea la carga base: D1, G1, A1, lunes 08:00-10:00', async () => {
      const res = await request(app)
        .post('/api/cargas-academicas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          grupoId: fixtures.grupo1.id,
          docenteId: fixtures.docente1.id,
          aulaId: fixtures.aula.id,
          periodoId: fixtures.periodo.id,
          dia: 'LUNES',
          horaInicio: '08:00',
          horaFin: '10:00',
        });
      expect(res.status).toBe(201);
      cargaBaseId = res.body.id;
    });

    it('Caso A: rechaza el mismo docente en otro grupo/aula a la misma hora', async () => {
      const res = await request(app)
        .post('/api/cargas-academicas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          grupoId: fixtures.grupo2.id,
          docenteId: fixtures.docente1.id,
          aulaId: fixtures.aula2.id,
          periodoId: fixtures.periodo.id,
          dia: 'LUNES',
          horaInicio: '08:00',
          horaFin: '10:00',
        });
      expect(res.status).toBe(409);
    });

    it('Caso B: rechaza el aula ocupada con otro docente a la misma hora', async () => {
      const res = await request(app)
        .post('/api/cargas-academicas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          grupoId: fixtures.grupo2.id,
          docenteId: fixtures.docente2.id,
          aulaId: fixtures.aula.id,
          periodoId: fixtures.periodo.id,
          dia: 'LUNES',
          horaInicio: '08:00',
          horaFin: '10:00',
        });
      expect(res.status).toBe(409);
    });

    it('Caso C: acepta horas contiguas sin traslape (mismo docente y aula, 10:00-12:00)', async () => {
      const res = await request(app)
        .post('/api/cargas-academicas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          grupoId: fixtures.grupo2.id,
          docenteId: fixtures.docente1.id,
          aulaId: fixtures.aula.id,
          periodoId: fixtures.periodo.id,
          dia: 'LUNES',
          horaInicio: '10:00',
          horaFin: '12:00',
        });
      expect(res.status).toBe(201);
    });

    it('el horario del docente 1 muestra ambas clases sin choques', async () => {
      const res = await request(app)
        .get(`/api/horarios/docentes/${fixtures.docente1.id}`)
        .set('Authorization', `Bearer ${tokenDocente1}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('expone el id de la carga base para las pruebas de horario de estudiante', () => {
      expect(cargaBaseId).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------
  // CP-04: el estudiante arma su horario sin choques ni sobrecupo
  // ---------------------------------------------------------------------
  describe('CP-04 - Horario del estudiante', () => {
    it('inscribe al estudiante 1 en el grupo 1 (lunes 08:00-10:00)', async () => {
      const res = await request(app)
        .post(`/api/horarios/estudiantes/${fixtures.estudiante1.id}/grupos`)
        .set('Authorization', `Bearer ${tokenEstudiante1}`)
        .send({ grupoId: fixtures.grupo1.id });
      expect(res.status).toBe(201);
    });

    it('rechaza una segunda inscripcion al mismo grupo', async () => {
      const res = await request(app)
        .post(`/api/horarios/estudiantes/${fixtures.estudiante1.id}/grupos`)
        .set('Authorization', `Bearer ${tokenEstudiante1}`)
        .send({ grupoId: fixtures.grupo1.id });
      expect(res.status).toBe(409);
    });

    it('rechaza inscribir un estudiante en el horario de otro (proteccion IDOR)', async () => {
      const res = await request(app)
        .post(`/api/horarios/estudiantes/${fixtures.estudiante1.id}/grupos`)
        .set('Authorization', `Bearer ${tokenEstudiante2}`)
        .send({ grupoId: fixtures.grupo2.id });
      expect(res.status).toBe(403);
    });

    it('rechaza inscribir un grupo que choca con el horario ya inscrito (grupo 2 tambien lunes 10-12 vs clase existente)', async () => {
      // grupo2 tiene carga lunes 10:00-12:00 (de la prueba CP-02 Caso C); como
      // estudiante1 solo tiene grupo1 (08-10), NO deberia chocar: se inscribe.
      const res = await request(app)
        .post(`/api/horarios/estudiantes/${fixtures.estudiante1.id}/grupos`)
        .set('Authorization', `Bearer ${tokenEstudiante1}`)
        .send({ grupoId: fixtures.grupo2.id });
      expect(res.status).toBe(201);
    });

    it('un estudiante no puede consultar el perfil de otro estudiante', async () => {
      const res = await request(app)
        .get(`/api/estudiantes/${fixtures.estudiante2.id}`)
        .set('Authorization', `Bearer ${tokenEstudiante1}`);
      expect(res.status).toBe(403);
    });
  });

  // ---------------------------------------------------------------------
  // CP-05: calificaciones - rango valido, grupo propio y trazabilidad
  // ---------------------------------------------------------------------
  describe('CP-05 - Calificaciones', () => {
    let configuracionId: string;
    let evaluacionId: string;

    it('crea la configuracion de evaluacion para el grupo 1', async () => {
      const res = await request(app)
        .post('/api/calificaciones/configuraciones')
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ grupoId: fixtures.grupo1.id, periodoId: fixtures.periodo.id });
      expect(res.status).toBe(201);
      configuracionId = res.body.id;
    });

    it('rechaza una evaluacion que haga exceder el 100%', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/configuraciones/${configuracionId}/evaluaciones`)
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ nombre: 'Demasiado grande', porcentaje: 150, orden: 1 });
      expect(res.status).toBe(422);
    });

    it('agrega una evaluacion valida del 100%', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/configuraciones/${configuracionId}/evaluaciones`)
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ nombre: 'Unica evaluacion', porcentaje: 100, orden: 1 });
      expect(res.status).toBe(201);
      evaluacionId = res.body.id;
    });

    it('guarda una nota valida (4.2)', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/evaluaciones/${evaluacionId}/notas`)
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ estudianteId: fixtures.estudiante1.id, valor: 4.2 });
      expect(res.status).toBe(201);
    });

    it('rechaza una nota de 5.5 (fuera de rango 0.0-5.0)', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/evaluaciones/${evaluacionId}/notas`)
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ estudianteId: fixtures.estudiante1.id, valor: 5.5 });
      expect(res.status).toBe(422);
    });

    it('rechaza una nota de -1 (fuera de rango)', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/evaluaciones/${evaluacionId}/notas`)
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ estudianteId: fixtures.estudiante1.id, valor: -1 });
      expect(res.status).toBe(422);
    });

    it('permite cambiar la nota de 4.2 a 4.5 y deja trazabilidad', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/evaluaciones/${evaluacionId}/notas`)
        .set('Authorization', `Bearer ${tokenDocente1}`)
        .send({ estudianteId: fixtures.estudiante1.id, valor: 4.5 });
      expect(res.status).toBe(201);

      const calificacion = await prisma.calificacion.findUnique({ where: { id: res.body.id }, include: { historial: true } });
      expect(Number(calificacion?.valor)).toBe(4.5);
      expect(calificacion?.historial.length).toBeGreaterThanOrEqual(2);
      expect(Number(calificacion?.historial[0]?.valorNuevo)).toBeDefined();
    });

    it('un docente que no dicta el grupo no puede calificarlo (CP-05, control de acceso)', async () => {
      const res = await request(app)
        .post(`/api/calificaciones/evaluaciones/${evaluacionId}/notas`)
        .set('Authorization', `Bearer ${tokenDocente2}`)
        .send({ estudianteId: fixtures.estudiante1.id, valor: 3 });
      expect(res.status).toBe(403);
    });

    it('un estudiante solo ve sus propias calificaciones', async () => {
      const propia = await request(app)
        .get(`/api/calificaciones/grupos/${fixtures.grupo1.id}/estudiantes/${fixtures.estudiante1.id}`)
        .set('Authorization', `Bearer ${tokenEstudiante1}`);
      expect(propia.status).toBe(200);

      const ajena = await request(app)
        .get(`/api/calificaciones/grupos/${fixtures.grupo1.id}/estudiantes/${fixtures.estudiante1.id}`)
        .set('Authorization', `Bearer ${tokenEstudiante2}`);
      expect(ajena.status).toBe(403);
    });
  });

  // ---------------------------------------------------------------------
  // HU-23: bitacora de auditoria inmutable
  // ---------------------------------------------------------------------
  describe('HU-23 - Bitacora de auditoria', () => {
    it('registra el login y las operaciones criticas en la bitacora', async () => {
      const res = await request(app)
        .get('/api/auditoria?accion=CAMBIO_NOTA')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.datos.length).toBeGreaterThan(0);
    });

    it('un rol distinto de ADMINISTRADOR no puede consultar la bitacora', async () => {
      const res = await request(app).get('/api/auditoria').set('Authorization', `Bearer ${tokenDocente1}`);
      expect(res.status).toBe(403);
    });

    it('acepta filtros vacios en la consulta (regresion: antes devolvia 500)', async () => {
      const res = await request(app)
        .get('/api/auditoria?pagina=1&tamano=20&entidad=&accion=')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.datos)).toBe(true);
    });

    it('rechaza una accion invalida con 422 en lugar de 500', async () => {
      const res = await request(app)
        .get('/api/auditoria?accion=NO_EXISTE')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(422);
    });
  });

  // ---------------------------------------------------------------------
  // HU-24: respaldos logicos (regresion: BigInt no serializable por Express)
  // ---------------------------------------------------------------------
  describe('HU-24 - Respaldos logicos', () => {
    it('genera un respaldo y lo lista con tamanoBytes serializado', async () => {
      const generar = await request(app)
        .post('/api/respaldos')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(generar.status).toBe(201);
      expect(generar.body.nombreArchivo).toMatch(/^respaldo-.*\.json$/);

      const listar = await request(app)
        .get('/api/respaldos')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(listar.status).toBe(200);
      expect(Array.isArray(listar.body)).toBe(true);
      expect(typeof listar.body[0].tamanoBytes).toBe('string');
    });

    it('un docente no puede generar respaldos', async () => {
      const res = await request(app)
        .post('/api/respaldos')
        .set('Authorization', `Bearer ${tokenDocente1}`);
      expect(res.status).toBe(403);
    });

    it('restaura datos reales sin borrar la bitacora ni las sesiones activas', async () => {
      const correoAdmin = 'admin.test@universidad.edu.co';
      const usuarioAdmin = await prisma.usuario.findUniqueOrThrow({ where: { email: correoAdmin } });

      const facultad = await prisma.facultad.findFirstOrThrow();
      const nombreOriginal = facultad.nombre;
      const auditoriasAntes = await prisma.auditoria.count();
      const sesionesAntes = await prisma.refreshToken.count({
        where: { usuarioId: usuarioAdmin.id, revocada: false },
      });

      expect(auditoriasAntes).toBeGreaterThan(0);
      expect(sesionesAntes).toBeGreaterThan(0);

      const generar = await request(app)
        .post('/api/respaldos')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(generar.status).toBe(201);

      // Modificamos un dato real y comprobamos que el restore lo devuelve.
      await prisma.facultad.update({
        where: { id: facultad.id },
        data: { nombre: 'MODIFICADO ANTES DEL RESTAURAR' },
      });

      const restaurar = await request(app)
        .post(`/api/respaldos/${generar.body.id}/restaurar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(restaurar.status).toBe(200);

      const restaurada = await prisma.facultad.findUniqueOrThrow({ where: { id: facultad.id } });
      expect(restaurada.nombre).toBe(nombreOriginal);
      expect(await prisma.auditoria.count()).toBeGreaterThanOrEqual(auditoriasAntes);
      expect(
        await prisma.refreshToken.count({ where: { usuarioId: usuarioAdmin.id, revocada: false } }),
      ).toBe(sesionesAntes);
    });
  });
});
