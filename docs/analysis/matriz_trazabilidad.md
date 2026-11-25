# Matriz de Trazabilidad — RF/HU → Clase → Módulo → Modelo Prisma → Endpoint → Sprint → Caso de prueba

**Fuentes.** Doc1 = `PROYECTO FINAL INGENIERIA DE SOFTWARE II.pdf` (18 clases). Doc2 = `parcial_Ingenieria-del-software-Juan Salas.pdf` (RF-01..RF-24, cada HU-n corresponde literalmente a RF-n). Modelos Prisma según `server/prisma/schema.prisma` (40 modelos). Endpoints según la Fase 7 del prompt maestro.

| RF / HU | Clase(s) de Doc1 | Módulo del sistema | Modelo(s) Prisma | Endpoint REST | Sprint | Caso de prueba |
|---|---|---|---|---|---|---|
| RF-01 (HU-01) | Administrador, Coordinador, Docente, Estudiante (autenticación por rol) | Autenticación y control de acceso | `Usuario`, `RefreshToken`, `IntentoAcceso`, `Auditoria` | `/api/auth` (login, refresh, logout, recuperación) | 1 | CP-01 |
| RF-02 (HU-02) | Administrador (`GestionarFacultad`, `GestionarPrograma`), Facultad, Programa | Gestión de Facultades y Programas | `Facultad`, `Programa` | `/api/facultades`, `/api/programas` | 1 | — (prueba funcional en DoD del sprint) |
| RF-03 (HU-03) | Administrador (`GestionarEstudiante`), Estudiante | Gestión de Estudiantes | `Estudiante`, `Usuario`, `Programa` | `/api/estudiantes` | 1 | — |
| RF-04 (HU-04) | Administrador (`GestionarDocente`), Docente | Gestión de Docentes | `Docente`, `Usuario` | `/api/docentes` | 1 | — |
| RF-05 (HU-05) | Administrador (`GestionarCoordinador`), Coordinador, Programa | Gestión de Coordinadores | `Coordinador`, `Usuario`, `CoordinadorPrograma` | `/api/coordinadores` | 2 | — |
| RF-06 (HU-06) | Administrador (`GestionarMateria`), Materia | Gestión de Materias | `Materia` | `/api/materias` | 2 | — |
| RF-07 (HU-07) | MateriaDocente, Materia, Docente | Gestión de Materias / Docentes (asignación) | `MateriaDocente`, `MateriaPrograma` | `/api/materias/{id}/docentes`, `/api/docentes/{id}/materias` | 2 | — |
| RF-08 (HU-08) | Administrador (`GestionarAula`), Aula | Gestión de Aulas | `Aula`, `Sede` | `/api/aulas` | 2 | — |
| RF-09 (HU-09) | CargaAcadémica, Aula, MateriaDocente, Coordinador (`GestionarCargaAcademica`) | Carga Académica | `CargaAcademica`, `Grupo`, `Docente`, `Aula`, `PeriodoAcademico` (+ restricciones `EXCLUDE`, ver ADR-10) | `/api/cargas-academicas` | 2 | **CP-02** |
| RF-10 (HU-10) | HorarioDocente, HorarioEstudiante, Coordinador (`ConsultarHorarioDocente`, `ConsultarHorarioEstudiante`) | Horarios Académicos (consulta por coordinador) | vista `horario_docente` (ADR-08), `HorarioEstudiante` | `/api/horarios?docenteId=` / `?estudianteId=` | 3 | — |
| RF-11 (HU-11) | HorarioEstudiante, Estudiante (`CrearHorarioAcademico`, `VisualizarHorarioAcademico`) | Horarios Académicos (estudiante) | `HorarioEstudiante`, `Grupo`, `CargaAcademica` | `/api/horarios` (estudiante autenticado) | 3 | **CP-04** |
| RF-12 (HU-12) | HorarioDocente, Docente (`VisualizarHorarioAcademico`) | Horarios Académicos (docente) | vista `horario_docente` | `/api/horarios` (docente autenticado) | 3 | — |
| RF-13 (HU-13) | SensorAsistencia (`RegistrarAsistencia`), Asistencia, DetalleAsistencia | Asistencia Académica + Sensor de Asistencia | `SensorAsistencia`, `SensorLectura`, `Asistencia`, `DetalleAsistencia` | `/api/sensores`, `/api/asistencias` | 4 | **CP-03** |
| RF-14 (HU-14) | Docente (`VisualizarAsistenciaEstudiantes`), Asistencia, DetalleAsistencia | Asistencia Académica (consulta docente) | `Asistencia`, `DetalleAsistencia` | `/api/asistencias?docenteId=&fecha=` | 4 | — |
| RF-15 (HU-15) | Estudiante (`VisualizarAsistencias`), DetalleAsistencia | Asistencia Académica (consulta estudiante) | `DetalleAsistencia` | `/api/asistencias?estudianteId=` | 4 | — |
| RF-16 (HU-16) | Microcurrículo, Coordinador (`GestionarMicrocurriculo`) | Microcurrículos | `Microcurriculo`, `MicrocurriculoPrerequisito` | `/api/microcurriculos` | 5 | — |
| RF-17 (HU-17) | ContenidoCompetenciasEspecíficas | Contenidos y Competencias Específicas | `ContenidoCompetenciaEspecifica` | `/api/competencias` | 5 | — |
| RF-18 (HU-18) | PlanMicrocurrículo, Coordinador (`GestionarPlanMicrocurriculo`) | Plan Microcurricular | `PlanMicrocurriculo` | `/api/planes-microcurriculares` | 5 | — |
| RF-19 (HU-19) | Docente/Estudiante (`SeguimientoPlanMicrocurriculo`), Coordinador (`SeguimientoMicrocurriculo`) | Plan Microcurricular (seguimiento) | `DetallePlanMicrocurriculo` | `/api/planes-microcurriculares/{id}/seguimiento` | 5 | — |
| RF-20 (HU-20) | Docente (`GestionarCalificaciones`) | Calificaciones | `ConfiguracionEvaluacion`, `Evaluacion`, `Calificacion`, `HistorialCalificacion` | `/api/calificaciones` | 6 | **CP-05** |
| RF-21 (HU-21) | (no corresponde a una clase única; agregación transversal) | Reportes | consultas sobre `Asistencia`, `CargaAcademica`, `Calificacion`, etc. (sin modelo propio) | `/api/reportes` | 6 | — |
| RF-22 (HU-22) | (funcionalidad adicional, sección 10 del prompt maestro) | Notificaciones por correo | `NotificacionCorreo`, `Notificacion` | integrado en los módulos emisores (horarios, asistencia); sin endpoint propio en la Fase 7 | 6 | — |
| RF-23 (HU-23) | (funcionalidad adicional exigida por Doc2, no está en Doc1) | Auditoría | `Auditoria` (trigger `bloquear_auditoria`, ADR-11) | `/api/auditorias` (consulta, extensión propia sobre la lista base) | 3 | referenciado en **CP-05**, paso 7 |
| RF-24 (HU-24) | (funcionalidad adicional exigida por Doc2, no está en Doc1) | Respaldos y Restauración | `Respaldo` (ADR-09) | `/api/respaldos` (extensión propia, administración) | 3 | **CP-06** |
| — (HU-T1) | SensorAsistencia (spike técnico, sin RF propio) | Validación técnica del sensor (Sprint 0) | `SensorAsistencia` (prototipo) | — (no es un endpoint de producto, es una prueba de viabilidad) | 0 | — |

## Clases de Doc1 sin historia de usuario propia (cubiertas transversalmente)

Estas clases del documento original no tienen una HU dedicada en Doc2, pero su cobertura queda demostrada bajo el RF indicado:

| Clase (Doc1) | Cubierta bajo | Cómo |
|---|---|---|
| CargaAcadémica | RF-09 | Modelo `CargaAcademica`, ver fila RF-09 arriba. |
| HorarioDocente | RF-10 / RF-12 | Vista SQL `horario_docente` (ADR-08), sin tabla propia por ser derivable. |
| ContenidoCompetenciasEspecíficas | RF-17 | Modelo `ContenidoCompetenciaEspecifica`. |
| PlanMicrocurrículo | RF-18 | Modelo `PlanMicrocurriculo`. |

## Notas de trazabilidad

1. **Correspondencia 1:1 HU↔RF.** Doc2 (sección 3) declara explícitamente: "Cada historia HU-n corresponde al requerimiento RF-n". Esta matriz respeta esa correspondencia; no se reindexan los códigos.
2. **RF-21 a RF-24 no tienen clase de origen en Doc1** porque son las cuatro historias que el propio Doc2 añade "por nuestra cuenta... porque el sistema las necesita" (sección 3): reportes, notificaciones, auditoría y respaldos. Se marcan así para que quede explícito que son extensión documentada, no omisión.
3. **Los 6 casos de prueba (CP-01 a CP-06)** cubren únicamente las 6 funciones críticas identificadas en Doc2 sección 9 (autenticación, carga académica, horario de estudiante, asistencia con sensor, calificaciones, respaldo); el resto de historias se prueban dentro del sprint donde se construyen (Doc2, sección 10), sin un CP numerado propio — ver `docs/scrum/plan_pruebas.md`.
4. **Riesgo mitigado por requerimiento crítico**, tomado de Doc2 sección 10: RF-01→R-02, RF-09→R-04, RF-11→R-04, RF-13→R-01, RF-20→R-07, RF-24→R-06 (detalle completo en `docs/scrum/analisis_riesgos.md` y `docs/scrum/plan_pruebas.md`).
