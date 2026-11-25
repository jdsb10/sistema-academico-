-- ============================================================================
-- Migracion: integridad referencial avanzada y reglas de negocio
-- Sistema Academico Universitario - Ingenieria de Software II
--
-- Contenido:
--   1. Extension btree_gist (restricciones de exclusión sobre rangos)
--   2. Restricciones CHECK de validacion de datos
--   3. EXCLUDE: choques de docente, aula y grupo en día/hora (HU-09, CP-02, R-04)
--   4. Unicidad parcial: un coordinador vigente por programa (HU-05)
--   5. Trigger: NumeroProgramas de la facultad se mantiene solo (HU-02)
--   6. Trigger: la bitácora de auditoría es de solo lectura (HU-23)
--   7. Vista horario_docente (clase HorarioDocente del enunciado)
--   8. Indices de rendimiento para horarios y asistencia (R-03, A-04)
-- ============================================================================

-- 1. Extension ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Funciones auxiliares inmutables.
-- Motivo: en PostgreSQL `extract()` y la conversion enum->text se resuelven a
-- sobrecargas marcadas STABLE, y una restriccion de exclusión exige expresiones
-- IMMUTABLE. Estas envolturas son deterministicas para un mismo valor de entrada
-- y permiten crear los indices de exclusión.
CREATE OR REPLACE FUNCTION rango_minutos(desde time, hasta time)
RETURNS numrange
LANGUAGE sql IMMUTABLE STRICT AS
$$
  SELECT numrange(
    (EXTRACT(hour FROM desde) * 60 + EXTRACT(minute FROM desde))::numeric,
    (EXTRACT(hour FROM hasta) * 60 + EXTRACT(minute FROM hasta))::numeric
  );
$$;

CREATE OR REPLACE FUNCTION dia_codigo(d "DiaSemana")
RETURNS text
LANGUAGE sql IMMUTABLE STRICT AS
$$
  SELECT d::text;
$$;

COMMENT ON FUNCTION rango_minutos(time, time) IS
  'Convierte un rango horario a minutos para las restricciones de exclusión';
COMMENT ON FUNCTION dia_codigo("DiaSemana") IS
  'Representación estable del día para índices de exclusión';

-- 2. Restricciones CHECK ------------------------------------------------------

-- CP-05: las notas se manejan en la escala 0.0 a 5.0
ALTER TABLE calificaciones
  ADD CONSTRAINT calificaciones_valor_en_escala
  CHECK (valor >= 0 AND valor <= 5);

-- Los porcentajes de evaluacion son valores entre 0 y 100
ALTER TABLE evaluaciones
  ADD CONSTRAINT evaluaciones_porcentaje_valido
  CHECK (porcentaje >= 0 AND porcentaje <= 100);

-- HU-19: el avance de una unidad tematica se expresa en porcentaje 0-100
ALTER TABLE detalles_plan_microcurriculo
  ADD CONSTRAINT detalles_plan_avance_valido
  CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100);

-- El rango horario de una carga debe ser coherente
ALTER TABLE cargas_academicas
  ADD CONSTRAINT cargas_hora_coherente
  CHECK (hora_fin > hora_inicio);

-- HU-11 (CP-04): la inscripcion a un grupo requiere cupo positivo
ALTER TABLE grupos
  ADD CONSTRAINT grupos_cupo_positivo
  CHECK (cupo > 0);

-- HU-06: los creditos de una materia deben ser mayores que cero
ALTER TABLE materias
  ADD CONSTRAINT materias_creditos_positivos
  CHECK (numero_creditos > 0);

ALTER TABLE microcurriculos
  ADD CONSTRAINT microcurriculos_creditos_positivos
  CHECK (numero_creditos > 0);

-- HU-18: coherencia de fechas del plan microcurricular
ALTER TABLE planes_microcurriculares
  ADD CONSTRAINT planes_fecha_coherente
  CHECK (fecha_terminacion >= fecha_inicio);

-- El puntaje ICFES se registra en el rango 0 a 500
ALTER TABLE estudiantes
  ADD CONSTRAINT estudiantes_icfes_rango
  CHECK (puntaje_icfes IS NULL OR (puntaje_icfes >= 0 AND puntaje_icfes <= 500));

-- Periodo academico coherente
ALTER TABLE periodos_academicos
  ADD CONSTRAINT periodos_fecha_coherente
  CHECK (fecha_fin > fecha_inicio);

-- 3. Restricciones de exclusión: sin choques de horario -----------------------
-- HU-09 / CP-02 / R-04. Se compara el rango en minutos del dia para que dos
-- clases contiguas (8:00-10:00 y 10:00-12:00) NO se consideren traslape.
-- El alcance es por periodo academico.

ALTER TABLE cargas_academicas
  ADD CONSTRAINT cargas_sin_traslape_docente
  EXCLUDE USING gist (
    periodo_id WITH =,
    docente_id WITH =,
    dia_codigo(dia) WITH =,
    rango_minutos(hora_inicio, hora_fin) WITH &&
  )
  WHERE (estado = 'ACTIVA');

ALTER TABLE cargas_academicas
  ADD CONSTRAINT cargas_sin_traslape_aula
  EXCLUDE USING gist (
    periodo_id WITH =,
    aula_id WITH =,
    dia_codigo(dia) WITH =,
    rango_minutos(hora_inicio, hora_fin) WITH &&
  )
  WHERE (estado = 'ACTIVA');

ALTER TABLE cargas_academicas
  ADD CONSTRAINT cargas_sin_traslape_grupo
  EXCLUDE USING gist (
    periodo_id WITH =,
    grupo_id WITH =,
    dia_codigo(dia) WITH =,
    rango_minutos(hora_inicio, hora_fin) WITH &&
  )
  WHERE (estado = 'ACTIVA');

-- Un aula no puede tener dos sensores (asociación 1:1 ya garantizada por
-- la restriccion UNIQUE sobre aula_id; se deja explicita para documentacion).
COMMENT ON CONSTRAINT cargas_sin_traslape_aula ON cargas_academicas IS
  'Evita que un aula se asigne a dos clases simultaneas (Modulo 8, HU-09)';
COMMENT ON CONSTRAINT cargas_sin_traslape_docente ON cargas_academicas IS
  'Evita que un docente tenga dos clases simultaneas (HU-09, CP-02)';
COMMENT ON CONSTRAINT cargas_sin_traslape_grupo ON cargas_academicas IS
  'Evita que un grupo tenga dos materias simultaneas (HU-09)';

-- 4. Un coordinador vigente por programa (HU-05) ------------------------------
CREATE UNIQUE INDEX coordinador_vigente_por_programa
  ON coordinadores_programas (programa_id)
  WHERE fecha_fin IS NULL;

-- 5. NumeroProgramas de la facultad se actualiza automaticamente (HU-02) ------
CREATE OR REPLACE FUNCTION sincronizar_numero_programas()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE facultades
       SET numero_programas = (
             SELECT COUNT(*) FROM programas
              WHERE facultad_id = NEW.facultad_id AND estado = 'ACTIVO'
           )
     WHERE id = NEW.facultad_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE facultades
       SET numero_programas = (
             SELECT COUNT(*) FROM programas
              WHERE facultad_id = OLD.facultad_id AND estado = 'ACTIVO'
           )
     WHERE id = OLD.facultad_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND NEW.facultad_id IS DISTINCT FROM OLD.facultad_id THEN
    UPDATE facultades
       SET numero_programas = (
             SELECT COUNT(*) FROM programas
              WHERE facultad_id = OLD.facultad_id AND estado = 'ACTIVO'
           )
     WHERE id = OLD.facultad_id;
    UPDATE facultades
       SET numero_programas = (
             SELECT COUNT(*) FROM programas
              WHERE facultad_id = NEW.facultad_id AND estado = 'ACTIVO'
           )
     WHERE id = NEW.facultad_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE facultades
       SET numero_programas = (
             SELECT COUNT(*) FROM programas
              WHERE facultad_id = NEW.facultad_id AND estado = 'ACTIVO'
           )
     WHERE id = NEW.facultad_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sincronizar_numero_programas ON programas;
CREATE TRIGGER trg_sincronizar_numero_programas
  AFTER INSERT OR UPDATE OR DELETE ON programas
  FOR EACH ROW EXECUTE FUNCTION sincronizar_numero_programas();

-- 6. La bitacora de auditoria es inmutable (HU-23) ----------------------------
CREATE OR REPLACE FUNCTION bloquear_auditoria()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'La bitacora de auditoria es de solo lectura y no puede modificarse';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_inmutable ON auditorias;
CREATE TRIGGER trg_auditoria_inmutable
  BEFORE UPDATE OR DELETE ON auditorias
  FOR EACH ROW EXECUTE FUNCTION bloquear_auditoria();

-- 7. Vista horario_docente (clase HorarioDocente del enunciado) --------------
-- Se implementa como vista para no duplicar informacion de cargas_academicas.
CREATE OR REPLACE VIEW horario_docente AS
SELECT
  ca.id                                        AS codigo_horario_docente,
  d.id                                         AS id_docente,
  d.nombres || ' ' || d.apellidos              AS nombre_docente,
  a.nombre                                     AS nombre_aula,
  ca.hora_inicio                               AS hora_inicio,
  ca.hora_fin                                  AS hora_fin,
  g.codigo                                     AS grupo,
  ca.dia::text                                 AS dia,
  m.id                                         AS codigo_materia,
  m.nombre                                     AS nombre_materia,
  ca.periodo_id                                AS periodo_id,
  ca.estado                                    AS estado
FROM cargas_academicas ca
JOIN docentes d      ON d.id = ca.docente_id
JOIN grupos g        ON g.id = ca.grupo_id
JOIN materias m      ON m.id = g.materia_id
JOIN aulas a         ON a.id = ca.aula_id;

-- 8. Indices de rendimiento (R-03, A-04) -------------------------------------
CREATE INDEX IF NOT EXISTS idx_horarios_estudiante_activo
  ON horarios_estudiantes (estudiante_id, estado);

CREATE INDEX IF NOT EXISTS idx_asistencias_carga_fecha
  ON asistencias (carga_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_detalles_asistencia_estado
  ON detalles_asistencia (estado);

CREATE INDEX IF NOT EXISTS idx_cargas_periodo_docente
  ON cargas_academicas (periodo_id, docente_id);

CREATE INDEX IF NOT EXISTS idx_calificaciones_estudiante
  ON calificaciones (estudiante_id);

CREATE INDEX IF NOT EXISTS idx_auditorias_fecha
  ON auditorias (creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_pendientes
  ON notificaciones (usuario_id, leida);

COMMENT ON VIEW horario_docente IS
  'Clase HorarioDocente del enunciado: proyeccion del horario semanal de un docente';
