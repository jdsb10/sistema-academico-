# Requerimientos No Funcionales — Sistema Académico Universitario

**Proyecto:** Proyecto Final Ingeniería de Software II
**Versión:** 1.0
**Fuentes:** Doc1 (enunciado), Doc2 (HU, riesgos R-01..R-10, alertas A-01..A-07, §7 clasificación de fallas, §8 metas de recuperación) y las reglas locales de UI/UX de la máquina de desarrollo (marcadas como *Interpretación adoptada* cuando Doc1 y Doc2 guardan silencio).

**Categorías utilizadas:** seguridad, rendimiento, disponibilidad, usabilidad, mantenibilidad, cumplimiento legal y **operativo** (categoría adicional para la entrega de notificaciones y alertas, no definida en los documentos fuente).

---

## 1. Matriz de requerimientos no funcionales

| ID | Categoría | Requerimiento | Criterio medible | Fuente |
|---|---|---|---|---|
| RNF-01 | Seguridad | Las contraseñas se almacenan solo como hash con **bcrypt**, nunca en texto plano ni con algoritmos reversibles | 100% de los registros de usuario con hash bcrypt (factor de coste ≥ 10); ninguna respuesta de la API incluye el campo de contraseña; verificación por inspección de la tabla `Usuario` | Doc2 R-02 ("Contraseñas con hash (bcrypt)") |
| RNF-02 | Seguridad | Bloqueo de cuenta tras **5 intentos fallidos** de inicio de sesión durante **15 minutos** | CP-01: al quinto intento la cuenta queda bloqueada 15 min; el sexto intento con la contraseña correcta se rechaza mientras dure el bloqueo | Doc2 HU-01, CP-01, alerta A-02 |
| RNF-03 | Seguridad | Todo el tráfico entre cliente y servidor viaja cifrado por **HTTPS** en el ambiente de producción | Cero peticiones HTTP no cifradas en producción; redirección 301 a HTTPS activa; verificación con cabecera `Strict-Transport-Security` | Doc2 R-02 ("HTTPS") |
| RNF-04 | Seguridad | Las consultas a la base de datos se ejecutan **parametrizadas** (ORM Prisma o consultas con parámetros), sin concatenación de entradas del usuario | 100% de las consultas generadas por Prisma con parámetros vinculados; revisión de código sin operadores de entrada cruda (`$queryRawUnsafe`) | Doc2 R-02 ("consultas sin parametrizar", "consultas parametrizadas") |
| RNF-05 | Seguridad | **Mínimo privilegio** sobre los campos sensibles: puntaje ICFES, SISBEN, datos del acudiente y documento solo son visibles para el administrador, el coordinador del programa y el propio estudiante | CP-01 paso 6: un rol distinto no ve ningún dato; ninguna exportación no autorizada incluye campos sensibles; RNF-06 cumple 100% | Doc2 R-02, §7 (nivel 1: datos expuestos) |
| RNF-06 | Seguridad | **Control de acceso por rol** en el backend para el 100% de los endpoints protegidos y en el enrutado del frontend | 0 endpoints accesibles con rol no autorizado (prueba automatizada por endpoint); CP-01 paso 6 devuelve acceso denegado sin datos | Doc2 HU-01, CP-01, §9 (RF-01 es la función más crítica) |
| RNF-07 | Seguridad | **Rate limit** en el inicio de sesión y en rutas sensibles, para frenar ataques de fuerza bruta y fallos repetidos desde una misma dirección sobre varias cuentas | Límite de intentos de login por IP y por cuenta configurable (base: 5 intentos); alerta A-02 se dispara ante 5 fallos seguidos o fallos repetidos desde una misma dirección | Doc2 alerta A-02 (Interpretación adoptada: la herramienta de límite por IP no está nombrada en los documentos) |
| RNF-08 | Seguridad | **CORS** restringido al origen exacto del cliente web; sin `*` en producción | Solo el dominio del cliente aparece en `Access-Control-Allow-Origin`; preflight rechazado para orígenes no listados | *Interpretación adoptada* (coherente con Doc2 R-02: "permisos mal definidos") |
| RNF-09 | Seguridad | **Bitácora de auditoría** de las acciones críticas (altas, bajas, cambios de nota y de carga), inmutable | 100% de las mutaciones críticas generan una entrada con usuario, fecha, hora, valor anterior y valor nuevo; 0 endpoints de edición o borrado sobre la bitácora; CP-05 paso 7 muestra el cambio 4.2 → 4.5 | Doc2 HU-23, CP-05, R-02, R-07 |
| RNF-10 | Seguridad | La sesión se basa en un **token JWT firmado** con expiración configurable e invalidación al cerrar sesión | Token rechazado tras expirar o tras `POST /api/auth/logout`; ninguna ruta admite token sin verificar firma y vigencia | *Interpretación adoptada* (decisión ADR-04; Doc2 solo exige "inicio de sesión por rol") |
| RNF-11 | Rendimiento | La consulta y el dibujo del **horario** (docente y estudiante) se responden en **menos de 3 segundos** | CP-04 paso 5: tiempo de carga < 3.0 s en el ambiente de pruebas; medido también en la alerta A-04 (respuesta > 3 s dispara la alerta) | Doc2 HU-11, alerta A-04, §9 (RF-09 y RF-11 críticas) |
| RNF-12 | Rendimiento | **Índices de base de datos** en las tablas de horarios, asistencia, calificaciones y claves consultadas habitualmente | Índices creados sobre `CargaAcademica(dia, hora)`, `DetalleAsistencia(codigoAsistencia, idEstudiante)`, `HorarioEstudiante(idEstudiante)`, `BitacoraAuditoria(fecha)` y todas las claves únicas; `EXPLAIN` sin secuencial completo en las consultas de horario | Doc2 R-03 ("índices en horarios y asistencia") |
| RNF-13 | Rendimiento | El sistema soporta **pruebas de carga con 3 veces los usuarios esperados** al inicio del semestre sin degradación crítica | Prueba de carga ejecutada en el Sprint 6 con 3× usuarios simultáneos; latencia de horarios dentro de RNF-11 y cero errores 5xx sostenidos | Doc2 R-03 ("Pruebas de carga con 3 veces los usuarios esperados") |
| RNF-14 | Rendimiento | Lecturas optimizadas: sin consultas N+1 en listados y con **caché de lectura** en los puntos de mayor concurrencia (horarios, reportes) | 0 consultas N+1 en los listados críticos (verificación con conteo de queries); caché de lectura activada en reportes y en el horario del periodo vigente | Doc2 R-03 ("caché de lectura") |
| RNF-15 | Disponibilidad | **Respaldo diario** completo de la base de datos con copia almacenada **fuera del servidor** | 1 respaldo diario exitoso (24/24 en un mes de operación); copia externa verificable; pérdida máxima de datos: **24 horas**; alerta A-03 si un respaldo no termina | Doc2 HU-24, §8, R-06, alerta A-03 |
| RNF-16 | Disponibilidad | **Restauración** desde un respaldo probada y completada en **menos de 2 horas**, sin generar registros huérfanos | CP-06: los estudiantes restaurados aparecen completos, los horarios siguen apuntando a sus estudiantes y el tiempo total < 2 h; restauración de prueba ejecutada en cada sprint desde el Sprint 3 | Doc2 HU-24, CP-06, §8, R-06 |
| RNF-17 | Disponibilidad | Ante una caída o lentitud del servicio, existe **servidor de respaldo** con la última copia y aviso a los usuarios con la hora estimada de regreso | Alerta A-04 (respuesta de horarios > 3 s o servidor sin responder): reinicio del servicio y conmutación al servidor de respaldo; meta de vuelta a operar < 2 horas | Doc2 alerta A-04, §8 |
| RNF-18 | Disponibilidad | Las **alertas A-01 a A-07** se disparan en los umbrales definidos y llegan por correo al responsable y al Scrum Master (nivel 1 también al celular) | A-01: sensor sin señal 5 min en horario de clase; A-07: disco ≥ 80%; A-03: respaldo fallido; 100% de las alertas generan notificación registrada | Doc2 §8 |
| RNF-19 | Disponibilidad | El sensor de asistencia **no pierde registros** cuando no hay red: guarda en una cola local y sincroniza al volver | CP-03 pasos 4 y 5: con la red desconectada el registro se guarda localmente y al reconectar se sincroniza sin duplicarse; 0 registros perdidos en la prueba | Doc2 HU-13, CP-03, R-01 (mitigación "almacenamiento local con sincronización") |
| RNF-20 | Operativo | Toda **notificación por correo** se entrega en **menos de 5 minutos** tras el evento, sin duplicados | 100% de los correos de cambio de horario o inasistencia entregados en < 5 min; 0 correos duplicados para el mismo evento y destinatario (HU-22) | Doc2 HU-22 |
| RNF-21 | Operativo | El envío de correos usa una **capa de correo con transportador configurable**: en desarrollo transportador en consola/log; en producción, credenciales por variable de entorno | El sistema arranca sin credenciales SMTP y registra los correos en consola/log; cambiar el transportador no requiere modificar código, solo configuración | *Interpretación adoptada* (contexto del proyecto: "transportador en consola/log") |
| RNF-22 | Usabilidad | La interfaz es **responsiva** y funciona sin solapamientos ni recortes en los anchos de **360 px, 768 px y 1440 px** | Auditoría de capturas en 390×844 (móvil), 768 (tablet) y 1440×900 (escritorio) con cero desbordes horizontales y cero elementos recortados | *Interpretación adoptada* (reglas locales de UI/UX de la máquina; Doc1 y Doc2 no definen tamaños de pantalla) |
| RNF-23 | Usabilidad | La interfaz cumple **WCAG 2.1 nivel AA**: contraste ≥ 4.5:1 en texto normal, navegación completa por teclado, foco visible, etiquetas en todos los campos y texto alternativo en imágenes | Auditoría de contraste en toda la paleta (mínimo 4.5:1); 100% de los formularios con etiqueta asociada; recorrido de login a módulo principal solo con teclado | *Interpretación adoptada* (reglas locales de UI/UX de la máquina) |
| RNF-24 | Usabilidad | Cada pantalla tiene **estados loading, vacío y de error** con mensajes en español, claros y accionables | 100% de las pantallas con los tres estados implementados; mensajes de error en español y sin códigos técnicos expuestos al usuario | *Interpretación adoptada* (reglas locales de UI/UX; coherente con Doc2 §7 fallas nivel 4: "mensaje poco claro") |
| RNF-25 | Usabilidad | Se ejecuta una **prueba de usabilidad con 3 usuarios por rol** en cada Sprint Review, más manual corto y capacitación en el Sprint 6 | ≥ 3 usuarios por rol participando en cada Review; incidencias de usabilidad registradas y clasificadas; manual de usuario entregado en el Sprint 6 | Doc2 R-09, §4 (Reviews con usuarios reales), Sprint 6 (manual de usuario) |
| RNF-26 | Mantenibilidad | Se cumple la **Definición de Hecho** en el 100% de las historias: código revisado por otro integrante, pruebas unitarias pasando, caso de prueba funcional ejecutado, sin fallas nivel 1 o 2 y desplegado al ambiente de pruebas | 0 historias cerradas sin revisión de código y sin ejecución de su caso de prueba; 0 fallas nivel 1 o 2 abiertas al cierre del sprint | Doc2 §1 (DoD), §7 |
| RNF-27 | Mantenibilidad | El código de servidor y cliente compila en **TypeScript estricto** sin errores ni suppressions sin justificación | `tsc --strict` sin errores en `server/` y `client/` en cada ejecución de CI | *Interpretación adoptada* (contexto del proyecto: Node 24 + TypeScript en ambos lados) |
| RNF-28 | Mantenibilidad | Arquitectura **modular** en el backend (un módulo por dominio con sus rutas, servicios y validaciones) y **separación estricta** frontend/backend: el frontend nunca accede a la base de datos | 0 importaciones de Prisma o de `server/` desde `client/`; cada módulo expone su API por HTTP; revisión de arquitectura sin acoplos cruzados | *Interpretación adoptada* (ADR-01 y ADR-12; coherente con Doc1 que separa clases de UI de clases de datos) |
| RNF-29 | Mantenibilidad | Estrategia de pruebas automatizadas: unitarias y de integración con **Vitest + Supertest** y E2E con **Playwright**, ejecutadas en CI en cada cambio | Pipeline verde obligatorio para fusionar; CP-01 a CP-06 automatizados; reglas de negocio RN con prueba unitaria asociada | Doc2 §1 (DoD: pruebas unitarias y caso funcional), *Interpretación adoptada* en las herramientas (ADR-11) |
| RNF-30 | Cumplimiento legal | Tratamiento de datos personales conforme a la **Ley 1581 de 2012**: finalidad declarada, dato mínimo solicitado, acceso restringido y trazabilidad de accesos | 100% de los accesos a datos personales registrados en la bitácora; formulario de registro solicita solo los campos definidos en Doc1; política de tratamiento disponible en la interfaz | Doc2 R-02 ("cumplimiento de la Ley 1581 de 2012"), §7 (nivel 1: posible incumplimiento) |
| RNF-31 | Cumplimiento legal | Los datos sensibles (SISBEN, puntaje ICFES, datos del acudiente) **no aparecen** en listados generales ni en exportaciones no autorizadas | Ningún listado muestra esos campos sin permiso (RNF-05); los reportes exportados excluyen campos sensibles salvo autorización explícita | Doc2 R-02, §7 (nivel 1: "datos personales expuestos") |
| RNF-32 | Cumplimiento legal | **Nada se borra físicamente** en la operación académica: las bajas son lógicas para conservar el historial académico | 0 `DELETE` físicos sobre entidades académicas en los endpoints de negocio; historial completo recuperable tras una baja; verificado en CP-06 (sin registros huérfanos) | Doc2 R-06 ("baja lógica en vez de borrado físico"), HU-04 |

---

## 2. Verificación de los requerimientos no funcionales

| Categoría | Cómo se verifica | Dónde queda registrado |
|---|---|---|
| Seguridad | Pruebas automatizadas de autorización por endpoint (RNF-06), CP-01 completo, inspección de almacenamiento de contraseñas (RNF-01) y revisión de configuración HTTPS/CORS/rate limit | Suite de integración (Supertest) + revisión de código en el DoD |
| Rendimiento | Medición de tiempos de horario (CP-04), prueba de carga con 3× usuarios (RNF-13) y auditoría de índices con `EXPLAIN` (RNF-12) | Informe de pruebas de carga del Sprint 6 + revisión del plan de índices |
| Disponibilidad | Ejecución del respaldo diario con verificación de copia externa (RNF-15) y restauración cronometrada por sprint desde el Sprint 3 (RNF-16) | CP-06 + registro de respaldos en `/api/respaldos` |
| Usabilidad | Auditoría de capturas en 360/768/1440 px, auditoría de contraste WCAG AA y prueba con 3 usuarios por rol en cada Review | Reportes de auditoría de interfaz + actas de Sprint Review |
| Mantenibilidad | CI con `tsc --strict`, suite verde de Vitest/Supertest/Playwright y checklist de DoD por historia | Pipeline de integración continua + tablero Scrum |
| Cumplimiento legal | Revisión de la bitácora de accesos, inventario de campos sensibles y validación del formulario de registro contra la Ley 1581 | Checklist de cumplimiento firmado por el Product Owner |
| Operativo | Medición del tiempo de entrega de correos y conteo de duplicados en la cola de notificaciones | Registro de `Notificacion` (estado, intentos, fecha de envío) |

---

## 3. Relación con las funciones críticas de Doc2

| Función crítica (Doc2 §9) | Requerimientos no funcionales que la sostienen |
|---|---|
| Autenticación y control de acceso (RF-01) | RNF-01, RNF-02, RNF-03, RNF-05, RNF-06, RNF-07, RNF-08, RNF-10, RNF-30, RNF-31 |
| Carga académica y horarios (RF-09, RF-11) | RNF-11, RNF-12, RNF-13, RNF-14 |
| Registro de asistencia con sensor (RF-13) | RNF-12, RNF-18, RNF-19 |
| Calificaciones (RF-20) | RNF-09, RNF-27, RNF-32 |
| Respaldo y restauración (RF-24) | RNF-15, RNF-16, RNF-17, RNF-32 |
| Microcurrículo y seguimiento (RF-16 a RF-19) | RNF-24, RNF-26, RNF-27, RNF-28 |
| Reportes y notificaciones (RF-21, RF-22) | RNF-20, RNF-21, RNF-24 |

**Total: 32 requerimientos no funcionales (RNF-01 .. RNF-32).**
