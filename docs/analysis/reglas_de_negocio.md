# Reglas de Negocio — Sistema Académico Universitario

**Proyecto:** Proyecto Final Ingeniería de Software II
**Versión:** 1.0
**Fuentes:** Doc1 (18 clases del enunciado) y Doc2 (criterios de aceptación de HU-01..HU-24, CP-01..CP-06, alertas A-01..A-07 y riesgos R-01..R-10).

**Lectura de la tabla:**

| Columna | Significado |
|---|---|
| **Enunciado** | La regla tal como se aplica en el sistema |
| **Origen** | De dónde sale: Doc1 (clase/método), Doc2 (HU-n, CP-n, A-n, R-n) o *Interpretación adoptada* |
| **Fuente de verdad** | Dónde se valida de forma exclusiva: endpoint REST + validación (Zod / Prisma / restricción en base de datos) |
| **Mensaje de error al usuario** | Texto en español que muestra la interfaz cuando la regla se viola |

**Nota de numeración:** la numeración RN-01..RN-53 es estable y se usa igual en `requerimientos_funcionales.md`, `identificacion_de_actores.md` y `matriz_trazabilidad.md`. Las reglas se presentan agrupadas temáticamente; los identificadores no son correlativos dentro de cada grupo.

---

## 1. Identidad y unicidad (RN-01 .. RN-07)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-01 | El código de una facultad es único en el sistema; no se puede crear ni editar una facultad con un código ya registrado | Doc2 HU-02; Doc1 clase Facultad (`CodigoFacultad`) | `POST/PUT /api/facultades` → validación Zod + `@@unique([codigo])` en Prisma | "El código de facultad ya está registrado. Use un código diferente." |
| RN-02 | El código de un programa es único en el sistema | Doc2 HU-02; Doc1 clase Programa (`CodigoPrograma`) | `POST/PUT /api/programas` → validación Zod + restricción única en BD | "El código de programa ya está registrado. Use un código diferente." |
| RN-03 | El código de una materia es único en el sistema | Doc2 HU-06 ("Código único"); Doc1 clase Materia (`CodigoMateria`) | `POST/PUT /api/materias` → validación Zod + restricción única en BD | "El código de materia ya está registrado. Use un código diferente." |
| RN-04 | El código de un aula es único en el sistema | Doc2 HU-08 ("Código único"); Doc1 clase Aula (`CodigoAula`) | `POST/PUT /api/aulas` → validación Zod + restricción única en BD | "El código de aula ya está registrado. Use un código diferente." |
| RN-05 | El documento de identidad de un estudiante es único: no se puede registrar dos estudiantes con el mismo documento | Doc2 HU-03 ("documento duplicado se rechaza"); Doc1 clase Estudiante (`IdEstudiante`, `TipoDocumento`) | `POST/PUT /api/estudiantes` → validación Zod + restricción única en BD sobre (tipoDocumento, numeroDocumento) | "Ya existe un estudiante con ese documento. Verifique los datos antes de continuar." |
| RN-06 | El correo electrónico es único entre usuarios y personas (estudiantes, docentes y coordinadores); no se aceptan duplicados ni registros con formato inválido | Doc2 HU-04 ("correo único"), HU-03 (correo obligatorio), R-08 (claves únicas: documento, correo, códigos) | `POST/PUT /api/estudiantes`, `/api/docentes`, `/api/coordinadores`, `/api/usuarios` → validación Zod de formato + restricción única en BD | "Ese correo ya está registrado en el sistema. Use otro correo." |
| RN-07 | El código de una sede es único en el sistema | Doc1: atributo `Sede` de la clase Asistencia sin clase que lo sustente; *Interpretación adoptada* (RF-25) | `POST/PUT /api/sedes` → validación Zod + restricción única en BD | "El código de sede ya está registrado. Use un código diferente." |

---

## 2. Integridad referencial, eliminación y bajas (RN-08 .. RN-10, RN-48)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-08 | No se puede eliminar un programa que tenga estudiantes inscritos, carga académica, microcurrículos o coordinadores asignados; la eliminación es lógica | Doc1 clase Programa (relaciones con Estudiante, CargaAcademica, Microcurriculo); Doc2 R-06 (baja lógica en vez de borrado físico) | `DELETE /api/programas/:id` → conteo de dependencias antes de operar; en caso de existir dependencia se responde 409 | "No se puede eliminar: el programa tiene registros dependientes (estudiantes, carga académica o microcurrículos). Use la baja lógica." |
| RN-09 | No se puede eliminar un aula que tenga horarios o carga académica asignados | Doc2 HU-08 ("un aula con horarios asignados no se elimina"); Doc1 clase Aula (relación con Asistencia) | `DELETE /api/aulas/:id` → conteo de dependencias (carga académica, horarios, sesiones de asistencia) antes de operar; 409 en caso contrario | "No se puede eliminar: el aula tiene horarios o clases asignadas. Desasígnelos primero." |
| RN-10 | Las personas (estudiantes, docentes, coordinadores) y sus dependencias se dan de baja de forma **lógica**, conservando todos sus datos e historial; nunca se borran físicamente | Doc2 HU-04 ("baja lógica; conserva su historial"), R-06 (baja lógica en vez de borrado físico) | `DELETE /api/estudiantes/:id`, `/api/docentes/:id`, `/api/coordinadores/:id` → actualizan `estado = INACTIVO` (soft delete); la bitácora registra la acción (RN-34) | Registro dado de baja. Los datos y el historial se conservan; puede reactivarlo un administrador. |
| RN-48 | No se puede eliminar una facultad que tenga programas asociados | Doc2 HU-02 ("no se elimina una facultad con programas"); Doc1 clase Facultad (relación con Programa) | `DELETE /api/facultades/:id` → conteo de programas; 409 si existe al menos uno | "No se puede eliminar: la facultad tiene programas asociados. Elimine o traslade primero los programas." |

---

## 3. Estructura académica (RN-26, RN-29, RN-47, RN-49)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-26 | Un programa tiene **un** coordinador vigente a la vez; un coordinador puede estar asignado a **uno o más** programas con fechas de vigencia | Doc2 HU-05 ("un coordinador se asigna a uno o más programas; un programa tiene un coordinador vigente"); Doc1 clase Coordinador (relación con Programa) | `POST/PUT /api/coordinadores/:id/programas` → transacción que cierra la vigencia anterior y abre la nueva; restricción de unicidad sobre programa con estado VIGENTE | "El programa ya tiene un coordinador vigente. Finalice la asignación actual antes de crear una nueva." |
| RN-29 | Todo estudiante queda vinculado a una facultad y a un programa coherentes entre sí (el programa debe pertenecer a la facultad declarada) | Doc2 HU-03 ("el estudiante queda asociado a facultad y programa"); Doc1 clase Estudiante (`CodigoFacultad`, `CodigoPrograma`) | `POST/PUT /api/estudiantes` → validación cruzada de pertenencia programa→facultad antes de persistir | "El programa seleccionado no pertenece a la facultad indicada. Verifique la asignación." |
| RN-47 | Los créditos de una materia son mayores que cero | Doc2 HU-06 ("créditos mayores que cero"); Doc1 clase Materia (`NumeroCreditos`) | `POST/PUT /api/materias` → validación Zod `min(1)` | "Los créditos deben ser un número mayor que cero." |
| RN-49 | El campo `NumeroProgramas` de la facultad se actualiza automáticamente al crear o eliminar (lógicamente) un programa; nunca se edita a mano | Doc2 HU-02 ("NumeroProgramas de la facultad se actualiza solo"); Doc1 clase Facultad (`NumeroProgramas`) | Servicio de programas dentro de la misma transacción que crea/actualiza el programa; valor derivado, no expuesto a escritura en `PUT /api/facultades/:id` | Campo calculado: el número de programas se actualiza automáticamente. No es editable. |

---

## 4. Carga académica, horarios e inscripción (RN-11 .. RN-17, RN-35)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-11 | No se puede asignar un docente a un bloque de día y hora en el que ya tiene otra clase: se rechaza el **choque de docente**. Las horas contiguas (por ejemplo 8:00–10:00 y 10:00–12:00) **no** son choque | Doc2 HU-09, CP-02 (caso A rechazado, caso C aceptado por ser horas contiguas), R-04, A-05 | `POST/PUT /api/carga-academica` → validación de traslape de intervalos (mismo día, `horaInicio < existente.horaFin AND existente.horaInicio < horaFin`) + restricción única en BD | "El docente ya tiene clase en ese día y hora. No se guardó el registro." |
| RN-12 | No se puede asignar un aula a un bloque de día y hora en el que ya está ocupada: se rechaza el **choque de aula**. Las horas contiguas no son choque | Doc2 HU-09, CP-02 (caso B rechazado), R-04, A-05 | `POST/PUT /api/carga-academica` → misma validación de traslape sobre `aula + dia + intervalo` + restricción única en BD | "El aula está ocupada en ese día y hora. No se guardó el registro." |
| RN-13 | No se puede asignar el mismo **grupo** a dos bloques de día y hora superpuestos (un grupo no puede estar en dos lugares al mismo tiempo) | Doc2 HU-09 ("choques de docente o de aula" extendido al grupo como unidad de programación) e *Interpretación adoptada* para cubrir la programación por grupo | `POST/PUT /api/carga-academica` → validación de traslape sobre `programa + materia + grupo + dia + intervalo` | "El grupo ya tiene clase en ese día y hora. Verifique la programación del grupo." |
| RN-14 | Toda asignación de carga académica, inscripción de grupo, plan microcurrículo y registro de nota debe pertenecer a un **periodo académico vigente**; con el periodo cerrado la operación se rechaza | Doc2 HU-09 ("la carga se guarda por periodo"), HU-11 y HU-12 ("periodo vigente"), HU-18, R-07 y A-06 (cierre de notas por periodo); Doc1 atributos `PeriodoCarga`, `PeriodoAcademico` | `POST/PUT /api/carga-academica`, `POST /api/horarios/estudiante/grupos`, `POST /api/planes-microcurriculo`, `PUT /api/grupos/:id/calificaciones` → validación contra `PeriodoAcademico.estado = VIGENTE` | "La operación no está permitida: no hay periodo académico vigente o el periodo está cerrado." |
| RN-15 | Un estudiante solo puede inscribirse en un grupo si tiene **cupo** disponible | Doc2 HU-11 y CP-04 (caso G-C rechazado "por falta de cupo"); Doc1 no define cupo → *Interpretación adoptada* (RF-06 de diferencias) | `POST /api/horarios/estudiante/grupos` → transacción que cuenta inscritos `< cupo` y incrementa; restricción de capacidad en BD | "El grupo no tiene cupo disponible. No se pudo inscribir." |
| RN-16 | Un estudiante solo puede inscribirse en grupos de **su propio programa**; y solo ve en el sistema los grupos de su programa | Doc2 HU-03 (vinculación a programa), HU-10 ("solo ve personas de su programa"), CP-04 (precondición: estudiante activo en un programa) | `POST /api/horarios/estudiante/grupos` → comparación `grupo.programa == estudiante.programa`; middleware de autorización en lectura | "Ese grupo pertenece a otro programa. No se puede inscribir." |
| RN-17 | Un docente solo ve y consulta sus propios grupos y asistencias; no puede consultar información de grupos de otros docentes | Doc2 HU-12 ("solo mis grupos"), HU-14 ("sus grupos"), HU-10 ("solo ve personas de su programa"); Doc1 métodos `VisualizarHorarioAcademico` y `VisualizarAsistenciaEstudiantes` del Docente | `GET /api/horarios/docente/me`, `GET /api/asistencias` → filtro obligatorio por `idDocente = usuario.id` en el backend, nunca por parámetro enviado por el cliente | "No tiene permiso para consultar información de otros grupos." |
| RN-35 | El horario del docente refleja los cambios de la carga académica: no almacena copias independientes que puedan quedar desactualizadas | Doc2 HU-12 ("refleja cambios de la carga académica") | `GET /api/horarios/docente/me` → vista/proyección derivada de `CargaAcademica` del periodo vigente (Interpretación adoptada: se consulta la carga, no una tabla duplicada) | — (regla de diseño; no genera mensaje de error al usuario) |

---

## 5. Asistencia y sensor (RN-18 .. RN-20, RN-36, RN-37)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-18 | El sensor solo registra asistencia cuando: la persona es un **estudiante inscrito en el grupo** de la sesión, la **sesión está activa** y coincide con el **horario** del grupo (día y hora); en cualquier otro caso se rechaza el registro | Doc2 HU-13, CP-03 (E3 no inscrito se rechaza), precondiciones de CP-03 (sesión creada con docente responsable, sensor asociado al aula) | `POST /api/sensor/asistencias` → validación en el servicio de asistencia: `DetalleAsistencia` con joins a inscripción, `Asistencia.estado = ACTIVA` y `CargaAcademica` del periodo vigente | "Registro rechazado: el estudiante no está inscrito en el grupo, la sesión no está activa o no corresponde al horario de la clase." |
| RN-19 | Una misma persona **no se puede registrar dos veces** en la misma sesión de asistencia; el sensor lo indica y el sistema no crea un segundo registro | Doc2 HU-13 ("una persona no se registra dos veces en la misma sesión"), CP-03 (pasos 2 y 5) | `POST /api/sensor/asistencias` → restricción única `(CodigoAsistencia, IdEstudiante)` en BD; respuesta idempotente 200 con el registro existente | "El estudiante ya está registrado en esta sesión." |
| RN-20 | Si el sensor no tiene red, guarda los registros en una cola local y los sincroniza al recuperar la conexión **sin duplicar** registros ya existentes | Doc2 HU-13 ("si no hay red, guarda localmente y sincroniza después"), CP-03 (pasos 4 y 5), R-01 | `POST /api/asistencias/:id/sincronizar` → aplicación en lote con la misma restricción única de RN-19 y registro de resultados por elemento (aceptado / duplicado / rechazado) | "Registro pendiente de sincronización; se omitió porque ya existía en el servidor." |
| RN-36 | Ante la falla del sensor (alerta A-01), el docente puede registrar la asistencia **manualmente en la misma tabla de detalle**, con el mismo formato y estados | Doc2 A-01 (contingencia: "El docente registra la asistencia manualmente en la misma tabla DetalleAsistencia") | `POST /api/asistencias/:id/detalles` con `origen = MANUAL` (mismo endpoint y misma entidad que el registro del sensor) | "No se pudo registrar la asistencia manual. Verifique que la sesión esté activa." |
| RN-37 | El porcentaje de asistencia que ve el estudiante **coincide exactamente** con los registros del sensor (mismo origen de datos, sin cálculos paralelos) | Doc2 HU-15 ("el porcentaje de asistencia coincide con los registros del sensor") | `GET /api/asistencias/mis-registros` → cálculo en el backend sobre `DetalleAsistencia` del estudiante autenticado | — (regla de consistencia; no genera mensaje de error al usuario) |

---

## 6. Microcurrículo y competencias específicas (RN-21, RN-22, RN-32, RN-38)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-21 | Todo microcurrículo y toda competencia específica guardan los cuatro niveles de desempeño (**Superior, Normal, Bajo, Deficiente**) con descripción; y el microcurrículo guarda los tres parciales | Doc2 HU-16 y HU-17 ("los cuatro niveles de desempeño y los tres parciales quedan guardados"; "los niveles Superior, Normal, Bajo y Deficiente tienen descripción"); Doc1 atributos `NivelSuperior/NivelNormal/NivelBajo/NivelDeficiente`, `PrimerParcial/SegundoParcial/TercerParcial` | `POST/PUT /api/microcurriculos` y `/api/microcurriculos/:id/competencias` → esquema Zod con los cuatro niveles y los tres parciales como campos requeridos | "Debe completar los cuatro niveles de desempeño (Superior, Normal, Bajo, Deficiente) antes de guardar." |
| RN-22 | El microcurrículo no se guarda con campos obligatorios vacíos (objetivo general, objetivos específicos, competencias genéricas, descripción, departamento oferente, tipo y naturaleza de asignatura, referencias y estrategias) | Doc2 HU-16 ("Campos obligatorios completos"); Doc1 clase Microcurriculo (lista completa de atributos) | `POST/PUT /api/microcurriculos` → validación Zod con campos requeridos | "Faltan campos obligatorios del microcurrículo. Complete la información requerida." |
| RN-32 | Cada competencia específica pertenece exactamente a **un** microcurrículo y su código es único dentro de él | Doc2 HU-17 ("cada competencia pertenece a un microcurrículo"); Doc1 clase ContenidoCompetenciasEspecificas (`CodigoCompetencia`, `CodigoMicrocurriculo`) | `POST/PUT /api/microcurriculos/:id/competencias` → validación de pertenencia + restricción única sobre (microcurriculo, codigoCompetencia) | "La competencia ya existe en este microcurrículo o no pertenece a él." |
| RN-38 | Los prerrequisitos de una materia deben existir en el catálogo de materias y no formar ciclos (no puede ser prerrequisito de sí misma ni dependerse de forma circular) | Doc2 HU-16 ("prerrequisitos válidos"); Doc1 atributo `Prerequisitos` del Microcurriculo | `POST/PUT /api/microcurriculos` → validación de existencia + detección de ciclos en el grafo de prerrequisitos | "Los prerrequisitos no son válidos: verifique que existan y que no generen ciclos." |

---

## 7. Plan microcurrículo y seguimiento (RN-23, RN-24, RN-39)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-23 | Todo plan de microcurrículo queda ligado a **un microcurrículo, un docente y un periodo académico**; no puede existir un plan "huérfano" | Doc2 HU-18 ("El plan queda ligado a microcurrículo, docente y periodo"); Doc1 clase PlanMicrocurriculo (`CodigoMicrocurriculo`, `PeriodoAcademico`, datos del docente) | `POST/PUT /api/planes-microcurriculo` → validación Zod de las tres referencias obligatorias + llaves foráneas en BD | "El plan debe estar asociado a un microcurrículo, un docente y un periodo académico." |
| RN-24 | El avance del plan lo marca **solo el docente**; el estudiante lo consulta en modo solo lectura; el coordinador ve el avance de todos los grupos de su programa | Doc2 HU-19 ("El docente marca el avance por unidad; el estudiante ve el avance sin poder editarlo; el coordinador ve el avance de todos los grupos") | `PUT /api/planes/:id/avance` → middleware de rol que exige DOCENTE y pertenencia al plan; `GET` permitido a ESTUDIANTE y COORDINADOR con filtros por rol | "No tiene permiso para modificar el avance del plan de microcurrículo." |
| RN-39 | En el plan, la fecha de inicio es anterior o igual a la fecha de terminación, y el total de horas es coherente con el rango de fechas declarado | Doc2 HU-18 ("total de horas y fechas de inicio y fin coherentes"); Doc1 atributos `FechaInicio`, `TotalHoras`, `FechaTerminacion` | `POST/PUT /api/planes-microcurriculo` → validación Zod de fechas y coherencia con `totalHoras` | "Las fechas o el total de horas no son coherentes. Revise la información del plan." |

---

## 8. Calificaciones (RN-25, RN-27, RN-28, RN-34, RN-52)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-25 | Toda calificación está en la escala **0.0 a 5.0**; los valores 5.5, -1 o cualquier número fuera de rango se rechazan | Doc2 HU-20 ("valores entre 0.0 y 5.0"), CP-05 (5.5 y -1 rechazados) | `POST/PUT /api/grupos/:id/calificaciones` → validación Zod `min(0.0).max(5.0)` + restricción `CHECK` en BD | "La nota debe estar en el rango de 0.0 a 5.0." |
| RN-27 | Solo el **docente del grupo** puede crear o modificar calificaciones; ningún otro usuario (ni otro docente, ni coordinador, ni administrador) las edita | Doc2 HU-20 ("Solo edita sus grupos"), CP-05 (paso 6 denegado), R-07 | `POST/PUT /api/grupos/:id/calificaciones` → middleware que compara `usuario.id` con el docente asignado al grupo; respuesta 403 en caso contrario | "No tiene permiso para editar las calificaciones de este grupo." |
| RN-28 | Las notas solo se modifican dentro del **periodo de calificación** vigente; al cerrar el periodo la edición queda bloqueada y cualquier intento queda en la bitácora (alerta A-06) | Doc2 R-07 ("cierre de notas por periodo"), A-06 ("Cambio de nota fuera del periodo de calificación") | `PUT /api/grupos/:id/calificaciones` → validación de `PeriodoAcademico.estado` y ventana de calificación; `POST /api/periodos/:id/cerrar` | "La edición de notas está cerrada: el periodo de calificación no está vigente." |
| RN-34 | Toda acción crítica queda registrada en la bitácora: altas, bajas, **cambios de calificación** y **cambios de carga académica**, con usuario, fecha, hora, valor anterior y valor nuevo | Doc2 HU-23 ("altas, bajas, cambios de nota y de carga"), R-07, CP-05 (paso 7) | Servicio de auditoría invocado en cada mutación crítica (endpoints de personas, carga y calificaciones) + triggers de BD; consulta en `GET /api/auditoria` | — (regla de registro; no se interrumpe la operación del usuario) |
| RN-52 | La suma de los porcentajes de evaluación de una materia o grupo debe ser **exactamente 100%** antes de poder cerrar la configuración de evaluación; mientras no sume 100%, el cierre está bloqueado | Doc1: atributos `PrimerParcial`, `SegundoParcial`, `TercerParcial` del Microcurriculo; *Interpretación adoptada* para garantizar la coherencia de la escala 0.0–5.0 de Doc2 | `POST/PUT /api/grupos/:id/configuracion-evaluacion` → validación `suma(porcentajes) === 100` antes de permitir `estado = CERRADO` | "Los porcentajes de evaluación deben sumar exactamente 100% para cerrar la configuración." |

---

## 9. Periodos académicos (RN-41, RN-50)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-41 | Existe **un solo periodo académico vigente** a la vez; al cerrarlo se bloquean la carga académica, las inscripciones, los planes microcurrículo y la edición de notas | Doc2: periodo vigente en HU-09, HU-11, HU-12, HU-18; cierre de notas en R-07; Doc1 atributos `PeriodoCarga`, `PeriodoAcademico`, `AñoLectivo` | `POST/PUT /api/periodos` → transacción que desactiva el vigente anterior; validación cruzada en los endpoints de carga, inscripción, planes y notas | "Ya existe un periodo académico vigente. Cierre el periodo actual antes de crear otro." |
| RN-50 | Las fechas de un periodo académico son coherentes: fecha de inicio anterior o igual a la fecha de fin, y no se solapan con otro periodo | *Interpretación adoptada* sobre Doc1 (`AñoLectivo`, `PeriodoAcademico`) y Doc2 (periodo vigente) | `POST/PUT /api/periodos` → validación Zod de fechas y de no solape | "Las fechas del periodo no son coherentes o se solapan con otro periodo existente." |

---

## 10. Seguridad y control de acceso (RN-30, RN-31, RN-53)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-30 | Tras **5 intentos fallidos** consecutivos de inicio de sesión, la cuenta se **bloquea durante 15 minutos**; durante el bloqueo ningún intento se acepta (aunque la contraseña sea correcta) | Doc2 HU-01 ("cinco intentos fallidos bloquean la cuenta 15 min"), CP-01 (pasos 4 y 5), alerta A-02 | `POST /api/auth/login` → contador de intentos en base de datos con marca de bloqueo (`bloqueadoHasta`); consulta en cada autenticación | "Cuenta bloqueada por 5 intentos fallidos. Intente de nuevo en 15 minutos." |
| RN-31 | Cada rol accede **solo** a sus pantallas y a sus endpoints: un rol no puede abrir, consultar ni ejecutar acciones de otro rol (verificación en backend **y** en frontend) | Doc2 HU-01 ("un rol no puede abrir pantallas de otro"), CP-01 (paso 6: acceso denegado sin mostrar datos) | Middleware `requiereRol(...)` en cada ruta de `server/src/modules/*`; guards de rutas en `client/src/router`; respuesta 403 sin datos | "No tiene permiso para acceder a esta sección del sistema." |
| RN-53 | Los datos sensibles del estudiante (puntaje ICFES, SISBEN, datos del acudiente, documento) se exponen con **mínimo privilegio**: solo el administrador, el coordinador del programa y el propio estudiante los ven | Doc2 R-02 ("mínimo privilegio sobre campos sensibles"), nivel de falla 1 (datos expuestos) | `GET /api/estudiantes/:id` → proyección de campos según rol en el backend (el frontend nunca los solicita de más) | "No tiene permiso para consultar esta información sensible." |

---

## 11. Auditoría, respaldos y notificaciones (RN-42 .. RN-46, RN-51)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-42 | La bitácora de auditoría es de **solo lectura**: ni la API ni la interfaz permiten editar ni borrar entradas, ni siquiera para el administrador | Doc2 HU-23 ("la bitácora no se puede editar") | `GET /api/auditoria` (único endpoint de la ruta; sin `PUT`/`DELETE`) + permisos de base de datos de solo lectura sobre la tabla `BitacoraAuditoria` | "La bitácora es de solo lectura: las entradas no pueden modificarse ni eliminarse." |
| RN-51 | Cada entrada de la bitácora guarda, como mínimo: usuario responsable, fecha, hora, acción, entidad afectada, valor anterior y valor nuevo | Doc2 HU-23 ("usuario, fecha, hora y valor anterior") | Servicio de auditoría (escritura) + `GET /api/auditoria` con filtros por fecha, usuario y entidad | — (regla de registro; no se interrumpe la operación del usuario) |
| RN-43 | El respaldo de la base de datos se ejecuta **diariamente** y genera una copia **fuera del servidor**; si falla se dispara la alerta A-03 y se suspenden los despliegues hasta tener un respaldo válido | Doc2 HU-24 ("Respaldo diario y copia fuera del servidor"), A-03, R-06 | Tarea programada de respaldo + `POST/GET /api/respaldos`; registro de estado de cada ejecución | "El respaldo diario no se completó. Repita la operación y verifique espacio y permisos." |
| RN-44 | Existe un procedimiento de restauración **probado** que recupera los datos en menos de 2 horas sin generar registros huérfanos (los horarios siguen apuntando a sus estudiantes) | Doc2 HU-24 ("restauración de prueba recupera los datos en menos de 2 h"), CP-06, §8 (meta de recuperación) | `POST /api/respaldos/:id/restaurar` con verificación de integridad posterior (conteo de referencias) | "La restauración no completó la verificación de integridad. Contacte al administrador del sistema." |
| RN-45 | Toda notificación por correo se envía en **menos de 5 minutos** después del evento que la origina y **no se envían duplicados** para el mismo evento y destinatario | Doc2 HU-22 ("Envía el correo en menos de 5 min tras el cambio; no envía duplicados") | Cola de notificaciones con clave idempotente (evento + destinatario) y registro de envío en `Notificacion`; `POST /api/notificaciones/reintentar` | "La notificación no pudo enviarse. Se reintentará automáticamente." |
| RN-46 | Cada alerta (A-01 a A-07) llega por correo al responsable y al Scrum Master; las alertas de nivel 1 también llegan por mensaje al celular | Doc2 §8 | Servicio de alertas sobre la misma capa de correo (transportador configurable); registro en `Notificacion` con destinatarios por alerta | — (regla de notificación; no se interrumpe la operación del usuario) |

---

## 12. Reportes (RN-40)

| ID | Enunciado | Origen | Fuente de verdad | Mensaje de error al usuario |
|---|---|---|---|---|
| RN-40 | Todo reporte (asistencia y carga académica) refleja **exactamente** los datos del sistema para el periodo y programa filtrados, y su exportación a PDF o Excel conserva los mismos totales que la vista en pantalla | Doc2 HU-21 ("coincide con los datos del sistema"); Doc2 §7 (reporte con totales errados = falla nivel 3) | `GET /api/reportes/asistencia` y `GET /api/reportes/carga-academica?formato=pdf\|xlsx` → generación desde la misma consulta de lectura que la vista en pantalla | "El reporte no pudo generarse con los datos solicitados. Verifique el periodo y el programa." |

---

## 13. Resumen de cobertura

| Criterio de aceptación obligatorio (consignado en la tarea de análisis) | Reglas que lo cubren |
|---|---|
| Unicidad de códigos (facultad, programa, materia, aula, documento, correo) | RN-01, RN-02, RN-03, RN-04, RN-05, RN-06 (+ RN-07 sede) |
| No eliminar facultad/programa/aula con dependencias | RN-48 (facultad), RN-08 (programa), RN-09 (aula) |
| Alta/baja lógica conservando historial | RN-10 |
| Choques de docente/aula/grupo en día y hora, con horas contiguas permitidas | RN-11, RN-12, RN-13 |
| Asignaciones solo dentro de periodo académico vigente | RN-14 |
| Cupo de grupo | RN-15 |
| Estudiante solo en grupos de su programa | RN-16 |
| Docente solo ve sus grupos | RN-17, RN-35 |
| Sensor valida estudiante + grupo + sesión activa + horario + sin duplicados | RN-18, RN-19, RN-20, RN-36 |
| Notas 0.0–5.0, solo docente del grupo y trazabilidad de cambios | RN-25, RN-27, RN-28, RN-34 |
| Porcentajes de evaluación suman exactamente 100% antes de cerrar configuración | RN-52 |
| Niveles de desempeño (Superior/Normal/Bajo/Deficiente) | RN-21 |
| Plan microcurrículo ligado a microcurrículo + docente + periodo con fechas coherentes | RN-23, RN-39 |
| Bitácora de solo lectura | RN-42, RN-51 |
| Bloqueo de 5 intentos / 15 minutos | RN-30 |

**Total: 53 reglas de negocio (RN-01 .. RN-53).**
