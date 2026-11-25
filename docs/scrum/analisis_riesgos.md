# Análisis de Riesgos — Sistema Académico Universitario

Fuente: `parcial_Ingenieria-del-software-Juan Salas.pdf`, secciones 5 a 8. Probabilidad (P) e Impacto (I) de 1 a 5; Prioridad = P×I: **Crítico** 15-25, **Alto** 10-14, **Medio** 5-9, **Bajo** hasta 4. Los dos riesgos críticos se revisan en cada Daily.

## Matriz de riesgos (R-01 a R-10)

| ID | Riesgo | Causa | P | I | P×I | Nivel | Estrategia de mitigación | Responsable |
|---|---|---|---|---|---|---|---|---|
| R-01 | El sensor no registra o registra mal la asistencia | Hardware inestable, red Wi-Fi débil en el aula, lectura errónea de la identificación, sin calibración | 4 | 4 | 16 | **Crítico** | Spike HU-T1 en Sprint 0; aula piloto antes de extender; almacenamiento local con sincronización; registro manual de respaldo para el docente | Responsable de integración y calidad |
| R-02 | Fuga o acceso indebido a datos personales (documento, SISBEN, puntaje ICFES, datos del acudiente) | Contraseñas débiles, permisos mal definidos, consultas sin parametrizar, sin cifrado en tránsito | 3 | 5 | 15 | **Crítico** | Contraseñas con hash (bcrypt), control de acceso por rol, consultas parametrizadas, HTTPS, mínimo privilegio sobre campos sensibles, cumplimiento de la Ley 1581 de 2012, bitácora de auditoría (HU-23) | Desarrollador backend |
| R-03 | El sistema deja de estar disponible al inicio del semestre | Pico de usuarios simultáneos al consultar horarios, consultas sin índices, servidor único | 3 | 4 | 12 | Alto | Pruebas de carga con 3 veces los usuarios esperados, índices en horarios y asistencia, caché de lectura, monitoreo y servidor de respaldo | Responsable de integración y calidad |
| R-04 | Choques de horario o de aula que llegan a producción | Validación incompleta de docente, aula, día y hora; cambios concurrentes de la carga | 3 | 4 | 12 | Alto | Restricciones únicas en base de datos además de la validación en código; pruebas con casos límite (misma hora, horas contiguas); bloqueo al editar | Desarrollador backend |
| R-05 | Requisitos del microcurrículo ambiguos o cambiantes | La institución ajusta campos, niveles de desempeño o formatos de plan durante el proyecto | 4 | 3 | 12 | Alto | Historias de microcurrículo en Sprint 5 para dar tiempo de validación; prototipos mostrados en cada Review; cambios solo entre sprints | Product Owner y analista |
| R-06 | Pérdida de datos académicos | Falla de disco, error humano, ausencia de respaldo probado | 2 | 5 | 10 | Alto | Respaldo diario con copia externa (HU-24), restauración de prueba cada sprint desde el Sprint 3, baja lógica en vez de borrado físico | Desarrollador backend |
| R-07 | Calificaciones modificadas sin autorización | Permisos de edición excesivos, falta de trazabilidad | 2 | 5 | 10 | Alto | Solo el docente del grupo edita; cada cambio queda con usuario, fecha y valor anterior; cierre de notas por periodo | Desarrollador backend |
| R-08 | Datos duplicados o inconsistentes | Registros ya existentes en hojas de cálculo, falta de claves únicas, carga manual | 3 | 3 | 9 | Medio | Claves únicas (documento, correo, códigos), validación de formato, carga inicial con reporte de errores y revisión del Product Owner | Analista y diseñador |
| R-09 | Baja adopción por docentes y estudiantes | Interfaz poco clara, falta de capacitación, resistencia al sensor | 3 | 3 | 9 | Medio | Prueba de usabilidad con 3 usuarios por rol en Reviews, manual corto y capacitación en Sprint 6, aula piloto antes del despliegue general | Scrum Master y desarrollador frontend |
| R-10 | Retraso del cronograma | Subestimación de historias, salida o enfermedad de un integrante, impedimentos externos (accesos, hardware) | 3 | 3 | 9 | Medio | Estimación por puntos con revisión en Retrospectiva, conocimiento compartido por revisión cruzada de código, Sprint 6 con holgura de 8 puntos | Scrum Master |

## Mapa de calor

Solo **R-01** y **R-02** caen en la zona crítica (P×I ≥ 15). **R-03 a R-07** quedan en la zona alta (P×I entre 10 y 14). **R-08 a R-10** quedan en zona media (P×I entre 5 y 9). Ningún riesgo identificado cae en zona baja.

## Diagrama de Ishikawa (6M) — Falla del sensor de asistencia (R-01)

Causa raíz analizada: *"el sensor deja de registrar a los estudiantes que llegan al aula"*.

| Categoría (M) | Causas identificadas |
|---|---|
| **Máquina** | Hardware del sensor inestable; falta de calibración del dispositivo de lectura de identificación. |
| **Método** | Ausencia de un procedimiento de validación previa (sin spike HU-T1); falta de un protocolo de registro manual de respaldo cuando el sensor falla. |
| **Mano de obra** | Docentes sin capacitación para activar el registro manual de contingencia; resistencia al uso del dispositivo. |
| **Material** | Red Wi-Fi débil o inestable dentro del aula física. |
| **Medio ambiente** | Interferencia o condiciones del aula (ubicación del sensor, distancia a estudiantes) que afectan la lectura. |
| **Medición** | Lectura errónea de la identificación (datos mal capturados) sin mecanismo de alerta inmediato que detecte el sensor sin señal. |

Las causas que el proyecto puede controlar directamente son las de **método** y **medición**: por eso se incorporan la prueba previa HU-T1, el aula piloto, el registro manual de respaldo y las alertas de la sección "Alertas, respuesta y recuperación" (A-01).

## Clasificación de fallas por gravedad

| Nivel | Criterio | Ejemplos en este sistema | Consecuencias | Atención | Resolución objetivo |
|---|---|---|---|---|---|
| 1 · Crítica | Se pierden o exponen datos, se accede sin autorización o el sistema no opera | Un usuario ve datos de otro rol; datos personales expuestos (documento, SISBEN, ICFES); base de datos dañada; calificaciones alteradas sin autorización | Daño directo a las personas, posible incumplimiento de la Ley 1581 de 2012, decisiones académicas con datos falsos, institución sin poder operar | 15 min, detiene el sprint | 4 h o contención inmediata (cuenta, servicio o módulo aislado) |
| 2 · Alta | Una función crítica falla o se degrada, sin pérdida de datos | El sensor no registra la asistencia en varias aulas; un rol no puede iniciar sesión; la carga académica no se guarda; el horario no abre | Clases sin asistencia automática, docentes y estudiantes sin horario, trabajo manual para el coordinador | 1 h | 1 día hábil |
| 3 · Media | Falla una función no crítica o hay un resultado incorrecto con salida alternativa | Reporte con totales errados; notificación por correo no enviada; un campo del microcurrículo no se guarda | Retrasos y reprocesos, pero la operación sigue | 1 día hábil | 5 días hábiles o siguiente sprint |
| 4 · Baja | Defecto visual o de usabilidad sin efecto en los datos | Texto con error, mensaje poco claro, columna mal alineada | Molestia al usuario | Siguiente Planning | Backlog |

Si en pruebas aparece una falla de nivel 1 o 2, la historia no se cierra: no cumple la Definición de Hecho.

## Alertas, respuesta, recuperación y contingencia

Metas de recuperación: perder como máximo 24 horas de datos (respaldo diario) y volver a operar en menos de 2 horas (exigencia literal de HU-24). Cada alerta llega por correo al responsable y al Scrum Master; las de nivel 1 también por mensaje al celular.

| Alerta | Se dispara cuando | Nivel | Acción de respuesta | Recuperación o contingencia |
|---|---|---|---|---|
| A-01 Sensor sin señal | Un sensor no reporta durante 5 min en horario de clase | 2 | El responsable de integración revisa energía y red del aula | El docente registra la asistencia manual en la misma tabla `DetalleAsistencia`; el sensor guarda localmente y sincroniza al volver |
| A-02 Intentos de acceso sospechosos | 5 fallos seguidos en una cuenta, o fallos repetidos desde una misma dirección sobre varias cuentas | 1 si hay acceso exitoso posterior, 3 si no | Bloqueo de la cuenta 15 min, revisión de la bitácora, cambio forzado de contraseña si hubo acceso | Cierre de sesiones activas y restablecimiento de la cuenta por el administrador |
| A-03 Respaldo fallido | El respaldo diario no termina o su copia externa no se genera | 2 | Repetir el respaldo ese mismo día y revisar espacio y permisos | Si falla otro día seguido, se detiene el despliegue de cambios hasta tener un respaldo válido |
| A-04 Servicio lento o caído | Respuesta de horarios mayor a 3 s, o servidor sin responder | 2 (1 si dura más de 1 h) | Revisar consultas lentas y carga del servidor; reiniciar el servicio | Servidor de respaldo con la última copia; aviso a los usuarios con la hora estimada de regreso |
| A-05 Choque de horario en producción | Dos registros de la carga coinciden en docente o aula, día y hora | 2 | El coordinador y el desarrollador backend corrigen el registro y avisan a los afectados | Notificación del cambio al docente y a los estudiantes; revisión de la regla que dejó pasar el choque |
| A-06 Cambio de notas anómalo | Cambio de nota fuera del periodo de calificación, o más de un cambio de un mismo docente sobre varios estudiantes a la vez | 1 | Revisión inmediata con el docente y el coordinador usando la bitácora (HU-23) | Restauración del valor anterior desde la bitácora; bloqueo de edición hasta la verificación |
| A-07 Espacio de almacenamiento | Disco usado por encima del 80% | 3 | Depurar registros temporales y ampliar el espacio | Ampliación antes de que el respaldo falle |

## Procedimiento ante un incidente

1. Detectarlo y asignarle nivel.
2. Contenerlo (aislar la cuenta, el módulo o el servicio).
3. Recuperar con la contingencia de la tabla de alertas.
4. Avisar a los afectados.
5. Dejar escrita la causa para revisarla en la Retrospectiva y actualizar la matriz de riesgos.
