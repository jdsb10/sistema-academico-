# Historias de Usuario — Formato expandido

Expansión narrativa de las 24 HU + HU-T1 de `parcial_Ingenieria-del-software-Juan Salas.pdf`. Los criterios base se citan literalmente; los casos borde señalados como *"(caso borde añadido)"* son interpretación razonable del equipo para cubrir huecos de implementación, sin inventar reglas académicas nuevas (Regla 19 del prompt maestro).

---

### HU-T1 — Validación técnica del sensor de asistencia
**Como** equipo de desarrollo, **quiero** probar el sensor de asistencia antes de comprometerme con HU-13, **para** no construir una historia completa sobre hardware no validado.
- Criterios: el sensor conecta de forma estable; el tiempo de lectura por persona se mide; si supera 2 s o la conexión no es estable, se activa el plan de contingencia (registro manual primero, sensor al Sprint 6).
- *(Caso borde añadido)*: si no hay hardware físico disponible, se documenta la limitación y se construye un simulador funcional equivalente (ver `docs/scrum/sprint_0.md`).

---

### HU-01 — Inicio de sesión por rol
**Como** usuario del sistema (administrador, coordinador, docente o estudiante), **quiero** iniciar sesión con mi correo y contraseña, **para** acceder solo a las funciones de mi rol.
- Credenciales válidas entran al menú de su rol.
- Cinco intentos fallidos bloquean la cuenta 15 minutos.
- Un rol no puede abrir pantallas de otro.
- *(Caso borde añadido)*: tras el bloqueo, un sexto intento (incluso con contraseña correcta) se rechaza mientras dure el bloqueo; el contador de intentos se reinicia solo tras un login exitoso.

### HU-02 — Facultades y programas
**Como** administrador, **quiero** crear, editar y consultar facultades y programas, **para** tener la estructura académica de la institución.
- Código de facultad y de programa únicos.
- `NumeroProgramas` de la facultad se actualiza solo.
- No se elimina una facultad con programas.
- *(Caso borde añadido)*: tampoco se elimina un programa con estudiantes o cargas académicas asociadas; se ofrece baja lógica (`EstadoBasico.INACTIVO`) como alternativa.

### HU-03 — Registro de estudiantes
**Como** administrador, **quiero** registrar y actualizar estudiantes con sus datos personales y académicos, **para** que queden vinculados a una facultad y un programa.
- Campos obligatorios validados (documento, correo, programa).
- Documento duplicado se rechaza.
- El estudiante queda asociado a facultad (vía programa) y programa.
- *(Caso borde añadido)*: el correo también debe ser único a nivel de `Usuario`; el puntaje ICFES, si se ingresa, debe estar entre 0 y 500.

### HU-04 — Gestión de docentes
**Como** administrador, **quiero** gestionar docentes, **para** contar con el cuerpo docente que dicta las materias.
- Alta, edición y baja lógica.
- Correo único.
- Un docente dado de baja conserva su historial (cargas académicas, planes, calificaciones registradas no se eliminan).

### HU-05 — Coordinadores por programa
**Como** administrador, **quiero** gestionar coordinadores y asignarlos a un programa, **para** que cada programa tenga un responsable.
- Un coordinador se asigna a uno o más programas.
- Un programa tiene un coordinador vigente (garantizado por índice único parcial en base de datos).
- *(Caso borde añadido)*: reasignar el coordinador de un programa cierra (`fechaFin`) la asignación anterior antes de crear la nueva vigente.

### HU-06 — Gestión de materias
**Como** administrador, **quiero** gestionar materias con código, nombre y créditos, **para** armar la oferta académica.
- Código único.
- Créditos mayores que cero.

### HU-07 — Asignación de materias a docentes
**Como** administrador, **quiero** asignar materias a docentes (`MateriaDocente`), **para** definir quién puede dictar qué.
- Una materia admite varios docentes.
- No se duplica el par docente-materia.

### HU-08 — Gestión de aulas
**Como** administrador, **quiero** gestionar aulas con código y nombre, **para** controlar los espacios de clase.
- Código único.
- Un aula con horarios asignados no se elimina.
- *(Caso borde añadido)*: la capacidad (atributo propuesto por el prompt maestro, Módulo 8) se valida como entero positivo cuando se informa.

### HU-09 — Carga académica sin choques
**Como** coordinador, **quiero** gestionar la carga académica de mi programa (materia, docente, aula, día, hora, grupo, periodo), **para** organizar el semestre.
- El sistema rechaza choques de docente o de aula en el mismo día y hora.
- La carga se guarda por periodo.
- *(Caso borde añadido, CP-02 Caso C)*: dos bloques de horas contiguas (8:00-10:00 y 10:00-12:00) para el mismo docente o aula **no** se consideran choque.

### HU-10 — Consulta de horarios por el coordinador
**Como** coordinador, **quiero** consultar el horario de un docente y de un estudiante de mi programa, **para** detectar choques y revisar la carga.
- Búsqueda por identificación.
- El horario muestra materia, aula, día, hora y grupo.
- Solo ve personas de su programa.

### HU-11 — Horario del estudiante
**Como** estudiante, **quiero** crear y visualizar mi horario académico, **para** saber dónde y cuándo tengo clase.
- Solo inscribe grupos con cupo y sin choque con mis otras materias.
- El horario guardado se ve en menos de 3 segundos.
- *(Caso borde añadido, CP-04)*: un grupo sin cupo se rechaza aunque no haya choque de horario.

### HU-12 — Horario del docente
**Como** docente, **quiero** visualizar mi horario académico, **para** preparar mis clases.
- Muestra solo mis grupos del periodo vigente.
- Refleja cambios de la carga académica (se consulta en vivo, no una copia desactualizada — ver ADR-08, vista SQL).

### HU-13 — Registro de asistencia con sensor
**Como** docente, **quiero** que el sensor registre la asistencia de los estudiantes que llegan al aula, **para** no pasar lista a mano.
- El sensor identifica a la persona y la guarda en `DetalleAsistencia` con estado y hora.
- Una persona no se registra dos veces en la misma sesión.
- Si no hay red, guarda localmente y sincroniza después.
- *(Caso borde añadido, CP-03)*: un estudiante no inscrito en el grupo de la sesión se rechaza y no aparece como presente.

### HU-14 — Consulta de asistencia por el docente
**Como** docente, **quiero** consultar la asistencia de mis grupos por fecha y tema, **para** hacer seguimiento a mis estudiantes.
- Filtro por asignatura, grupo y fecha.
- Muestra presentes, ausentes y tardanzas.

### HU-15 — Consulta de asistencia por el estudiante
**Como** estudiante, **quiero** visualizar mis asistencias por materia, **para** saber cuántas faltas llevo.
- Solo muestra mis registros.
- El porcentaje de asistencia coincide con los registros del sensor.

### HU-16 — Microcurrículo
**Como** coordinador, **quiero** gestionar el microcurrículo de cada materia de mi programa, **para** mantener su contenido programático.
- Campos obligatorios completos.
- Prerrequisitos válidos (deben existir como microcurrículo/materia del mismo programa).
- Los cuatro niveles de desempeño (Superior, Normal, Bajo, Deficiente) y los tres parciales quedan guardados.

### HU-17 — Competencias específicas
**Como** coordinador, **quiero** registrar las competencias específicas y los resultados de aprendizaje por unidad temática, **para** evaluar con criterios claros.
- Cada competencia pertenece a un microcurrículo.
- Los niveles Superior, Normal, Bajo y Deficiente tienen descripción.

### HU-18 — Plan de microcurrículo
**Como** coordinador, **quiero** gestionar el plan de microcurrículo por periodo y docente, **para** planear el semestre.
- El plan queda ligado a microcurrículo, docente y periodo.
- Total de horas y fechas de inicio y fin coherentes (fecha de terminación posterior a la de inicio).

### HU-19 — Seguimiento del plan de microcurrículo
**Como** docente, **quiero** hacer seguimiento al plan de microcurrículo, **y como** estudiante, **quiero** consultarlo, **para** saber qué se ha cubierto del curso.
- El docente marca el avance por unidad.
- El estudiante ve el avance sin poder editarlo.
- El coordinador ve el avance de todos los grupos.

### HU-20 — Calificaciones
**Como** docente, **quiero** registrar y modificar las calificaciones de mis grupos, **para** reportar el desempeño de los estudiantes.
- Solo edita sus grupos.
- Valores entre 0.0 y 5.0.
- Cada cambio queda con fecha y usuario (trazabilidad, `HistorialCalificacion`).
- *(Caso borde añadido, CP-05)*: los porcentajes de evaluación de un grupo deben sumar exactamente 100% antes de poder cerrar la configuración.

### HU-21 — Reportes
**Como** coordinador, **quiero** generar reportes de asistencia y de carga académica, **para** tomar decisiones y presentar informes.
- Reporte por periodo y programa exportable a PDF y Excel.
- Coincide con los datos del sistema (sin datos ficticios fuera del entorno de demostración).

### HU-22 — Notificaciones por correo
**Como** estudiante o docente, **quiero** recibir notificaciones por correo de cambios en el horario o de inasistencias reiteradas, **para** reaccionar a tiempo.
- Envía el correo en menos de 5 minutos tras el cambio.
- No envía duplicados (clave única de deduplicación, `NotificacionCorreo.claveUnica`).

### HU-23 — Bitácora de auditoría
**Como** administrador, **quiero** una bitácora de auditoría de las acciones críticas (altas, bajas, cambios de nota y de carga), **para** saber quién hizo qué y cuándo.
- Cada acción crítica guarda usuario, fecha, hora y valor anterior.
- La bitácora no se puede editar (trigger de base de datos, ver ADR-11).

### HU-24 — Respaldos y restauración
**Como** administrador, **quiero** respaldos automáticos de la base de datos y un procedimiento de restauración probado, **para** no perder información académica.
- Respaldo diario y copia fuera del servidor.
- Una restauración de prueba recupera los datos en menos de 2 horas.
