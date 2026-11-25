# Identificación de Actores — Sistema Académico Universitario

**Proyecto:** Proyecto Final Ingeniería de Software II
**Versión:** 1.0
**Fuentes:** Doc1 (clases Administrador, Coordinador, Docente, Estudiante y SensorAsistencia) y Doc2 (roles de HU-01..HU-24, alertas A-01..A-07 y §8).

**Criterio de identificación:** es actor toda persona, dispositivo o sistema que interactúa con el software para obtener un resultado, recibe un servicio del sistema o le provee datos. Los roles de proceso de Doc2 (Product Owner, Scrum Master, Analista, Desarrolladores, Responsable de integración) **no son actores del sistema**: intervienen en el desarrollo, no usan la aplicación.

---

## 1. Tabla maestra de actores

| # | Actor | Tipo | Rol en el sistema | Descripción |
|---|---|---|---|---|
| A-1 | **Administrador** | Principal | ADMINISTRADOR | Responsable de gestionar todo el sistema académico. Crea y mantiene la estructura (facultades, sedes, programas, aulas, materias), las personas (estudiantes, docentes, coordinadores) y los módulos transversales (auditoría, respaldos, periodos). En Doc2 es el usuario de HU-01 a HU-08, HU-23 y HU-24 |
| A-2 | **Coordinador** | Principal | COORDINADOR | Persona encargada de uno o más programas: organiza la carga académica, consulta horarios, gestiona microcurrículo, plan y competencias, ve el seguimiento de todos los grupos y genera reportes. Usuario de HU-05 (como objeto), HU-09, HU-10, HU-16 a HU-19 y HU-21 |
| A-3 | **Docente** | Principal | DOCENTE | Dicta las materias que le han sido asignadas (MateriaDocente). Visualiza su horario, consulta y registra la asistencia de sus grupos, marca el avance del plan de microcurrículo y registra las calificaciones. Usuario de HU-12, HU-13 (observa el resultado), HU-14, HU-19 y HU-20 |
| A-4 | **Estudiante** | Principal | ESTUDIANTE | Se inscribe en los grupos de su programa, crea y consulta su horario académico, consulta sus asistencias, su avance del plan y sus calificaciones. Usuario de HU-11, HU-15, HU-19 (consulta) |
| A-5 | **SensorAsistencia** | Secundario (no humano) | Dispositivo | Dispositivo electrónico que lee la identificación de quien llega al aula y registra la asistencia en la sesión correspondiente (Doc1: atributos `CodigoSensor`, `CodigoAula`, `NombreAula`; método `RegistrarAsistencia`). Sustituido en desarrollo por el simulador de sensor con la misma interfaz |
| A-6 | **Sistema de respaldos** | Secundario (sistema) | Proceso automático | Proceso que ejecuta el respaldo diario de la base de datos, genera la copia fuera del servidor, registra el resultado y dispara la alerta A-03 cuando falla. Sostiene HU-24 y RNF-15 |
| A-7 | **Sistema de notificaciones** | Secundario (sistema) | Proceso automático | Capa de correo con transportador configurable que entrega avisos de cambios de horario, inasistencias reiteradas y alertas A-01 a A-07 en menos de 5 minutos, sin duplicados. Sostiene HU-22 y RNF-20 |

---

## 2. Actores principales

### 2.1 Administrador (A-1)

| Campo | Contenido |
|---|---|
| Tipo / Rol | Principal / ADMINISTRADOR |
| Descripción | Encargado de gestionar todo el sistema académico (Doc1, clase Administrador). En Doc2 declara las historias HU-01..HU-08, HU-23 y HU-24 y es el destinatario de las alertas de nivel 1 |
| Métodos de Doc1 | GestionarCoordinador, GestionarDocente, GestionarEstudiante, GestionarFacultad, GestionarPrograma, GestionarAula, GestionarMateria |
| Motivación | Mantener la estructura institucional completa, vigente y trazable; garantizar que la información académica no se pierda |

**Qué puede hacer**

| Módulo | Capacidad del administrador |
|---|---|
| M1 Autenticación | Desbloquear cuentas y restablecer contraseñas (Doc2 A-02: "restablecimiento de la cuenta por el administrador") |
| M3 / M4 Estructura | Crear, editar, consultar y dar de baja lógica facultades, sedes, programas y aulas |
| M5 / M6 / M7 Personas | Registrar y actualizar estudiantes, docentes y coordinadores; dar de baja lógica conservando historial |
| M8 / M9 Oferta | Gestionar materias, asignar materias a docentes y administrar aulas |
| M10 / M11 | Consultar la carga académica y los horarios de toda la institución |
| M12 / M13 / M14 / M15 | Consultar asistencia, microcurrículo, plan y calificaciones (nunca editar notas: RN-27) |
| M16 Reportes | Generar reportes de asistencia y carga académica con exportación |
| MT1 Periodos | Crear, cerrar y consultar periodos académicos |
| MT2 / MT3 | Consultar la bitácora (solo lectura) y ejecutar respaldos y restauraciones |
| MT4 Notificaciones | Configurar la capa de correo y recibir las alertas |

**Qué no puede hacer:** editar la bitácora (RN-42), editar calificaciones de un grupo (RN-27), modificar los porcentajes sin cumplir RN-52, eliminar entidades con dependencias (RN-08, RN-09, RN-48).

**Casos de uso asociados:** CU-01, CU-02, CU-03, CU-04, CU-05, CU-06, CU-07, CU-08, CU-09, CU-21, CU-23, CU-24, CU-25, CU-26.

### 2.2 Coordinador (A-2)

| Campo | Contenido |
|---|---|
| Tipo / Rol | Principal / COORDINADOR |
| Descripción | Persona encargada de uno o más programas (Doc1: relación con Programa; Doc2 HU-05: uno o más programas con coordinador vigente). Es el dueño del ciclo académico de su programa |
| Métodos de Doc1 | GestionarCargaAcademica, ConsultarHorarioDocente, ConsultarHorarioEstudiante, GestionarMicrocurriculo, GestionarPlanMicrocurriculo, SeguimientoMicrocurriculo |
| Motivación | Armar el semestre sin choques, mantener actualizado el microcurrículo y su plan, y tomar decisiones con reportes |

**Qué puede hacer:** gestionar la carga académica de sus programas con validación de choques (RN-11..RN-14); consultar horarios de docentes y estudiantes **solo de su programa** (RN-16, HU-10); gestionar microcurrículo, competencias y plan de las materias de su programa; ver el avance de **todos** los grupos (HU-19); generar reportes exportables (HU-21); consultar su propio perfil y recibir notificaciones.

**Qué no puede hacer:** gestionar estructura institucional (facultades, sedes, aulas, materias: solo consulta), administrar usuarios de otros roles, editar calificaciones (RN-27), consultar bitácora o respaldos, ver datos de programas ajenos.

**Casos de uso asociados:** CU-01, CU-03 (consulta), CU-05 (consulta), CU-10, CU-11, CU-16, CU-17, CU-18, CU-19 (vista consolidada), CU-21, CU-25 (consulta).

### 2.3 Docente (A-3)

| Campo | Contenido |
|---|---|
| Tipo / Rol | Principal / DOCENTE |
| Descripción | Persona que dicta las materias asignadas en la clase MateriaDocente. Visualiza su horario, consulta la asistencia de sus grupos, hace seguimiento al plan y registra calificaciones |
| Métodos de Doc1 | SeguimientoPlanMicrocurriculo, GestionarCalificaciones, CrearHorarioAcademico, VisualizarHorarioAcademico, VisualizarAsistenciaEstudiantes |
| Motivación | Preparar sus clases con un horario confiable, registrar asistencia sin pasar lista y calificar a sus estudiantes con trazabilidad |

**Qué puede hacer:** ver **solo sus grupos** del periodo vigente (RN-17, RN-35); consultar la asistencia de sus grupos por fecha y tema con presentes, ausentes y tardanzas (HU-14); registrar asistencia manual como contingencia del sensor (RN-36, A-01); marcar el avance del plan de microcurrículo (HU-19); crear y modificar calificaciones **solo de sus grupos** en el rango 0.0–5.0 (RN-25, RN-27, RN-28); consultar su perfil.

**Qué no puede hacer:** ver horarios o asistencias de otros docentes, inscribir estudiantes, editar la estructura académica, editar notas fuera de su grupo o fuera del periodo de calificación, ver bitácora o respaldos.

**Casos de uso asociados:** CU-01, CU-11 (horario propio), CU-12 (consulta), CU-13 (observa la lista), CU-14, CU-19 (marca avance), CU-20, CU-22 (recibe notificaciones).

### 2.4 Estudiante (A-4)

| Campo | Contenido |
|---|---|
| Tipo / Rol | Principal / ESTUDIANTE |
| Descripción | Persona inscrita en un programa y en uno o más grupos. Crea su horario, consulta sus asistencias, su avance del plan y sus calificaciones |
| Métodos de Doc1 | CrearHorarioAcademico, VisualizarHorarioAcademico, VisualizarAsistencias, SeguimientoPlanMicrocurriculo |
| Motivación | Saber dónde y cuándo tiene clase, cuántas faltas lleva, qué se ha cubierto del curso y cómo le fue en las evaluaciones |

**Qué puede hacer:** crear su horario inscribiéndose solo en grupos con cupo (RN-15), de su programa (RN-16) y sin choque con sus otras materias (HU-11, CP-04); visualizar su horario en menos de 3 segundos (RNF-11); consultar sus asistencias con porcentaje consistente (RN-37); consultar el avance del plan en solo lectura (RN-24); consultar sus propias calificaciones; consultar sus datos personales.

**Qué no puede hacer:** editar el avance del plan, inscribirse en grupos ajenos a su programa o sin cupo, ver información de otros estudiantes (RN-53), ver datos de otros roles, editar notas o carga.

**Casos de uso asociados:** CU-01, CU-12, CU-15, CU-19 (consulta), CU-22 (recibe notificaciones), CU-25 (consulta de periodo).

---

## 3. Matriz de permisos por módulo (✓ / ✗)

**Leyenda:** ✓ = el rol tiene acceso al módulo (la columna *Observación* aclara si es gestión, consulta o alcance limitado). ✗ = sin acceso: la API devuelve 403 y el frontend no muestra la ruta.

| Módulo | Administrador | Coordinador | Docente | Estudiante | Observación de alcance |
|---|---|---|---|---|---|
| M1 Autenticación y control de acceso | ✓ | ✓ | ✓ | ✓ | Todos inician sesión; solo el administrador desbloquea cuentas (A-02) |
| M2 Dashboard por rol | ✓ | ✓ | ✓ | ✓ | Contenido distinto por rol; ningún rol ve datos de otro (RN-31) |
| M3 Facultades y sedes | ✓ | ✓ | ✗ | ✗ | Coordinador: solo consulta de la estructura |
| M4 Programas | ✓ | ✓ | ✗ | ✗ | Coordinador: solo consulta de sus programas |
| M5 Estudiantes | ✓ | ✓ | ✓ | ✓ | Coordinador: consulta de su programa; Docente: solo sus grupos; Estudiante: solo sus datos |
| M6 Docentes | ✓ | ✓ | ✓ | ✗ | Coordinador: consulta de su programa; Docente: solo su perfil |
| M7 Coordinadores | ✓ | ✓ | ✗ | ✗ | Coordinador: solo su propio perfil |
| M8 Materias y MateriaDocente | ✓ | ✓ | ✓ | ✓ | Solo el administrador gestiona (HU-06, HU-07); los demás solo consultan |
| M9 Aulas | ✓ | ✓ | ✓ | ✓ | Solo el administrador gestiona (HU-08); los demás solo consultan |
| M10 Carga académica con choques | ✓ | ✓ | ✗ | ✗ | Coordinador: gestión de sus programas; Administrador: consulta global |
| M11 Horarios semanales | ✓ | ✓ | ✓ | ✓ | Estudiante: crea e inscribe su horario; Docente: el suyo; Coordinador: los de su programa |
| M12 Asistencia (sesión, detalle, sensor) | ✓ | ✓ | ✓ | ✓ | Docente: consulta y registro manual de sus grupos; Estudiante: solo sus registros (HU-15) |
| M13 Microcurrículo y competencias | ✓ | ✓ | ✓ | ✗ | Coordinador: gestión; Docente: consulta. Estudiante: no definido en Doc1 ni Doc2 |
| M14 Plan microcurrículo y seguimiento | ✓ | ✓ | ✓ | ✓ | Docente: marca el avance; Estudiante: solo lectura (RN-24) |
| M15 Calificaciones | ✓ | ✓ | ✓ | ✓ | Solo el docente del grupo edita (RN-27); los demás solo consultan |
| M16 Reportes y exportación | ✓ | ✓ | ✗ | ✗ | Doc2 HU-21 asigna la generación al coordinador; el administrador genera reportes institucionales |
| MT1 Periodos académicos | ✓ | ✓ | ✓ | ✓ | Solo el administrador crea y cierra periodos (RN-41) |
| MT2 Auditoría / bitácora | ✓ | ✗ | ✗ | ✗ | HU-23: "como administrador"; siempre de solo lectura (RN-42) |
| MT3 Respaldos y restauración | ✓ | ✗ | ✗ | ✗ | HU-24: "como administrador" |
| MT4 Notificaciones por correo | ✓ | ✓ | ✓ | ✓ | Administrador configura; los demás reciben y consultan los suyos (RN-45, RN-46) |

**Resumen por rol**

| Rol | Módulos con acceso | Módulos con gestión completa |
|---|---|---|
| ADMINISTRADOR | 20 de 20 | M3, M4, M5, M6, M7, M8, M9, M10 (consulta global), M16, MT1, MT2 (consulta), MT3, MT4 (configuración) |
| COORDINADOR | 18 de 20 (sin MT2 y MT3) | M10 (su programa), M14 (plan), M16 (reportes) |
| DOCENTE | 13 de 20 (sin M3, M4, M7, M10, M16, MT2, MT3) | M12 (consulta y registro manual de sus grupos), M14 (marca de avance), M15 (notas de sus grupos) |
| ESTUDIANTE | 11 de 20 (sin M3, M4, M6, M7, M10, M13, M16, MT2, MT3) | M11 (inscripción de su propio horario) |

*Interpretación adoptada:* el conteo de módulos por rol es una lectura de síntesis de la matriz; la fuente obligatoria es la propia matriz y los criterios de aceptación de HU-01 a HU-24.

---

## 4. Actores secundarios

### 4.1 SensorAsistencia (A-5) — actor no humano

| Campo | Contenido |
|---|---|
| Tipo | Secundario (dispositivo no humano) |
| Origen | Doc1: clase SensorAsistencia con atributos `CodigoSensor`, `CodigoAula`, `NombreAula` y método `RegistrarAsistencia`; relación con la clase Asistencia |
| Descripción | Dispositivo electrónico colocado en el aula que lee la identificación de la persona que llega y envía el registro a la sesión de asistencia correspondiente. En desarrollo se implementa como **simulador de sensor** con la misma interfaz, reemplazable por el hardware real (ADR-08) |
| Entradas | Identificación leída (documento o tarjeta), código de aula, marca de tiempo |
| Salidas | Registro en `DetalleAsistencia` con identificación, nombre, correo, estado y hora; indicación al usuario de que la persona ya estaba registrada (RN-19); registros en cola local cuando no hay red (RN-20) |
| Validaciones que respeta | RN-18 (estudiante inscrito, sesión activa, coincidencia con el horario), RN-19 (sin duplicados), RN-20 (cola offline) |
| Comportamiento en falla | Si no reporta 5 minutos en horario de clase se dispara la alerta A-01; el docente registra manualmente en la misma tabla (RN-36) |
| Punto de control | HU-T1 en el Sprint 0: si demora más de 2 segundos por persona o no conecta de forma estable, el sensor se mueve al Sprint 6 y se entrega primero el registro manual |
| Casos de uso | CU-13 (participa como ejecutor), CU-14 y CU-15 (proveen los datos que se consultan) |
| Riesgo asociado | R-01 (crítico, P×I = 16) |

### 4.2 Sistema de respaldos (A-6) — actor no humano

| Campo | Contenido |
|---|---|
| Tipo | Secundario (proceso automático) |
| Origen | Doc2 HU-24, alerta A-03, riesgo R-06, §8 |
| Descripción | Proceso programado que respalda la base de datos todos los días, genera la copia fuera del servidor, registra el resultado y notifica los fallos |
| Disparador | Programación diaria; también ejecución manual por el administrador (`POST /api/respaldos`) |
| Salidas | Archivo de respaldo con copia externa; registro de estado en el sistema; alerta A-03 si no termina o si la copia externa no se genera |
| Responsabilidad | Pérdida máxima de datos: 24 horas; soporta la restauración en menos de 2 horas (RNF-15, RNF-16) |
| Contingencia | Si falla dos días seguidos se detiene el despliegue de cambios hasta tener un respaldo válido (A-03) |
| Casos de uso | CU-24 (como ejecutor automático) y CU-26 |
| Riesgo asociado | R-06 (alto, P×I = 10) |

### 4.3 Sistema de notificaciones (A-7) — actor no humano

| Campo | Contenido |
|---|---|
| Tipo | Secundario (proceso automático) |
| Origen | Doc2 HU-22 y §8 (cada alerta llega por correo al responsable y al Scrum Master; las de nivel 1 también al celular) |
| Descripción | Capa de correo con transportador configurable (en desarrollo: consola/log; en producción: credenciales por variable de entorno) que entrega avisos y alertas |
| Disparadores | Cambio de horario de un grupo; inasistencias reiteradas de un estudiante; alertas A-01 (sensor sin señal), A-02 (intentos de acceso sospechosos), A-03 (respaldo fallido), A-04 (servicio lento o caído), A-05 (choque de horario en producción), A-06 (cambio de notas anómalo), A-07 (disco ≥ 80%) |
| Salidas | Correo electrónico registrado en la entidad `Notificacion` con destinatario, asunto, estado e intentos; notificación al celular para alertas de nivel 1 |
| Restricciones | Entrega en menos de 5 minutos y sin duplicados (RN-45); destinatarios por alerta según §8 (RN-46) |
| Casos de uso | CU-22 y CU-26 (como ejecutor) |
| Riesgo asociado | Falla clasificada como nivel 3 (media) en Doc2 §7 si el correo no se envía |

---

## 5. Catálogo de casos de uso

| CU | Nombre del caso de uso | Actor principal | Actor(es) secundario(s) | RF asociada |
|---|---|---|---|---|
| CU-01 | Iniciar sesión con correo y contraseña | Los cuatro roles | — | RF-01 |
| CU-02 | Gestionar facultades y sedes | Administrador | — | RF-02, RF-25 |
| CU-03 | Gestionar programas | Administrador (gestión) / Coordinador (consulta) | — | RF-02 |
| CU-04 | Registrar y actualizar estudiantes | Administrador | — | RF-03 |
| CU-05 | Gestionar docentes | Administrador (gestión) / Coordinador (consulta) | — | RF-04 |
| CU-06 | Gestionar coordinadores y asignarlos a programas | Administrador | — | RF-05 |
| CU-07 | Gestionar materias | Administrador | — | RF-06 |
| CU-08 | Asignar materias a docentes (MateriaDocente) | Administrador | — | RF-07 |
| CU-09 | Gestionar aulas | Administrador | — | RF-08 |
| CU-10 | Gestionar la carga académica con detección de choques | Coordinador | — | RF-09 |
| CU-11 | Consultar el horario de un docente o estudiante | Coordinador (su programa) / Administrador (global) | — | RF-10 |
| CU-12 | Crear y visualizar el horario académico | Estudiante (crea) / Docente (visualiza el suyo) | — | RF-11, RF-12 |
| CU-13 | Registrar asistencia con el sensor (o simulador) | Docente (responsable de la sesión) | SensorAsistencia | RF-13 |
| CU-14 | Consultar la asistencia de mis grupos por fecha y tema | Docente | SensorAsistencia (provee los datos) | RF-14 |
| CU-15 | Visualizar mis asistencias por materia | Estudiante | SensorAsistencia (provee los datos) | RF-15 |
| CU-16 | Gestionar el microcurrículo de cada materia | Coordinador | — | RF-16 |
| CU-17 | Registrar competencias específicas por unidad temática | Coordinador | — | RF-17 |
| CU-18 | Gestionar el plan de microcurrículo por periodo y docente | Coordinador | — | RF-18 |
| CU-19 | Hacer seguimiento / consultar el avance del plan | Docente (marca) / Estudiante (consulta) / Coordinador (todos los grupos) | — | RF-19 |
| CU-20 | Registrar y modificar calificaciones | Docente (solo sus grupos) | — | RF-20 |
| CU-21 | Generar reportes de asistencia y carga académica | Coordinador / Administrador | — | RF-21 |
| CU-22 | Recibir notificaciones por correo | Estudiante / Docente (destinatarios) | Sistema de notificaciones | RF-22 |
| CU-23 | Consultar la bitácora de auditoría | Administrador | — | RF-23 |
| CU-24 | Respaldar y restaurar la base de datos | Administrador | Sistema de respaldos | RF-24 |
| CU-25 | Gestionar periodos académicos | Administrador | — | RF-26 |
| CU-26 | Ejecutar respaldos automáticos y enviar alertas | — (iniciado por el sistema) | Sistema de respaldos, Sistema de notificaciones | RF-24, RF-22 |

---

## 6. Relaciones y reglas de autorización asociadas

| Relación | Detalle |
|---|---|
| CU-01 → todos los demás casos | Precondición obligatoria: sesión autenticada con el rol correspondiente (RN-31) |
| CU-13 **incluye** "validar estudiante inscrito, sesión activa y horario" | RN-18; si falla, el registro se rechaza y no se escribe en `DetalleAsistencia` |
| CU-13 **incluye** "registrar en modo sin red" | RN-20: cola local y sincronización posterior sin duplicados |
| CU-14 y CU-15 **leen** el resultado de CU-13 | Mismo origen de datos: el porcentaje del estudiante coincide con los registros del sensor (RN-37) |
| CU-20 **extiende** CU-23 | Todo cambio de nota genera entrada en la bitácora (RN-34, RN-51) |
| CU-24 **incluye** "verificar integridad tras la restauración" | RN-44: sin registros huérfanos y en menos de 2 horas |
| CU-26 **dispara** las alertas A-01 a A-07 | RN-46: correo al responsable y al Scrum Master; nivel 1 también al celular |
| Autorización transversal | Cada caso se protege en backend con `requiereRol(...)` y en frontend con guards de ruta (RN-31, RNF-06) |

---

**Total: 7 actores (4 principales, 3 secundarios) y 26 casos de uso.**
