# Requerimientos Funcionales — Sistema Académico Universitario

**Proyecto:** Proyecto Final Ingeniería de Software II
**Versión:** 1.0
**Fuentes:** Doc1 (enunciado, 18 clases) y Doc2 (plan ágil, HU-01..HU-24 + HU-T1).
**Convención de identificación:** Doc2 declara que cada historia HU-n corresponde al requerimiento RF-n; por lo tanto RF-01 = HU-01, ..., RF-24 = HU-24. Las filas RF-25 y RF-26 son adiciones de valor permitidas por Doc1 (se marcan como *Interpretación adoptada*).

**Prioridad MoSCoW:** M = Must (debe estar), S = Should (debería), C = Could (podría).

---

## 1. Matriz de requerimientos funcionales (RF-01 .. RF-26)

| ID | Descripción | Fuente | Prioridad MoSCoW | Sprint | Módulo |
|---|---|---|---|---|---|
| RF-01 | Inicio de sesión con correo y contraseña para los cuatro roles, con acceso solo a las funciones del rol propio; cinco intentos fallidos bloquean la cuenta 15 minutos | Doc2 / HU-01 (Doc1 no define autenticación) | M | 1 | M1 |
| RF-02 | Crear, editar y consultar facultades y programas; código único de facultad y de programa; `NumeroProgramas` de la facultad se actualiza solo; no se elimina una facultad con programas | Doc2 / HU-02 + Doc1: Facultad, Programa, Administrador.GestionarFacultad/GestionarPrograma | M | 1 | M3, M4 |
| RF-03 | Registrar y actualizar estudiantes con datos personales y académicos, vinculados a una facultad y un programa; campos obligatorios validados; documento duplicado rechazado | Doc2 / HU-03 + Doc1: Estudiante, Administrador.GestionarEstudiante | M | 1 | M5 |
| RF-04 | Gestionar docentes con alta, edición y baja lógica; correo único; un docente dado de baja conserva su historial | Doc2 / HU-04 + Doc1: Docente, Administrador.GestionarDocente | M | 1 | M6 |
| RF-05 | Gestionar coordinadores y asignarlos a programas: un coordinador se asigna a uno o más programas y un programa tiene un coordinador vigente | Doc2 / HU-05 + Doc1: Coordinador (relación con Programa) | M | 2 | M7 |
| RF-06 | Gestionar materias con código, nombre y créditos; código único y créditos mayores que cero | Doc2 / HU-06 + Doc1: Materia, Administrador.GestionarMateria | M | 2 | M8 |
| RF-07 | Asignar materias a docentes (MateriaDocente): una materia admite varios docentes y no se duplica el par docente-materia | Doc2 / HU-07 + Doc1: MateriaDocente | M | 2 | M8 |
| RF-08 | Gestionar aulas con código y nombre; código único; un aula con horarios asignados no se elimina | Doc2 / HU-08 + Doc1: Aula, Administrador.GestionarAula | M | 2 | M9 |
| RF-09 | Gestionar la carga académica del programa (materia, docente, aula, día, hora, grupo, periodo) rechazando choques de docente o de aula en el mismo día y hora; la carga se guarda por periodo | Doc2 / HU-09 + Doc1: CargaAcademica, Coordinador.GestionarCargaAcademica | M | 2 | M10 |
| RF-10 | Consultar el horario de un docente y de un estudiante del programa, por identificación, mostrando materia, aula, día, hora y grupo; solo se ven personas del propio programa | Doc2 / HU-10 + Doc1: Coordinador.ConsultarHorarioDocente/ConsultarHorarioEstudiante, HorarioDocente, HorarioEstudiante | M | 3 | M11 |
| RF-11 | Crear y visualizar el horario académico del estudiante: solo inscribe grupos con cupo y sin choque con sus otras materias; el horario guardado se ve en menos de 3 segundos | Doc2 / HU-11 + Doc1: Estudiante.CrearHorarioAcademico/VisualizarHorarioAcademico, HorarioEstudiante | M | 3 | M11 |
| RF-12 | Visualizar el horario académico del docente: muestra solo sus grupos del periodo vigente y refleja los cambios de la carga académica | Doc2 / HU-12 + Doc1: Docente.VisualizarHorarioAcademico, HorarioDocente | M | 3 | M11 |
| RF-13 | Registro de asistencia por sensor: identifica a la persona y la guarda en DetalleAsistencia con estado y hora; una persona no se registra dos veces en la misma sesión; sin red guarda localmente y sincroniza después | Doc2 / HU-13 + Doc1: SensorAsistencia.RegistrarAsistencia, Asistencia, DetalleAsistencia | M | 4 | M12 |
| RF-14 | Consultar la asistencia de los grupos del docente por fecha y tema, con filtro por asignatura, grupo y fecha, mostrando presentes, ausentes y tardanzas | Doc2 / HU-14 + Doc1: Docente.VisualizarAsistenciaEstudiantes, Asistencia | M | 4 | M12 |
| RF-15 | Visualizar las asistencias propias del estudiante por materia; solo muestra sus registros y el porcentaje coincide con los registros del sensor | Doc2 / HU-15 + Doc1: Estudiante.VisualizarAsistencias, DetalleAsistencia | S | 4 | M12 |
| RF-16 | Gestionar el microcurrículo de cada materia del programa: campos obligatorios completos, prerrequisitos válidos, los cuatro niveles de desempeño y los tres parciales guardados | Doc2 / HU-16 + Doc1: Microcurriculo, Coordinador.GestionarMicrocurriculo | S | 5 | M13 |
| RF-17 | Registrar competencias específicas y resultados de aprendizaje por unidad temática; cada competencia pertenece a un microcurrículo y los niveles Superior, Normal, Bajo y Deficiente tienen descripción | Doc2 / HU-17 + Doc1: ContenidoCompetenciasEspecificas | S | 5 | M13 |
| RF-18 | Gestionar el plan de microcurrículo por periodo y docente: ligado a microcurrículo, docente y periodo, con total de horas y fechas de inicio y fin coherentes | Doc2 / HU-18 + Doc1: PlanMicrocurriculo, Coordinador.GestionarPlanMicrocurriculo | S | 5 | M14 |
| RF-19 | Seguimiento del plan de microcurrículo: el docente marca el avance por unidad, el estudiante consulta el avance sin poder editarlo y el coordinador ve el avance de todos los grupos | Doc2 / HU-19 + Doc1: Docente/Estudiante/Coordinador.SeguimientoPlanMicrocurriculo, DetallePlanMicrocurriculo | S | 5 | M14 |
| RF-20 | Registrar y modificar calificaciones de los grupos propios: solo edita sus grupos, valores entre 0.0 y 5.0 y cada cambio queda con fecha y usuario | Doc2 / HU-20 + Doc1: Docente.GestionarCalificaciones | M | 6 | M15 |
| RF-21 | Generar reportes de asistencia y de carga académica por periodo y programa, exportables a PDF y Excel, coincidentes con los datos del sistema | Doc2 / HU-21 (sin clase en Doc1) | C | 6 | M16 |
| RF-22 | Notificaciones por correo a estudiantes y docentes sobre cambios de horario o inasistencias reiteradas: envío en menos de 5 minutos tras el cambio y sin duplicados | Doc2 / HU-22 (sin clase en Doc1; usa atributo Correo) | C | 6 | MT4 |
| RF-23 | Bitácora de auditoría de acciones críticas (altas, bajas, cambios de nota y de carga) que guarda usuario, fecha, hora y valor anterior, y que no se puede editar | Doc2 / HU-23 (sin clase en Doc1) | S | 3 | MT2 |
| RF-24 | Respaldo automático diario de la base de datos con copia fuera del servidor y procedimiento de restauración probado que recupera los datos en menos de 2 horas | Doc2 / HU-24 (aplica a todas las clases de Doc1) | M | 3 | MT3 |
| RF-25 | Gestión de sedes institucionales (código y nombre), sustentando el atributo `Sede` de la clase Asistencia de Doc1 y su uso en aulas y sesiones de asistencia | Doc1 / clase Asistencia (atributo `Sede`); Doc2 no la contempla | S (Interpretación adoptada) | 2 (Interpretación adoptada) | M3 |
| RF-26 | Gestión de periodos académicos (año lectivo, número de periodo, fechas de inicio y fin, estado vigente/cerrado) que rige la carga académica, la inscripción de grupos, los planes microcurrículo y el cierre de notas | Doc1 (atributos `PeriodoCarga`, `PeriodoAcademico`, `AñoLectivo`) + Doc2 (periodo vigente en HU-09, HU-11, HU-12, HU-18 y R-07) | M (Interpretación adoptada) | 1 (Interpretación adoptada) | MT1 |
| HU-T1 | Historia técnica: probar el sensor antes de comprometer HU-13 (que conecte, que lea la identificación y cuánto demora); si demora más de 2 s por persona o no conecta de forma estable, se reorganiza el plan | Doc2 / Sprint 0 | M (hist. técnica) | 0 | M12 |

**Cobertura:** 26 requerimientos funcionales (24 del Doc2 + 2 adicionales) más 1 historia técnica.

**Distribución por prioridad:** M = 18 (RF-01..RF-14, RF-20, RF-24, RF-26, HU-T1), S = 6 (RF-15..RF-19, RF-23, RF-25), C = 2 (RF-21, RF-22).

---

## 2. Detalle por módulo funcional

Los módulos M1 a M16 corresponden a la descomposición funcional del sistema según el enunciado y el plan (Interpretación adoptada sobre la estructura de Doc1 y Doc2). MT1 a MT4 son los módulos transversales exigidos por Doc2 sin clase propia en Doc1.

### M1 — Autenticación y control de acceso por rol

| Campo | Contenido |
|---|---|
| RF asociadas | RF-01 |
| Fuente | Doc2 HU-01, CP-01, alerta A-02 (Doc1 no define autenticación) |
| Prioridad | M — Sprint 1 |
| Actores | Los cuatro roles |
| Funcionalidades | Inicio de sesión con correo y contraseña; cierre de sesión; consulta de sesión activa (perfil y rol); bloqueo de cuenta tras 5 intentos fallidos durante 15 minutos; guard de autorización por rol en cada endpoint del backend; enrutado del frontend por rol con acceso denegado a pantallas ajenas; registro inicial de usuarios derivados de las clases Administrador, Coordinador, Docente y Estudiante |
| Reglas aplicables | RN-30, RN-31 (ver `reglas_de_negocio.md`) |
| Criterio de aceptación clave | "Credenciales válidas entran al menú de su rol; cinco intentos fallidos bloquean la cuenta 15 min; un rol no puede abrir pantallas de otro" (HU-01) |

### M2 — Dashboard por rol

| Campo | Contenido |
|---|---|
| RF asociadas | RF-01 (extensión de "menú de su rol") |
| Fuente | Contexto del sistema: módulo "dashboard por rol" (Interpretación adoptada); HU-01 menciona el menú por rol |
| Prioridad | M — Sprint 1 (junto con M1) |
| Actores | Los cuatro roles |
| Funcionalidades | Pantalla de bienvenida con accesos y resúmenes propios del rol: para el administrador, contadores de estructura y alertas; para el coordinador, estado de la carga y del periodo; para el docente, sus próximas clases y pendientes de notas/asistencia; para el estudiante, su horario del día y su asistencia |
| Reglas aplicables | RN-31 (el dashboard no expone datos de otro rol) |
| Nota | Los indicadores exactos son de diseño de interfaz; la obligación funcional es que cada rol vea solo lo suyo (HU-01, CP-01 paso 6) |

### M3 — Facultades y sedes

| Campo | Contenido |
|---|---|
| RF asociadas | RF-02 (facultades), RF-25 (sedes) |
| Fuente | Doc1 clase Facultad (`CodigoFacultad`, `NombreFacultad`, `NumeroProgramas`); Doc2 HU-02; atributo `Sede` de la clase Asistencia |
| Prioridad | M (RF-02, Sprint 1) / S (RF-25, Sprint 2 — Interpretación adoptada) |
| Actores | Administrador (gestión); Coordinador (consulta) |
| Funcionalidades | CRUD de facultades con código único; actualización automática de `NumeroProgramas`; bloqueo de eliminación si la facultad tiene programas; catálogo de sedes con código y nombre, ligadas a aulas y a sesiones de asistencia |
| Reglas aplicables | RN-01, RN-07, RN-48, RN-49 |
| Criterio de aceptación clave | "Código de facultad y de programa únicos; NumeroProgramas de la facultad se actualiza solo; no se elimina una facultad con programas" (HU-02) |

### M4 — Programas

| Campo | Contenido |
|---|---|
| RF asociadas | RF-02 |
| Fuente | Doc1 clase Programa (`CodigoPrograma`, `NombrePrograma`, `NumeroCreditos`); Doc2 HU-02 |
| Prioridad | M — Sprint 1 |
| Actores | Administrador (gestión); Coordinador (consulta) |
| Funcionalidades | CRUD de programas con código único; asignación a facultad; consulta de los programas de una facultad; bloqueo de eliminación si el programa tiene estudiantes, carga académica o microcurrículos |
| Reglas aplicables | RN-02, RN-08, RN-26 |
| Criterio de aceptación clave | Ver HU-02 (mismo criterio de unicidad) |

### M5 — Estudiantes

| Campo | Contenido |
|---|---|
| RF asociadas | RF-03 |
| Fuente | Doc1 clase Estudiante (atributos personales y académicos, métodos de horario, asistencia y seguimiento); Doc2 HU-03 |
| Prioridad | M — Sprint 1 |
| Actores | Administrador (gestión); Coordinador y Docente (consulta limitada); Estudiante (solo sus datos) |
| Funcionalidades | Registro y actualización de estudiantes con validación de campos obligatorios (documento, correo, programa); rechazo de documento duplicado; vinculación forzada a facultad y programa; alta/baja lógica que conserva el historial; visualización del perfil propio |
| Reglas aplicables | RN-05, RN-06, RN-10, RN-16, RN-29, RN-53 |
| Criterio de aceptación clave | "Campos obligatorios validados (documento, correo, programa); documento duplicado se rechaza; el estudiante queda asociado a facultad y programa" (HU-03) |
| Datos sensibles | Puntaje ICFES, SISBEN y datos del acudiente quedan bajo mínimo privilegio y bitácora (R-02) |

### M6 — Docentes

| Campo | Contenido |
|---|---|
| RF asociadas | RF-04 |
| Fuente | Doc1 clase Docente; Doc2 HU-04 |
| Prioridad | M — Sprint 1 |
| Actores | Administrador (gestión); Coordinador y Estudiante (consulta limitada); Docente (solo sus datos) |
| Funcionalidades | Alta, edición y consulta de docentes; correo único; baja lógica sin borrado físico, conservando asignaciones, horarios, asistencia y calificaciones históricas |
| Reglas aplicables | RN-06, RN-10 |
| Criterio de aceptación clave | "Alta, edición y baja lógica; correo único; un docente dado de baja conserva su historial" (HU-04) |

### M7 — Coordinadores

| Campo | Contenido |
|---|---|
| RF asociadas | RF-05 |
| Fuente | Doc1 clase Coordinador (métodos de carga, horarios y microcurrículo; relación con Programa); Doc2 HU-05 |
| Prioridad | M — Sprint 2 |
| Actores | Administrador (gestión); Coordinador (solo su perfil) |
| Funcionalidades | Alta y edición de coordinadores; asignación de un coordinador a uno o más programas con vigencia; garantía de un coordinador vigente por programa; baja lógica que retira la asignación vigente sin borrar el historial |
| Reglas aplicables | RN-06, RN-10, RN-26 |
| Criterio de aceptación clave | "Un coordinador se asigna a uno o más programas; un programa tiene un coordinador vigente" (HU-05) |

### M8 — Materias y asignación materia–docente

| Campo | Contenido |
|---|---|
| RF asociadas | RF-06 (materias), RF-07 (MateriaDocente) |
| Fuente | Doc1 clases Materia y MateriaDocente; Doc2 HU-06 y HU-07 |
| Prioridad | M — Sprint 2 |
| Actores | Administrador (gestión); Coordinador, Docente y Estudiante (consulta) |
| Funcionalidades | CRUD de materias con código único y créditos mayores que cero; asignación de materias a docentes sin duplicar el par docente-materia; consulta de qué docentes pueden dictar una materia y de qué materias dicta un docente |
| Reglas aplicables | RN-03, RN-47, RN-33 |
| Criterio de aceptación clave | "Una materia admite varios docentes; no se duplica el par docente-materia" (HU-07); "Código único; créditos mayores que cero" (HU-06) |

### M9 — Aulas

| Campo | Contenido |
|---|---|
| RF asociadas | RF-08 |
| Fuente | Doc1 clase Aula (`CodigoAula`, `NombreAula`, relación con Asistencia); Doc2 HU-08 |
| Prioridad | M — Sprint 2 |
| Actores | Administrador (gestión); Coordinador, Docente y Estudiante (consulta) |
| Funcionalidades | CRUD de aulas con código único; bloqueo de eliminación si el aula tiene horarios o carga asignada; asociación opcional con sede y con un sensor de asistencia |
| Reglas aplicables | RN-04, RN-09 |
| Criterio de aceptación clave | "Código único; un aula con horarios asignados no se elimina" (HU-08) |

### M10 — Carga académica con detección de choques

| Campo | Contenido |
|---|---|
| RF asociadas | RF-09 (y RF-26 como soporte) |
| Fuente | Doc1 clase CargaAcademica + método Coordinador.GestionarCargaAcademica; Doc2 HU-09, CP-02, alerta A-05, riesgo R-04 |
| Prioridad | M — Sprint 2 |
| Actores | Coordinador (gestión de su programa); Administrador (consulta global) |
| Funcionalidades | Registro y edición de asignaciones (programa, materia, docente, aula, día, hora, grupo, periodo); validación de choques de docente, de aula y de grupo en día y hora con horas contiguas permitidas; validación de que la asignación pertenezca al periodo vigente; restricciones únicas en base de datos además de la validación en código; bloqueo al editar para evitar carreras de concurrencia |
| Reglas aplicables | RN-11, RN-12, RN-13, RN-14, RN-15, RN-34 |
| Criterio de aceptación clave | "El sistema rechaza choques de docente o de aula en el mismo día y hora; la carga se guarda por periodo" (HU-09); CP-02: caso A y B rechazados, caso C (horas contiguas) aceptado |
| Riesgos | R-04 (choques en producción), A-05 |

### M11 — Horarios semanales por rol

| Campo | Contenido |
|---|---|
| RF asociadas | RF-10, RF-11, RF-12 |
| Fuente | Doc1 clases HorarioEstudiante y HorarioDocente, métodos CrearHorarioAcademico y VisualizarHorarioAcademico de Estudiante y Docente, ConsultarHorario* de Coordinador; Doc2 HU-10, HU-11, HU-12, CP-04 |
| Prioridad | M — Sprint 3 |
| Actores | Coordinador (consulta de su programa), Estudiante (crea y consulta el suyo), Docente (consulta el suyo), Administrador (consulta global) |
| Funcionalidades | Vista semanal (lunes a viernes) con materia, aula, día, hora y grupo; búsqueda por identificación para el coordinador, limitada a su programa; inscripción de grupos por el estudiante con validación de cupo y de choque con sus propias materias; el horario del docente refleja los cambios de la carga académica; respuesta en menos de 3 segundos |
| Reglas aplicables | RN-14, RN-15, RN-16, RN-17, RN-35 |
| Criterio de aceptación clave | "Solo inscribe grupos con cupo y sin choque con mis otras materias; el horario guardado se ve en menos de 3 s" (HU-11); CP-04 (G-B por choque, G-C por cupo, carga < 3 s) |
| Riesgos | R-03 (disponibilidad), R-04 |

### M12 — Asistencia: sesión, detalle y simulador de sensor

| Campo | Contenido |
|---|---|
| RF asociadas | RF-13, RF-14, RF-15 (y HU-T1) |
| Fuente | Doc1 clases Asistencia, DetalleAsistencia y SensorAsistencia (método `RegistrarAsistencia`); Doc2 HU-13, HU-14, HU-15, HU-T1, CP-03, alerta A-01, riesgo R-01 |
| Prioridad | M (RF-13, RF-14) y S (RF-15) — Sprint 4; HU-T1 en Sprint 0 |
| Actores | Docente (consulta de sus grupos), Estudiante (consulta la suya), Coordinador y Administrador (consulta por programa), SensorAsistencia (actor no humano) |
| Funcionalidades | Creación de la sesión de asistencia (grupo, aula, docente responsable, fecha, hora, tema, sede); registro desde el sensor con validación de estudiante inscrito en el grupo, sesión activa y coincidencia con el horario; rechazo de duplicados en la misma sesión; cola local del sensor cuando no hay red, con sincronización posterior sin duplicar; registro manual de respaldo por el docente en la misma tabla de detalle; consulta por docente con filtros de asignatura, grupo y fecha mostrando presentes, ausentes y tardanzas; consulta del estudiante con su porcentaje de asistencia; alerta A-01 si un sensor no reporta 5 minutos en horario de clase |
| Reglas aplicables | RN-18, RN-19, RN-20, RN-36, RN-37 |
| Criterio de aceptación clave | HU-13: "El sensor identifica a la persona, la guarda en DetalleAsistencia con estado y hora; una persona no se registra dos veces en la misma sesión; si no hay red, guarda localmente y sincroniza después"; CP-03 completo |
| Riesgos | R-01 (crítico); punto de control antes del Sprint 4 con HU-T1 |

### M13 — Microcurrículo y competencias específicas

| Campo | Contenido |
|---|---|
| RF asociadas | RF-16, RF-17 |
| Fuente | Doc1 clases Microcurriculo y ContenidoCompetenciasEspecificas; Doc2 HU-16, HU-17, riesgo R-05 |
| Prioridad | S — Sprint 5 |
| Actores | Coordinador (gestión), Docente y Estudiante (consulta) |
| Funcionalidades | Gestión del contenido programático de cada materia: prerrequisitos, departamento oferente, tipo y naturaleza de asignatura, descripción, objetivo general y específicos, competencias genéricas, estrategias pedagógicas, referencias bibliográficas, los cuatro niveles de desempeño y los tres parciales; registro de competencias específicas por unidad temática con resultados de aprendizaje y descripción de los niveles Superior, Normal, Bajo y Deficiente; validación de prerrequisitos (que existan y no sean ciclos) |
| Reglas aplicables | RN-21, RN-22, RN-32, RN-38 |
| Criterio de aceptación clave | HU-16: "Campos obligatorios completos; prerrequisitos válidos; los cuatro niveles de desempeño y los tres parciales quedan guardados"; HU-17: "Cada competencia pertenece a un microcurrículo; los niveles Superior, Normal, Bajo y Deficiente tienen descripción" |
| Riesgos | R-05 (requisitos ambiguos o cambiantes) |

### M14 — Plan microcurrículo y seguimiento de avance

| Campo | Contenido |
|---|---|
| RF asociadas | RF-18, RF-19 |
| Fuente | Doc1 clases PlanMicrocurriculo y DetallePlanMicrocurriculo, métodos GestionarPlanMicrocurriculo y SeguimientoMicrocurriculo; Doc2 HU-18, HU-19 |
| Prioridad | S — Sprint 5 |
| Actores | Coordinador (gestión), Docente (marca avance), Estudiante (consulta), Administrador (consulta) |
| Funcionalidades | Creación del plan ligado a microcurrículo, docente y periodo, con año lectivo, créditos, tipo y naturaleza de asignatura, fecha de inicio, total de horas y fecha de terminación coherentes; detalle por unidad temática; marcado del avance por el docente; consulta del avance por el estudiante en modo solo lectura; vista consolidada del coordinador para todos los grupos |
| Reglas aplicables | RN-23, RN-24, RN-39 |
| Criterio de aceptación clave | HU-18: "El plan queda ligado a microcurrículo, docente y periodo; total de horas y fechas de inicio y fin coherentes"; HU-19: "El docente marca el avance por unidad; el estudiante ve el avance sin poder editarlo; el coordinador ve el avance de todos los grupos" |
| Riesgos | R-05 |

### M15 — Calificaciones

| Campo | Contenido |
|---|---|
| RF asociadas | RF-20 (con RF-23 para la trazabilidad) |
| Fuente | Doc1 método Docente.GestionarCalificaciones (Doc1 no define la entidad); Doc2 HU-20, CP-05, alerta A-06, riesgo R-07 |
| Prioridad | M — Sprint 6 |
| Actores | Docente (edición de sus grupos), Estudiante (consulta de sus notas), Coordinador y Administrador (consulta y auditoría) |
| Funcionalidades | Registro y modificación de notas en escala 0.0 a 5.0; edición exclusiva del docente del grupo; trazabilidad de cada cambio con usuario, fecha, hora y valor anterior; cierre de notas por periodo; consulta del estudiante sobre sus propias notas; alerta A-06 por cambio de nota fuera del periodo de calificación o cambios masivos anómalos |
| Reglas aplicables | RN-25, RN-27, RN-28, RN-34, RN-52 |
| Criterio de aceptación clave | HU-20: "Solo edita sus grupos; valores entre 0.0 y 5.0; cada cambio queda con fecha y usuario"; CP-05 (4.2 guardada; 5.5 y -1 rechazadas; cambio a 4.5 trazado; edición de otro docente denegada) |
| Riesgos | R-07 |

### M16 — Reportes con exportación

| Campo | Contenido |
|---|---|
| RF asociadas | RF-21 |
| Fuente | Doc2 HU-21 (sin clase equivalente en Doc1) |
| Prioridad | C — Sprint 6 |
| Actores | Coordinador (generación), Administrador (generación y consulta) |
| Funcionalidades | Reporte de asistencia por periodo y programa; reporte de carga académica por periodo y programa; exportación a PDF y Excel; los totales coinciden con los datos del sistema |
| Reglas aplicables | RN-40 |
| Criterio de aceptación clave | "Reporte por periodo y programa exportable a PDF y Excel; coincide con los datos del sistema" (HU-21) |
| Riesgos | Falla clasificada como nivel 3 (media) en Doc2 §7 si los totales son errados |

### MT1 — Periodos académicos (transversal)

| Campo | Contenido |
|---|---|
| RF asociadas | RF-26 |
| Fuente | Doc1 (atributos `PeriodoCarga`, `PeriodoAcademico`, `AñoLectivo`) + Doc2 (periodo vigente en HU-09, HU-11, HU-12, HU-18 y cierre de notas en R-07) |
| Prioridad | M (Interpretación adoptada) — Sprint 1 |
| Actores | Administrador (gestión), los demás roles (consulta) |
| Funcionalidades | Definición de periodos con año lectivo, número, fechas de inicio y fin y estado (vigente/cerrado); solo un periodo vigente a la vez; cierre de periodo que bloquea carga, inscripciones, planes y notas |
| Reglas aplicables | RN-14, RN-39, RN-41, RN-50 |

### MT2 — Auditoría / bitácora (transversal)

| Campo | Contenido |
|---|---|
| RF asociadas | RF-23 |
| Fuente | Doc2 HU-23, CP-05 (paso 7), alerta A-06, riesgos R-02 y R-07 |
| Prioridad | S — Sprint 3 |
| Actores | Administrador (consulta); el sistema (escritura) |
| Funcionalidades | Registro automático de acciones críticas (altas, bajas, cambios de nota y cambios de carga) con usuario, fecha, hora, valor anterior y valor nuevo; vista de consulta con filtros; la bitácora es de solo lectura: ni la API ni la interfaz permiten editar ni borrar entradas |
| Reglas aplicables | RN-34, RN-42, RN-51 |
| Criterio de aceptación clave | "Cada acción crítica guarda usuario, fecha, hora y valor anterior; la bitácora no se puede editar" (HU-23) |

### MT3 — Respaldos y restauración (transversal)

| Campo | Contenido |
|---|---|
| RF asociadas | RF-24 |
| Fuente | Doc2 HU-24, CP-06, alerta A-03, riesgo R-06, §8 (metas de recuperación) |
| Prioridad | M — Sprint 3 |
| Actores | Administrador (ejecuta y restaura); Sistema de respaldos (actor no humano) |
| Funcionalidades | Respaldo diario automático de la base de datos; copia fuera del servidor (almacenamiento externo); registro del resultado de cada respaldo con alerta A-03 si falla; procedimiento de restauración documentado y probado en cada sprint desde el Sprint 3, con recuperación en menos de 2 horas y sin registros huérfanos |
| Reglas aplicables | RN-43, RN-44 |
| Criterio de aceptación clave | "Respaldo diario y copia fuera del servidor; una restauración de prueba recupera los datos en menos de 2 h" (HU-24); CP-06 |

### MT4 — Notificaciones por correo (transversal)

| Campo | Contenido |
|---|---|
| RF asociadas | RF-22 (y las alertas A-01..A-07 del §8 de Doc2) |
| Fuente | Doc2 HU-22, §8 (cada alerta llega por correo al responsable y al Scrum Master; las de nivel 1 también al celular) |
| Prioridad | C — Sprint 6 |
| Actores | Sistema de notificaciones (actor no humano); Estudiante, Docente, Coordinador y Administrador (destinatarios) |
| Funcionalidades | Envío de correos por cambios de horario y por inasistencias reiteradas en menos de 5 minutos; sin envíos duplicados; capa de correo con transportador configurable (en desarrollo, transportador en consola/log); entrega de alertas A-01 a A-07 al responsable y al Scrum Master |
| Reglas aplicables | RN-45, RN-46 |
| Criterio de aceptación clave | "Envía el correo en menos de 5 min tras el cambio; no envía duplicados" (HU-22) |

---

## 3. Matriz resumen RF → Módulo → Sprint

| Módulo | RF cubiertas | Sprint(s) |
|---|---|---|
| M1 Autenticación y control de acceso | RF-01 | 1 |
| M2 Dashboard por rol | RF-01 (extensión) | 1 |
| M3 Facultades y sedes | RF-02, RF-25 | 1, 2 |
| M4 Programas | RF-02 | 1 |
| M5 Estudiantes | RF-03 | 1 |
| M6 Docentes | RF-04 | 1 |
| M7 Coordinadores | RF-05 | 2 |
| M8 Materias y MateriaDocente | RF-06, RF-07 | 2 |
| M9 Aulas | RF-08 | 2 |
| M10 Carga académica y choques | RF-09 | 2 |
| M11 Horarios semanales | RF-10, RF-11, RF-12 | 3 |
| M12 Asistencia y sensor | RF-13, RF-14, RF-15, HU-T1 | 0, 4 |
| M13 Microcurrículo y competencias | RF-16, RF-17 | 5 |
| M14 Plan microcurrículo y seguimiento | RF-18, RF-19 | 5 |
| M15 Calificaciones | RF-20 | 6 |
| M16 Reportes y exportación | RF-21 | 6 |
| MT1 Periodos académicos | RF-26 | 1 |
| MT2 Auditoría | RF-23 | 3 |
| MT3 Respaldos | RF-24 | 3 |
| MT4 Notificaciones | RF-22 | 6 |

**Total de puntos:** 135 puntos de historias de usuario (Doc2), distribuidos como 26 + 22 + 24 + 21 + 26 + 16 en los sprints 1 a 6, más la historia técnica HU-T1 en el Sprint 0.
