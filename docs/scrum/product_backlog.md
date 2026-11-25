# Product Backlog — Sistema Académico Universitario

**Fuente:** `parcial_Ingenieria-del-software-Juan Salas.pdf`, sección 3. **Total:** 24 historias de usuario (HU-01 a HU-24) + 1 historia técnica (HU-T1) = **135 puntos de historia** en 6 sprints de 2 semanas + Sprint 0 de preparación.

Prioridad MoSCoW: **M** = Must (debe estar), **S** = Should (debería), **C** = Could (podría).

| ID | Historia de usuario | Criterio de aceptación | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| HU-T1 | Historia técnica: probar el sensor de asistencia (que conecte, que lea la identificación y cuánto demora) antes de comprometerse con HU-13 | Informe de la prueba del sensor: tiempo de lectura por persona y estabilidad de conexión | M | — | 0 |
| HU-01 | Como usuario del sistema (administrador, coordinador, docente o estudiante), quiero iniciar sesión con mi correo y contraseña, para acceder solo a las funciones de mi rol | Credenciales válidas entran al menú de su rol; cinco intentos fallidos bloquean la cuenta 15 min; un rol no puede abrir pantallas de otro | M | 8 | 1 |
| HU-02 | Como administrador, quiero crear, editar y consultar facultades y programas, para tener la estructura académica de la institución | Código de facultad y de programa únicos; NumeroProgramas de la facultad se actualiza solo; no se elimina una facultad con programas | M | 5 | 1 |
| HU-03 | Como administrador, quiero registrar y actualizar estudiantes con sus datos personales y académicos, para que queden vinculados a una facultad y un programa | Campos obligatorios validados (documento, correo, programa); documento duplicado se rechaza; el estudiante queda asociado a facultad y programa | M | 8 | 1 |
| HU-04 | Como administrador, quiero gestionar docentes, para contar con el cuerpo docente que dicta las materias | Alta, edición y baja lógica; correo único; un docente dado de baja conserva su historial | M | 5 | 1 |
| HU-05 | Como administrador, quiero gestionar coordinadores y asignarlos a un programa, para que cada programa tenga un responsable | Un coordinador se asigna a uno o más programas; un programa tiene un coordinador vigente | M | 5 | 2 |
| HU-06 | Como administrador, quiero gestionar materias con código, nombre y créditos, para armar la oferta académica | Código único; créditos mayores que cero | M | 3 | 2 |
| HU-07 | Como administrador, quiero asignar materias a docentes (MateriaDocente), para definir quién puede dictar qué | Una materia admite varios docentes; no se duplica el par docente-materia | M | 3 | 2 |
| HU-08 | Como administrador, quiero gestionar aulas con código y nombre, para controlar los espacios de clase | Código único; un aula con horarios asignados no se elimina | M | 3 | 2 |
| HU-09 | Como coordinador, quiero gestionar la carga académica de mi programa (materia, docente, aula, día, hora, grupo, periodo), para organizar el semestre | El sistema rechaza choques de docente o de aula en el mismo día y hora; la carga se guarda por periodo | M | 8 | 2 |
| HU-10 | Como coordinador, quiero consultar el horario de un docente y de un estudiante de mi programa, para detectar choques y revisar la carga | Búsqueda por identificación; el horario muestra materia, aula, día, hora y grupo; solo ve personas de su programa | M | 5 | 3 |
| HU-11 | Como estudiante, quiero crear y visualizar mi horario académico, para saber dónde y cuándo tengo clase | Solo inscribe grupos con cupo y sin choque con mis otras materias; el horario guardado se ve en menos de 3 s | M | 8 | 3 |
| HU-12 | Como docente, quiero visualizar mi horario académico, para preparar mis clases | Muestra solo mis grupos del periodo vigente y refleja cambios de la carga académica | M | 3 | 3 |
| HU-13 | Como docente, quiero que el sensor registre la asistencia de los estudiantes que llegan al aula, para no pasar lista a mano | El sensor identifica a la persona, la guarda en DetalleAsistencia con estado y hora; una persona no se registra dos veces en la misma sesión; si no hay red, guarda localmente y sincroniza después | M | 13 | 4 |
| HU-14 | Como docente, quiero consultar la asistencia de mis grupos por fecha y tema, para hacer seguimiento a mis estudiantes | Filtro por asignatura, grupo y fecha; muestra presentes, ausentes y tardanzas | M | 5 | 4 |
| HU-15 | Como estudiante, quiero visualizar mis asistencias por materia, para saber cuántas faltas llevo | Solo muestra mis registros; el porcentaje de asistencia coincide con los registros del sensor | S | 3 | 4 |
| HU-16 | Como coordinador, quiero gestionar el microcurrículo de cada materia de mi programa, para mantener su contenido programático | Campos obligatorios completos; prerrequisitos válidos; los cuatro niveles de desempeño y los tres parciales quedan guardados | S | 8 | 5 |
| HU-17 | Como coordinador, quiero registrar las competencias específicas y los resultados de aprendizaje por unidad temática, para evaluar con criterios claros | Cada competencia pertenece a un microcurrículo; los niveles Superior, Normal, Bajo y Deficiente tienen descripción | S | 5 | 5 |
| HU-18 | Como coordinador, quiero gestionar el plan de microcurrículo por periodo y docente, para planear el semestre | El plan queda ligado a microcurrículo, docente y periodo; total de horas y fechas de inicio y fin coherentes | S | 8 | 5 |
| HU-19 | Como docente, quiero hacer seguimiento al plan de microcurrículo, y como estudiante consultarlo, para saber qué se ha cubierto del curso | El docente marca el avance por unidad; el estudiante ve el avance sin poder editarlo; el coordinador ve el avance de todos los grupos | S | 5 | 5 |
| HU-20 | Como docente, quiero registrar y modificar las calificaciones de mis grupos, para reportar el desempeño de los estudiantes | Solo edita sus grupos; valores entre 0.0 y 5.0; cada cambio queda con fecha y usuario | M | 8 | 6 |
| HU-21 | Como coordinador, quiero generar reportes de asistencia y de carga académica, para tomar decisiones y presentar informes | Reporte por periodo y programa exportable a PDF y Excel; coincide con los datos del sistema | C | 5 | 6 |
| HU-22 | Como estudiante o docente, quiero recibir notificaciones por correo de cambios en el horario o de inasistencias reiteradas, para reaccionar a tiempo | Envía el correo en menos de 5 min tras el cambio; no envía duplicados | C | 3 | 6 |
| HU-23 | Como administrador, quiero una bitácora de auditoría de las acciones críticas (altas, bajas, cambios de nota y de carga), para saber quién hizo qué y cuándo | Cada acción crítica guarda usuario, fecha, hora y valor anterior; la bitácora no se puede editar | S | 3 | 3 |
| HU-24 | Como administrador, quiero respaldos automáticos de la base de datos y un procedimiento de restauración probado, para no perder información académica | Respaldo diario y copia fuera del servidor; una restauración de prueba recupera los datos en menos de 2 h | M | 5 | 3 |

**Total de puntos:** 135 (8+5+8+5+5+3+3+3+8+5+8+3+13+5+3+8+5+8+5+8+5+3+3+5 = 135), distribuidos en Sprint 1 (26), Sprint 2 (22), Sprint 3 (24), Sprint 4 (21), Sprint 5 (26), Sprint 6 (16).

## Reglas del backlog (Doc2, sección 1)

- Estimación con escala de Fibonacci: 1, 2, 3, 5, 8, 13. Una historia de más de 13 puntos se divide antes de entrar al sprint (ninguna historia actual la excede).
- **Definición de Listo (DoR):** la historia tiene criterios de aceptación, está estimada y sus dependencias están resueltas.
- **Definición de Hecho (DoD):** código revisado por otro integrante, pruebas unitarias pasando, caso de prueba funcional ejecutado, sin errores críticos abiertos y desplegado en el ambiente de pruebas.
- El Product Owner puede reordenar el backlog entre sprints; dentro de un sprint en curso el alcance no cambia, salvo una falla crítica.
