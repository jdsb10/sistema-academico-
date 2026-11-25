# Criterios de Aceptación — Formato Dado/Cuando/Entonces

Derivados fielmente de los criterios de `parcial_Ingenieria-del-software-Juan Salas.pdf` (sección 3). Cada bloque corresponde a una HU del `product_backlog.md`.

### HU-01 — Inicio de sesión por rol
- **Dado** un usuario activo con credenciales válidas, **cuando** inicia sesión, **entonces** entra al menú de su rol y no ve opciones de otros roles.
- **Dado** un usuario que falla la contraseña 5 veces consecutivas, **cuando** intenta un sexto ingreso (incluso correcto), **entonces** el sistema rechaza el acceso y muestra que la cuenta está bloqueada por 15 minutos.
- **Dado** un usuario autenticado con un rol, **cuando** solicita una ruta o endpoint de otro rol, **entonces** el backend responde con acceso denegado, no solo el frontend oculta el botón.

### HU-02 — Facultades y programas
- **Dado** un administrador creando una facultad, **cuando** el código ya existe, **entonces** el sistema rechaza la creación con un mensaje de código duplicado.
- **Dado** una facultad con programas asociados, **cuando** el administrador intenta eliminarla, **entonces** el sistema lo impide.
- **Dado** un programa nuevo asociado a una facultad, **cuando** se guarda, **entonces** `numeroProgramas` de la facultad se incrementa automáticamente.

### HU-03 — Registro de estudiantes
- **Dado** un formulario de estudiante sin número de documento, **cuando** se intenta guardar, **entonces** se rechaza por campo obligatorio faltante.
- **Dado** un número de documento ya registrado, **cuando** se intenta crear otro estudiante con el mismo documento, **entonces** se rechaza como duplicado.
- **Dado** un estudiante válido con programa asignado, **cuando** se guarda, **entonces** queda vinculado a la facultad del programa (derivada, no duplicada).

### HU-04 — Gestión de docentes
- **Dado** un docente dado de baja (`EstadoBasico.INACTIVO`), **cuando** se consulta su historial de cargas académicas, **entonces** sigue disponible sin pérdida de datos.
- **Dado** un correo ya usado por otro docente, **cuando** se intenta registrar, **entonces** se rechaza.

### HU-05 — Coordinadores por programa
- **Dado** un coordinador sin programa asignado, **cuando** se le asigna un programa, **entonces** queda vigente (`fechaFin` nula) para ese programa.
- **Dado** un programa con coordinador vigente, **cuando** se asigna un nuevo coordinador, **entonces** el anterior deja de estar vigente (se cierra su `fechaFin`) y el programa conserva un único coordinador vigente.

### HU-06 — Gestión de materias
- **Dado** una materia con créditos en 0 o negativo, **cuando** se intenta guardar, **entonces** se rechaza.
- **Dado** un código de materia repetido, **cuando** se intenta crear, **entonces** se rechaza.

### HU-07 — Asignación de materias a docentes
- **Dado** una materia ya asignada a un docente, **cuando** se intenta asignar el mismo par materia-docente otra vez, **entonces** se rechaza como duplicado.
- **Dado** una materia sin docente asignado, **cuando** se asigna un docente, **entonces** la materia admite además otros docentes sin conflicto.

### HU-08 — Gestión de aulas
- **Dado** un código de aula repetido, **cuando** se intenta crear, **entonces** se rechaza.
- **Dado** un aula con cargas académicas activas, **cuando** se intenta eliminar, **entonces** se rechaza (se ofrece baja lógica).

### HU-09 — Carga académica sin choques (CP-02)
- **Dado** el docente D1 con clase lunes 8:00-10:00 en el aula A101, **cuando** se intenta asignarlo a otra materia el mismo lunes 8:00-10:00 en otra aula, **entonces** se rechaza por choque de docente.
- **Dado** el aula A101 ocupada lunes 8:00-10:00, **cuando** se intenta asignar otro docente a la misma aula el mismo horario, **entonces** se rechaza por choque de aula.
- **Dado** el docente D1 con clase lunes 8:00-10:00, **cuando** se le asigna otra clase lunes 10:00-12:00 (horas contiguas), **entonces** se acepta (no hay traslape real).

### HU-10 — Consulta de horarios por el coordinador
- **Dado** un coordinador de un programa, **cuando** consulta el horario de un docente o estudiante de OTRO programa, **entonces** no obtiene resultados (solo ve personas de su programa).
- **Dado** una identificación válida de su programa, **cuando** la busca, **entonces** el horario muestra materia, aula, día, hora y grupo.

### HU-11 — Horario del estudiante (CP-04)
- **Dado** el grupo G-A (lunes 8:00-10:00, con cupo), **cuando** el estudiante lo inscribe, **entonces** queda inscrito.
- **Dado** el estudiante ya inscrito en G-A, **cuando** intenta inscribir G-B (lunes 9:00-11:00, con cupo pero choca con G-A), **entonces** se rechaza por choque de horario.
- **Dado** el grupo G-C sin cupo, **cuando** el estudiante intenta inscribirlo, **entonces** se rechaza por falta de cupo.
- **Dado** un horario con los grupos inscritos, **cuando** el estudiante lo visualiza, **entonces** carga en menos de 3 segundos.

### HU-12 — Horario del docente
- **Dado** un docente con grupos del periodo vigente, **cuando** consulta su horario, **entonces** ve únicamente sus grupos de ese periodo.
- **Dado** un cambio reciente en la carga académica del docente, **cuando** vuelve a consultar su horario, **entonces** el cambio ya se refleja (vista en vivo, no copia desactualizada).

### HU-13 — Registro de asistencia con sensor (CP-03)
- **Dado** un estudiante inscrito en el grupo de la sesión, **cuando** el sensor lee su identificación, **entonces** queda registrado en `DetalleAsistencia` con estado, hora e identificación.
- **Dado** un estudiante ya registrado en la sesión, **cuando** el sensor vuelve a leer su identificación, **entonces** no se duplica y el sensor indica que ya está registrado.
- **Dado** un estudiante NO inscrito en el grupo, **cuando** el sensor lee su identificación, **entonces** se rechaza y no aparece como presente.
- **Dado** el sensor sin conexión a internet, **cuando** lee una identificación válida, **entonces** guarda localmente (`SensorLectura.estado = PENDIENTE`) y sincroniza al reconectar sin duplicar el registro.

### HU-14 — Consulta de asistencia por el docente
- **Dado** varias sesiones de asistencia del docente, **cuando** filtra por materia, grupo y fecha, **entonces** obtiene solo las sesiones que cumplen esos filtros, con presentes, ausentes y tardanzas.

### HU-15 — Consulta de asistencia por el estudiante
- **Dado** un estudiante autenticado, **cuando** consulta sus asistencias, **entonces** solo ve sus propios registros y el porcentaje coincide con lo registrado por el sensor.

### HU-16 — Microcurrículo
- **Dado** un microcurrículo sin uno de los cuatro niveles de desempeño, **cuando** se intenta guardar, **entonces** se rechaza por campo obligatorio incompleto.
- **Dado** un prerrequisito que no existe en el programa, **cuando** se intenta asociar, **entonces** se rechaza.

### HU-17 — Competencias específicas
- **Dado** una competencia sin microcurrículo asociado, **cuando** se intenta guardar, **entonces** se rechaza.
- **Dado** una competencia válida, **cuando** se guarda, **entonces** incluye descripción para los cuatro niveles (Superior, Normal, Bajo, Deficiente).

### HU-18 — Plan de microcurrículo
- **Dado** un plan con fecha de terminación anterior a la fecha de inicio, **cuando** se intenta guardar, **entonces** se rechaza por fechas incoherentes.
- **Dado** un plan válido (microcurrículo, docente, periodo), **cuando** se guarda, **entonces** queda ligado a los tres.

### HU-19 — Seguimiento del plan de microcurrículo
- **Dado** un docente con un plan asignado, **cuando** marca el avance de una unidad temática, **entonces** el avance queda registrado (`DetallePlanMicrocurriculo.avance`).
- **Dado** un estudiante consultando el seguimiento, **cuando** intenta modificarlo, **entonces** el sistema lo impide (solo lectura).
- **Dado** un coordinador de programa, **cuando** consulta el seguimiento, **entonces** ve el avance de todos los grupos del programa.

### HU-20 — Calificaciones (CP-05)
- **Dado** el docente D1 con el grupo G1, **cuando** guarda una nota de 4.2 para un estudiante de G1, **entonces** se guarda correctamente.
- **Dado** una nota fuera de rango (5.5 o -1), **cuando** se intenta guardar, **entonces** se rechaza con el mensaje del rango válido 0.0 a 5.0.
- **Dado** un cambio de nota de 4.2 a 4.5, **cuando** se guarda, **entonces** queda registrado en `HistorialCalificacion` con usuario, fecha y valor anterior.
- **Dado** el docente D1 intentando editar una nota del grupo G2 (de otro docente), **cuando** lo intenta, **entonces** se rechaza.
- **Dado** una configuración de evaluación cuyos porcentajes no suman 100%, **cuando** se intenta cerrar, **entonces** se rechaza.

### HU-21 — Reportes
- **Dado** un periodo y programa seleccionados, **cuando** se genera el reporte de asistencia o carga académica, **entonces** coincide con los datos reales del sistema y puede exportarse a PDF y Excel.

### HU-22 — Notificaciones por correo
- **Dado** un cambio de horario o una inasistencia reiterada, **cuando** ocurre, **entonces** se envía un correo en menos de 5 minutos.
- **Dado** un evento ya notificado (misma clave única), **cuando** se procesa de nuevo, **entonces** no se envía un correo duplicado.

### HU-23 — Bitácora de auditoría
- **Dado** una acción crítica (alta, baja, cambio de nota o de carga), **cuando** ocurre, **entonces** se registra en `Auditoria` con usuario, fecha, hora y valor anterior.
- **Dado** un registro existente en `Auditoria`, **cuando** se intenta `UPDATE` o `DELETE`, **entonces** la base de datos lo rechaza (trigger `bloquear_auditoria`).

### HU-24 — Respaldos y restauración (CP-06)
- **Dado** el sistema en operación, **cuando** se ejecuta el respaldo diario, **entonces** se genera una copia externa al servidor.
- **Dado** una pérdida de datos simulada, **cuando** se restaura desde el último respaldo, **entonces** los datos se recuperan completos y sin registros huérfanos, en menos de 2 horas.
