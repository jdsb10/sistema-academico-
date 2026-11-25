/**
 * Documentacion OpenAPI minima pero real: describe los modulos existentes y
 * el esquema de seguridad Bearer. Se amplia incrementalmente a medida que se
 * agregan endpoints; swagger-ui-express la sirve en /api-docs.
 */
export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Sistema Academico Universitario - API',
    version: '1.0.0',
    description:
      'API REST del Sistema Academico Universitario (Proyecto Final Ingenieria de Software II). ' +
      'Autenticacion JWT (access + refresh), control de acceso por rol (ADMINISTRADOR, COORDINADOR, DOCENTE, ESTUDIANTE).',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'auth', description: 'Autenticacion, sesiones y recuperacion de contrasena' },
    { name: 'facultades', description: 'Gestion de facultades' },
    { name: 'programas', description: 'Gestion de programas academicos' },
    { name: 'materias', description: 'Gestion de materias' },
    { name: 'aulas', description: 'Gestion de aulas y disponibilidad' },
    { name: 'personas', description: 'Administradores, coordinadores, docentes y estudiantes' },
    { name: 'cargas-academicas', description: 'Distribucion de materias, docentes y aulas por periodo' },
    { name: 'horarios', description: 'Horario de estudiantes y docentes' },
    { name: 'asistencias', description: 'Sesiones y registro de asistencia' },
    { name: 'sensores', description: 'Simulador del sensor de asistencia' },
    { name: 'microcurriculos', description: 'Contenido programatico, competencias y planes' },
    { name: 'calificaciones', description: 'Evaluaciones y notas' },
    { name: 'reportes', description: 'Reportes y estadisticas con exportacion' },
    { name: 'auditoria', description: 'Bitacora inmutable de acciones criticas' },
    { name: 'respaldos', description: 'Respaldo y restauracion de la base de datos' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Inicia sesion y devuelve access + refresh token',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: { '200': { description: 'Sesion iniciada' }, '401': { description: 'Credenciales invalidas' }, '423': { description: 'Cuenta bloqueada' } },
      },
    },
    '/facultades': {
      get: { tags: ['facultades'], summary: 'Lista facultades (paginado, busqueda)', responses: { '200': { description: 'OK' } } },
      post: { tags: ['facultades'], summary: 'Crea una facultad (solo ADMINISTRADOR)', responses: { '201': { description: 'Creada' } } },
    },
  },
} as const;
