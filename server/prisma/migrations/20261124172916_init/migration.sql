-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CC', 'TI', 'CE', 'PASAPORTE', 'NIT');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'VIUDO', 'DIVORCIADO', 'UNION_LIBRE');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO');

-- CreateEnum
CREATE TYPE "OrigenAsistencia" AS ENUM ('MANUAL', 'SENSOR', 'SESION');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "EstadoPeriodo" AS ENUM ('PLANEADO', 'ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoBasico" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoAula" AS ENUM ('DISPONIBLE', 'MANTENIMIENTO', 'INACTIVA');

-- CreateEnum
CREATE TYPE "EstadoCarga" AS ENUM ('ACTIVA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('ACTIVA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "EstadoPlan" AS ENUM ('BORRADOR', 'ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "AvancePlan" AS ENUM ('PENDIENTE', 'EN_CURSO', 'DESARROLLADO');

-- CreateEnum
CREATE TYPE "EstadoEvaluacion" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "EstadoSincronizacion" AS ENUM ('PENDIENTE', 'PROCESADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoEnvioCorreo" AS ENUM ('EN_COLA', 'ENVIADA', 'FALLIDA');

-- CreateEnum
CREATE TYPE "TipoAccion" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'LOGIN', 'LOGIN_FALLIDO', 'LOGOUT', 'BLOQUEO_CUENTA', 'CAMBIO_NOTA', 'CIERRE_NOTAS', 'CAMBIO_CARGA', 'CAMBIO_HORARIO', 'RESPALDO', 'RESTAURACION', 'EXPORTACION');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('CAMBIO_HORARIO', 'INASISTENCIA_REITERADA', 'NOTA_REGISTRADA', 'ASISTENCIA_REGISTRADA', 'PLAN_VENCIDO', 'CUENTA_BLOQUEADA', 'SISTEMA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(190) NOT NULL,
    "password_hash" VARCHAR(100) NOT NULL,
    "rol" "Rol" NOT NULL,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "intentos_fallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_hasta" TIMESTAMP(3),
    "ultimo_acceso" TIMESTAMP(3),
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocada" BOOLEAN NOT NULL DEFAULT false,
    "ip" VARCHAR(60),
    "dispositivo" VARCHAR(190),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_acceso" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(190) NOT NULL,
    "ip" VARCHAR(60) NOT NULL,
    "exitoso" BOOLEAN NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "email_usuario" VARCHAR(190),
    "rol" "Rol",
    "accion" "TipoAccion" NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "registro_id" VARCHAR(100),
    "valores_anteriores" JSONB,
    "valores_nuevos" JSONB,
    "descripcion" VARCHAR(500),
    "ip" VARCHAR(60),
    "user_agent" VARCHAR(300),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones_correo" (
    "id" TEXT NOT NULL,
    "clave_unica" VARCHAR(190) NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "asunto" VARCHAR(200) NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "estado" "EstadoEnvioCorreo" NOT NULL DEFAULT 'EN_COLA',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "error" VARCHAR(500),
    "enviado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_correo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(250),
    "ciudad" VARCHAR(100),
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facultades" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "numero_programas" INTEGER NOT NULL DEFAULT 0,
    "descripcion" VARCHAR(500),
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facultades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(180) NOT NULL,
    "numero_creditos" INTEGER NOT NULL DEFAULT 0,
    "facultad_id" TEXT NOT NULL,
    "descripcion" VARCHAR(1000),
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "anio" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "estado" "EstadoPeriodo" NOT NULL DEFAULT 'PLANEADO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL DEFAULT 'CC',
    "numero_documento" VARCHAR(30) NOT NULL,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(120) NOT NULL,
    "fecha_nacimiento" DATE,
    "sexo" "Sexo",
    "celular" VARCHAR(30),
    "direccion" VARCHAR(250),
    "ciudad" VARCHAR(100),
    "departamento" VARCHAR(100),
    "pais" VARCHAR(100) DEFAULT 'Colombia',
    "nivel" VARCHAR(30) NOT NULL DEFAULT 'ADMIN',
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinadores" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL DEFAULT 'CC',
    "numero_documento" VARCHAR(30) NOT NULL,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(120) NOT NULL,
    "fecha_nacimiento" DATE,
    "sexo" "Sexo",
    "celular" VARCHAR(30),
    "direccion" VARCHAR(250),
    "ciudad" VARCHAR(100),
    "departamento" VARCHAR(100),
    "pais" VARCHAR(100) DEFAULT 'Colombia',
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordinadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinadores_programas" (
    "id" TEXT NOT NULL,
    "coordinador_id" TEXT NOT NULL,
    "programa_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coordinadores_programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL DEFAULT 'CC',
    "numero_documento" VARCHAR(30) NOT NULL,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(120) NOT NULL,
    "fecha_nacimiento" DATE,
    "sexo" "Sexo",
    "celular" VARCHAR(30),
    "direccion" VARCHAR(250),
    "ciudad" VARCHAR(100),
    "departamento" VARCHAR(100),
    "pais" VARCHAR(100) DEFAULT 'Colombia',
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL DEFAULT 'CC',
    "numero_documento" VARCHAR(30) NOT NULL,
    "fecha_expedicion" DATE,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(120) NOT NULL,
    "fecha_nacimiento" DATE,
    "sexo" "Sexo",
    "celular" VARCHAR(30),
    "estado_civil" "EstadoCivil",
    "direccion" VARCHAR(250),
    "ciudad" VARCHAR(100),
    "departamento" VARCHAR(100),
    "pais" VARCHAR(100) DEFAULT 'Colombia',
    "puntaje_icfes" INTEGER,
    "nombre_acudiente" VARCHAR(120),
    "apellido_acudiente" VARCHAR(120),
    "celular_acudiente" VARCHAR(30),
    "sisben" VARCHAR(50),
    "programa_id" TEXT NOT NULL,
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(180) NOT NULL,
    "numero_creditos" INTEGER NOT NULL,
    "departamento_ofertante" VARCHAR(150),
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_programas" (
    "materia_id" TEXT NOT NULL,
    "programa_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_programas_pkey" PRIMARY KEY ("materia_id","programa_id")
);

-- CreateTable
CREATE TABLE "materias_docentes" (
    "id" TEXT NOT NULL,
    "materia_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "sede_id" TEXT,
    "capacidad" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoAula" NOT NULL DEFAULT 'DISPONIBLE',
    "descripcion" VARCHAR(300),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "materia_id" TEXT NOT NULL,
    "programa_id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "cupo" INTEGER NOT NULL DEFAULT 30,
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargas_academicas" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "aula_id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "dia" "DiaSemana" NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fin" TIME(0) NOT NULL,
    "estado" "EstadoCarga" NOT NULL DEFAULT 'ACTIVA',
    "creado_por" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargas_academicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_estudiantes" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "carga_id" TEXT NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'ACTIVA',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "horarios_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "carga_id" TEXT NOT NULL,
    "tema" VARCHAR(300) NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME(0) NOT NULL,
    "estado" "EstadoSesion" NOT NULL DEFAULT 'ABIERTA',
    "creado_por" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "cerrada_en" TIMESTAMP(3),

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_asistencia" (
    "id" TEXT NOT NULL,
    "asistencia_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "origen" "OrigenAsistencia" NOT NULL DEFAULT 'SESION',
    "hora_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justificacion" VARCHAR(500),
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalles_asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensores_asistencia" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "aula_id" TEXT NOT NULL,
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "online" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_heartbeat" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensores_asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_lecturas" (
    "id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "asistencia_id" TEXT,
    "numero_documento" VARCHAR(30) NOT NULL,
    "lectura_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recibida_en" TIMESTAMP(3),
    "estado" "EstadoSincronizacion" NOT NULL DEFAULT 'PENDIENTE',
    "resultado" VARCHAR(120),
    "mensaje" VARCHAR(500),
    "sincronizada_en" TIMESTAMP(3),

    CONSTRAINT "sensor_lecturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microcurriculos" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "materia_id" TEXT NOT NULL,
    "programa_id" TEXT NOT NULL,
    "numero_creditos" INTEGER NOT NULL,
    "nivel_superior" TEXT NOT NULL,
    "nivel_normal" TEXT NOT NULL,
    "nivel_bajo" TEXT NOT NULL,
    "nivel_deficiente" TEXT NOT NULL,
    "departamento_oferente" VARCHAR(150) NOT NULL,
    "tipo_asignatura" VARCHAR(80) NOT NULL,
    "naturaleza_asignatura" VARCHAR(80) NOT NULL,
    "descripcion_asignatura" TEXT NOT NULL,
    "objetivo_general" TEXT NOT NULL,
    "objetivos_especificos" TEXT NOT NULL,
    "competencias_genericas" TEXT NOT NULL,
    "estrategias_pedagogicas_metodologicas" TEXT NOT NULL,
    "referencias_bibliograficas" TEXT NOT NULL,
    "primer_parcial" TEXT NOT NULL,
    "segundo_parcial" TEXT NOT NULL,
    "tercer_parcial" TEXT NOT NULL,
    "estado" "EstadoBasico" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "microcurriculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microcurriculos_prerequisitos" (
    "microcurriculo_id" TEXT NOT NULL,
    "prerequisito_materia_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "microcurriculos_prerequisitos_pkey" PRIMARY KEY ("microcurriculo_id","prerequisito_materia_id")
);

-- CreateTable
CREATE TABLE "contenidos_competencias_especificas" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "microcurriculo_id" TEXT NOT NULL,
    "unidad_tematica" VARCHAR(200) NOT NULL,
    "competencias_especificas" TEXT NOT NULL,
    "resultados_aprendizaje" TEXT NOT NULL,
    "nivel_superior" TEXT NOT NULL,
    "nivel_normal" TEXT NOT NULL,
    "nivel_bajo" TEXT NOT NULL,
    "nivel_deficiente" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenidos_competencias_especificas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes_microcurriculares" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "microcurriculo_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "materia_id" TEXT NOT NULL,
    "programa_id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "anio_lectivo" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_terminacion" DATE NOT NULL,
    "total_horas" INTEGER NOT NULL,
    "estado" "EstadoPlan" NOT NULL DEFAULT 'BORRADOR',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_microcurriculares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_plan_microcurriculo" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "avance" "AvancePlan" NOT NULL DEFAULT 'PENDIENTE',
    "porcentaje_avance" INTEGER NOT NULL DEFAULT 0,
    "observaciones" VARCHAR(1000),
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" VARCHAR(190),

    CONSTRAINT "detalles_plan_microcurriculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_evaluacion" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "estado" "EstadoEvaluacion" NOT NULL DEFAULT 'ABIERTA',
    "cerrada_por" TEXT,
    "cerrada_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuraciones_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" TEXT NOT NULL,
    "configuracion_id" TEXT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" TEXT NOT NULL,
    "evaluacion_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "valor" DECIMAL(3,2) NOT NULL,
    "actualizado_por" VARCHAR(190) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_calificaciones" (
    "id" TEXT NOT NULL,
    "calificacion_id" TEXT NOT NULL,
    "valor_anterior" DECIMAL(3,2),
    "valor_nuevo" DECIMAL(3,2) NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respaldos" (
    "id" TEXT NOT NULL,
    "nombre_archivo" VARCHAR(250) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "tamano_bytes" BIGINT NOT NULL DEFAULT 0,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'COMPLETADO',
    "duracion_segundos" INTEGER NOT NULL DEFAULT 0,
    "error" VARCHAR(500),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respaldos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros_sistema" (
    "clave" VARCHAR(80) NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" VARCHAR(300),
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametros_sistema_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_hash_key" ON "password_resets"("token_hash");

-- CreateIndex
CREATE INDEX "password_resets_usuario_id_idx" ON "password_resets"("usuario_id");

-- CreateIndex
CREATE INDEX "intentos_acceso_email_creado_en_idx" ON "intentos_acceso"("email", "creado_en");

-- CreateIndex
CREATE INDEX "intentos_acceso_ip_creado_en_idx" ON "intentos_acceso"("ip", "creado_en");

-- CreateIndex
CREATE INDEX "auditorias_entidad_registro_id_idx" ON "auditorias"("entidad", "registro_id");

-- CreateIndex
CREATE INDEX "auditorias_usuario_id_creado_en_idx" ON "auditorias"("usuario_id", "creado_en");

-- CreateIndex
CREATE INDEX "auditorias_accion_creado_en_idx" ON "auditorias"("accion", "creado_en");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_id_leida_creado_en_idx" ON "notificaciones"("usuario_id", "leida", "creado_en");

-- CreateIndex
CREATE UNIQUE INDEX "notificaciones_correo_clave_unica_key" ON "notificaciones_correo"("clave_unica");

-- CreateIndex
CREATE INDEX "notificaciones_correo_estado_creado_en_idx" ON "notificaciones_correo"("estado", "creado_en");

-- CreateIndex
CREATE UNIQUE INDEX "sedes_codigo_key" ON "sedes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "facultades_codigo_key" ON "facultades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "programas_codigo_key" ON "programas"("codigo");

-- CreateIndex
CREATE INDEX "programas_facultad_id_idx" ON "programas"("facultad_id");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_academicos_codigo_key" ON "periodos_academicos"("codigo");

-- CreateIndex
CREATE INDEX "periodos_academicos_estado_idx" ON "periodos_academicos"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_usuario_id_key" ON "administradores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_numero_documento_key" ON "administradores"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "coordinadores_usuario_id_key" ON "coordinadores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "coordinadores_numero_documento_key" ON "coordinadores"("numero_documento");

-- CreateIndex
CREATE INDEX "coordinadores_programas_programa_id_fecha_fin_idx" ON "coordinadores_programas"("programa_id", "fecha_fin");

-- CreateIndex
CREATE UNIQUE INDEX "coordinadores_programas_coordinador_id_programa_id_key" ON "coordinadores_programas"("coordinador_id", "programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_usuario_id_key" ON "docentes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_numero_documento_key" ON "docentes"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_usuario_id_key" ON "estudiantes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_numero_documento_key" ON "estudiantes"("numero_documento");

-- CreateIndex
CREATE INDEX "estudiantes_programa_id_idx" ON "estudiantes"("programa_id");

-- CreateIndex
CREATE INDEX "estudiantes_nombres_apellidos_idx" ON "estudiantes"("nombres", "apellidos");

-- CreateIndex
CREATE UNIQUE INDEX "materias_codigo_key" ON "materias"("codigo");

-- CreateIndex
CREATE INDEX "materias_docentes_docente_id_idx" ON "materias_docentes"("docente_id");

-- CreateIndex
CREATE UNIQUE INDEX "materias_docentes_materia_id_docente_id_key" ON "materias_docentes"("materia_id", "docente_id");

-- CreateIndex
CREATE UNIQUE INDEX "aulas_codigo_key" ON "aulas"("codigo");

-- CreateIndex
CREATE INDEX "aulas_sede_id_idx" ON "aulas"("sede_id");

-- CreateIndex
CREATE INDEX "grupos_programa_id_periodo_id_idx" ON "grupos"("programa_id", "periodo_id");

-- CreateIndex
CREATE INDEX "grupos_materia_id_idx" ON "grupos"("materia_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_codigo_materia_id_periodo_id_key" ON "grupos"("codigo", "materia_id", "periodo_id");

-- CreateIndex
CREATE INDEX "cargas_academicas_docente_id_dia_idx" ON "cargas_academicas"("docente_id", "dia");

-- CreateIndex
CREATE INDEX "cargas_academicas_aula_id_dia_idx" ON "cargas_academicas"("aula_id", "dia");

-- CreateIndex
CREATE INDEX "cargas_academicas_periodo_id_dia_idx" ON "cargas_academicas"("periodo_id", "dia");

-- CreateIndex
CREATE INDEX "cargas_academicas_grupo_id_idx" ON "cargas_academicas"("grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_estudiantes_codigo_key" ON "horarios_estudiantes"("codigo");

-- CreateIndex
CREATE INDEX "horarios_estudiantes_carga_id_idx" ON "horarios_estudiantes"("carga_id");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_estudiantes_estudiante_id_carga_id_key" ON "horarios_estudiantes"("estudiante_id", "carga_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_codigo_key" ON "asistencias"("codigo");

-- CreateIndex
CREATE INDEX "asistencias_fecha_idx" ON "asistencias"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_carga_id_fecha_hora_key" ON "asistencias"("carga_id", "fecha", "hora");

-- CreateIndex
CREATE INDEX "detalles_asistencia_estudiante_id_idx" ON "detalles_asistencia"("estudiante_id");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_asistencia_asistencia_id_estudiante_id_key" ON "detalles_asistencia"("asistencia_id", "estudiante_id");

-- CreateIndex
CREATE UNIQUE INDEX "sensores_asistencia_codigo_key" ON "sensores_asistencia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sensores_asistencia_aula_id_key" ON "sensores_asistencia"("aula_id");

-- CreateIndex
CREATE INDEX "sensor_lecturas_estado_lectura_en_idx" ON "sensor_lecturas"("estado", "lectura_en");

-- CreateIndex
CREATE INDEX "sensor_lecturas_sensor_id_lectura_en_idx" ON "sensor_lecturas"("sensor_id", "lectura_en");

-- CreateIndex
CREATE UNIQUE INDEX "microcurriculos_codigo_key" ON "microcurriculos"("codigo");

-- CreateIndex
CREATE INDEX "microcurriculos_programa_id_idx" ON "microcurriculos"("programa_id");

-- CreateIndex
CREATE INDEX "microcurriculos_materia_id_idx" ON "microcurriculos"("materia_id");

-- CreateIndex
CREATE UNIQUE INDEX "contenidos_competencias_especificas_codigo_key" ON "contenidos_competencias_especificas"("codigo");

-- CreateIndex
CREATE INDEX "contenidos_competencias_especificas_microcurriculo_id_idx" ON "contenidos_competencias_especificas"("microcurriculo_id");

-- CreateIndex
CREATE UNIQUE INDEX "planes_microcurriculares_codigo_key" ON "planes_microcurriculares"("codigo");

-- CreateIndex
CREATE INDEX "planes_microcurriculares_docente_id_periodo_id_idx" ON "planes_microcurriculares"("docente_id", "periodo_id");

-- CreateIndex
CREATE INDEX "planes_microcurriculares_programa_id_idx" ON "planes_microcurriculares"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "planes_microcurriculares_microcurriculo_id_docente_id_perio_key" ON "planes_microcurriculares"("microcurriculo_id", "docente_id", "periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_plan_microcurriculo_plan_id_contenido_id_key" ON "detalles_plan_microcurriculo"("plan_id", "contenido_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_evaluacion_grupo_id_periodo_id_key" ON "configuraciones_evaluacion"("grupo_id", "periodo_id");

-- CreateIndex
CREATE INDEX "evaluaciones_configuracion_id_idx" ON "evaluaciones"("configuracion_id");

-- CreateIndex
CREATE INDEX "calificaciones_estudiante_id_idx" ON "calificaciones"("estudiante_id");

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_evaluacion_id_estudiante_id_key" ON "calificaciones"("evaluacion_id", "estudiante_id");

-- CreateIndex
CREATE INDEX "historial_calificaciones_calificacion_id_fecha_idx" ON "historial_calificaciones"("calificacion_id", "fecha");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones_correo" ADD CONSTRAINT "notificaciones_correo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas" ADD CONSTRAINT "programas_facultad_id_fkey" FOREIGN KEY ("facultad_id") REFERENCES "facultades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinadores" ADD CONSTRAINT "coordinadores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinadores_programas" ADD CONSTRAINT "coordinadores_programas_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "coordinadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinadores_programas" ADD CONSTRAINT "coordinadores_programas_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_programas" ADD CONSTRAINT "materias_programas_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_programas" ADD CONSTRAINT "materias_programas_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_docentes" ADD CONSTRAINT "materias_docentes_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_docentes" ADD CONSTRAINT "materias_docentes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas" ADD CONSTRAINT "aulas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargas_academicas" ADD CONSTRAINT "cargas_academicas_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargas_academicas" ADD CONSTRAINT "cargas_academicas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargas_academicas" ADD CONSTRAINT "cargas_academicas_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargas_academicas" ADD CONSTRAINT "cargas_academicas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargas_academicas" ADD CONSTRAINT "cargas_academicas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "coordinadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_estudiantes" ADD CONSTRAINT "horarios_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_estudiantes" ADD CONSTRAINT "horarios_estudiantes_carga_id_fkey" FOREIGN KEY ("carga_id") REFERENCES "cargas_academicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_carga_id_fkey" FOREIGN KEY ("carga_id") REFERENCES "cargas_academicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_asistencia" ADD CONSTRAINT "detalles_asistencia_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_asistencia" ADD CONSTRAINT "detalles_asistencia_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensores_asistencia" ADD CONSTRAINT "sensores_asistencia_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_lecturas" ADD CONSTRAINT "sensor_lecturas_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensores_asistencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_lecturas" ADD CONSTRAINT "sensor_lecturas_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcurriculos" ADD CONSTRAINT "microcurriculos_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcurriculos" ADD CONSTRAINT "microcurriculos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcurriculos_prerequisitos" ADD CONSTRAINT "microcurriculos_prerequisitos_microcurriculo_id_fkey" FOREIGN KEY ("microcurriculo_id") REFERENCES "microcurriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcurriculos_prerequisitos" ADD CONSTRAINT "microcurriculos_prerequisitos_prerequisito_materia_id_fkey" FOREIGN KEY ("prerequisito_materia_id") REFERENCES "microcurriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenidos_competencias_especificas" ADD CONSTRAINT "contenidos_competencias_especificas_microcurriculo_id_fkey" FOREIGN KEY ("microcurriculo_id") REFERENCES "microcurriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_microcurriculares" ADD CONSTRAINT "planes_microcurriculares_microcurriculo_id_fkey" FOREIGN KEY ("microcurriculo_id") REFERENCES "microcurriculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_microcurriculares" ADD CONSTRAINT "planes_microcurriculares_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_microcurriculares" ADD CONSTRAINT "planes_microcurriculares_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_microcurriculares" ADD CONSTRAINT "planes_microcurriculares_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_microcurriculares" ADD CONSTRAINT "planes_microcurriculares_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_plan_microcurriculo" ADD CONSTRAINT "detalles_plan_microcurriculo_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_microcurriculares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_plan_microcurriculo" ADD CONSTRAINT "detalles_plan_microcurriculo_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos_competencias_especificas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones_evaluacion" ADD CONSTRAINT "configuraciones_evaluacion_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones_evaluacion" ADD CONSTRAINT "configuraciones_evaluacion_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_configuracion_id_fkey" FOREIGN KEY ("configuracion_id") REFERENCES "configuraciones_evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_evaluacion_id_fkey" FOREIGN KEY ("evaluacion_id") REFERENCES "evaluaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_calificaciones" ADD CONSTRAINT "historial_calificaciones_calificacion_id_fkey" FOREIGN KEY ("calificacion_id") REFERENCES "calificaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_calificaciones" ADD CONSTRAINT "historial_calificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
