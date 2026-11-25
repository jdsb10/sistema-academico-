# Progreso del proyecto — Sistema Académico Universitario

**Última actualización:** 2026-11-24
**Continuado por:** Claude (Claude Code), retomando el trabajo de OpenCode descrito en `HANDOFF.txt`.

---

## 1. Resumen en una frase

Sistema completo y funcional de extremo a extremo (base de datos → API REST → interfaz web) para los 4 roles del enunciado, con las reglas de negocio críticas (choques de horario, rango y trazabilidad de notas, control de acceso por rol, bitácora inmutable) verificadas con pruebas automatizadas reales, no solo documentadas.

## 2. Fases terminadas

| Fase | Estado | Nota |
|---|---|---|
| 1. Análisis de requerimientos | ✅ Completa | 7 documentos en `docs/analysis/` |
| 2. Arquitectura y stack tecnológico | ✅ Completa | 12 ADR en `decisiones_arquitectonicas.md` |
| 3. Modelado UML y base de datos | ✅ Completa (heredada de OpenCode, verificada) | 40 modelos, 2 migraciones, reglas de negocio a nivel de BD |
| 4. Configuración del entorno y estructura | ✅ Completa | Monorepo, PostgreSQL embebido, tsconfig, Tailwind |
| 5. Backend, autenticación y permisos | ✅ Completa | JWT, bcrypt, bloqueo de cuenta, guards por rol en 20 módulos |
| 6. Frontend y sistema de diseño | ✅ Completa | Rediseño "Campus Editorial": tokens 60-30-10, Inter + JetBrains Mono, espaciado de 8px, tablas apiladas y navegación por rol en móvil (ver `docs/DESIGN.md`) |
| 7-12. Módulos académicos (dashboards, carga, horarios, asistencia+sensor, microcurrículo+competencias+planes, calificaciones, reportes) | ✅ Backend y frontend completos (ver pendientes menores) | |
| 13. Pruebas integrales y seguridad | ✅ Backend (31 pruebas de integración) · ✅ Frontend verificado en navegador real con Playwright (4 roles, flujos críticos) | |
| 14. Documentación y manuales | ✅ Completa: análisis, Scrum, 8 diagramas UML (Mermaid) y 7 manuales (instalación, configuración, técnico, 4 de usuario por rol) en `docs/uml/` y `docs/manuales/` | |
| 15. Verificación final | ✅ Backend compila y pasa pruebas · ✅ Frontend compila y se verificó manualmente en navegador (4 roles, 3 anchos de pantalla) | |

> **Corrección posterior (2026-11-25):** al cerrar sesión y entrar con otro rol sin recargar, React Query reutilizaba la caché del usuario anterior y el dashboard quedaba en blanco (`proximasClases` undefined). Ahora `AuthContext` limpia la caché al iniciar/cerrar sesión y al expirar la sesión, `ListaClases` tolera datos ausentes y el menú de usuario del Topbar vuelve a recibir clics reales (`relative z-30`). Verificado en vivo: admin → estudiante → admin sin recargar, 0 errores de consola.

## 3. Módulos implementados (backend: API completa; frontend: página funcional)

| Módulo | Backend | Frontend |
|---|---|---|
| Auth (login, refresh, logout, cambiar/recuperar contraseña) | ✅ | ✅ (login; recuperar contraseña solo por API) |
| Facultades | ✅ CRUD | ✅ CRUD completo |
| Programas | ✅ CRUD + asignar coordinador | ✅ CRUD (asignar coordinador solo por API) |
| Materias | ✅ CRUD + asignar docente | ✅ CRUD |
| Aulas | ✅ CRUD + disponibilidad | ✅ CRUD |
| Administradores / Coordinadores / Docentes / Estudiantes | ✅ CRUD + baja lógica | ✅ Crear, listar, **editar** (nombres, apellidos, celular; estudiante también programa e ICFES), activar/desactivar |
| Grupos | ✅ CRUD + cupo disponible + estudiantes inscritos | ✅ Crear, listar, **editar** (cupo siempre; materia/programa/periodo solo si aún no tiene carga asignada) y **eliminar** (si no tiene carga asignada) |
| Carga académica | ✅ CRUD + choques de horario (BD + API) | ✅ Crear, listar, cancelar |
| Horarios (estudiante y docente) | ✅ Inscripción, retiro, vista semanal (vista SQL) | ✅ Grid semanal + inscripción |
| Asistencias | ✅ Sesiones, registro manual, cierre, resumen por estudiante | ✅ Crear sesión, registrar asistencia, cerrar |
| Sensor de asistencia | ✅ Simulador completo (validaciones, cola sin conexión, sincronización) | ✅ Simulador interactivo |
| Microcurrículos | ✅ CRUD + prerrequisitos | ✅ Crear, listar y ver detalle (sin editar) |
| Competencias específicas | ✅ CRUD | ✅ Página de detalle del microcurrículo: listar y crear unidades temáticas |
| Planes de microcurrículo + seguimiento | ✅ CRUD + registrar avance | ✅ Página de detalle del microcurrículo: crear plan, ver seguimiento (HU-19: el docente del plan edita el avance; coordinador/administrador/estudiante solo lo consultan) |
| Calificaciones | ✅ Configuración, evaluaciones (suma 100%), notas, historial | ✅ Configurar, registrar notas, ver resultados |
| Reportes (asistencia, carga académica, desempeño) | ✅ JSON + Excel + PDF | ✅ Selección de periodo/programa + descarga |
| Auditoría | ✅ Lectura paginada (tabla inmutable por trigger de BD) | ✅ Tabla con filtros |
| Respaldos | ✅ Generar (JSON) y restaurar | ✅ Generar/restaurar (verificado en navegador con Playwright) |
| Dashboard por rol | ✅ 4 endpoints con datos reales | ✅ 4 vistas con gráficas (Recharts) |
| Notificaciones por correo (HU-22) | ✅ Capa con transportador "consola", deduplicación | ⚠️ Sin UI; solo se usa en recuperación de contraseña |
| Periodos académicos | ✅ CRUD | ⚠️ Solo como selector en otros formularios, sin página de gestión |

## 4. Archivos creados en esta sesión (resumen; ver el árbol real del repo para el detalle completo)

- `docs/analysis/decisiones_arquitectonicas.md`, `matriz_trazabilidad.md` (los 3 documentos de análisis que faltaban, más revisión de los 5 existentes).
- `docs/scrum/` completo (13 archivos: backlog, 7 sprints, historias, criterios, riesgos, plan de pruebas, seguimiento).
- `server/src/` completo: `config/`, `shared/`, `middleware/`, `types/`, y 21 módulos en `modules/` (auth, facultades, programas, materias, aulas, grupos, periodos, personas×4, cargas-academicas, horarios, asistencias, sensores, microcurriculos+competencias+planes, calificaciones, reportes, dashboard, auditoria, respaldos, notificaciones).
- `server/src/app.ts`, `main.ts`, `docs/swagger.ts`.
- `server/prisma/seed.ts` (datos de demostración completos).
- `server/tests/` (`helpers.ts`, `api.test.ts`) + `vitest.config.ts`.
- `client/` completo: configuración (Vite, Tailwind, PostCSS), tokens de diseño, componentes UI (`Button`, `Input`, `Card`, `Table`, `Modal`, `Badge`, `States`), layout (`Sidebar`, `Topbar`, `Breadcrumbs`, drawer responsive), `AuthContext`, cliente API con refresh automático, y 21 páginas.
- `README.md`, `docs/PROGRESS.md` (este archivo), `.claude/launch.json`.
- Correcciones a archivos heredados: `server/prisma/schema.prisma` (previewFeature renombrado), `server/scripts/db.ts` (`$queryRawUnsafe`), `server/scripts/_check.ts` y `server/prisma/seed.ts` (orden de limpieza: las personas deben borrarse antes que programa/facultad).

## 5. Funcionalidades verificadas (no solo escritas)

- **Backend**: compila sin errores (`tsc --noEmit`), arranca y responde en `/health` y `/api-docs`.
- **Reglas de negocio probadas end-to-end vía API real** (no solo a nivel de base de datos):
  - Login válido/inválido, bloqueo de cuenta tras 5 intentos fallidos (CP-01).
  - Choques de horario: mismo docente, misma aula, y horas contiguas aceptadas (CP-02), probado tanto en `scripts/_check.ts` (nivel BD) como en `tests/api.test.ts` (nivel API).
  - Inscripción de estudiante sin choques, sin duplicados, protección IDOR (CP-04).
  - Rango de notas 0.0–5.0, solo el docente del grupo califica, historial de cambios (CP-05).
  - Bitácora de auditoría: solo ADMINISTRADOR la consulta; se registran las acciones críticas.
- **Frontend**: verificado manualmente en el navegador con las 4 cuentas de rol — login, dashboards con datos reales, CRUD de facultades, carga académica (incluyendo el rechazo de un choque real), horario semanal del estudiante, registro de asistencia por el docente, simulador de sensor (aceptó y rechazó lecturas según las reglas).
- **Responsividad**: probada en 375px (corregido: el sidebar no colapsaba y producía scroll horizontal), 768px y 1440px.
- **Verificación en vivo con Playwright (2026-11-24)**: recorrido automático de las 17 rutas del administrador y de las rutas propias de docente y estudiante; login con las 4 cuentas de demostración; CRUD de facultades (crear/eliminar con confirmación); búsqueda; sensor en modo online, offline y sincronización (lecturas con origen `SENSOR` en la API); cambio de nota con guardado `POST 201` y trazabilidad; exportación PDF/Excel con datos reales (PDF validado leyendo su texto); generación y restauración de respaldo; control de acceso por rol (rutas prohibidas redirigen al dashboard); error de credenciales incorrectas (401 y mensaje en pantalla). Sin errores de consola propios de la aplicación después de las correcciones 8 y 9.
- **Auditoría visual**: `node C:\Users\JDsal\.config\opencode\scripts\audit-screenshot.js http://localhost:5173` → HTTP 200 en 1440×900 y 390×844, sin errores de consola ni peticiones fallidas (última corrida: `C:\Users\JDsal\.config\opencode\audits\2026-11-24-21-38-44\`). Capturas adicionales del dashboard autenticado en `docs/auditorias/` (`dashboard-desktop-1440.png`, `dashboard-mobile-390.png`, `dashboard-mobile-menu-390.png`). Comprobación DOM: `scrollWidth === innerWidth` en 390, 768 y 1440 px; el drawer móvil se abre y cierra sin desbordamiento horizontal.
- Durante esta verificación se encontraron y corrigieron **7 errores reales**, no cosméticos:
  1. Ruta duplicada `/mi-horario` en el router (una para DOCENTE, otra para ESTUDIANTE): React Router solo registraba la primera, por lo que un estudiante autenticado era redirigido al dashboard en vez de ver su horario.
  2. El sidebar no era responsive: a 375px de ancho no colapsaba, producía scroll horizontal y ocultaba el contenido (regla de diseño "sin scroll horizontal" incumplida). Se implementó un drawer con overlay y botón de hamburguesa.
  3. `CargaAcademica.creadoPor` referencia la tabla `coordinadores` (no `usuarios`): al crear una carga académica autenticado como ADMINISTRADOR, el backend intentaba guardar el id del perfil de administrador en esa columna y violaba la restricción de llave foránea. Corregido para que `creadoPor` solo se registre cuando quien crea la carga es un COORDINADOR.
  4. (Menor) Las fechas puras (`@db.Date`) se mostraban con un día de desfase en el frontend por conversión de huso horario (`toLocaleDateString` en una zona UTC-5 corre un día una medianoche UTC). Corregido con un formateador que lee los componentes UTC.
  5. El orden de limpieza en `seed.ts` y `_check.ts` borraba `programa`/`facultad` antes que `estudiante`, que los referencia: el seed fallaría al ejecutarse una segunda vez. Corregido el orden en ambos scripts y en los helpers de prueba.
  6. La ruta `/microcurriculos` solo estaba protegida para ADMINISTRADOR/COORDINADOR, pero el menú lateral ya ofrecía ese enlace a DOCENTE (y debía ofrecerlo a ESTUDIANTE por HU-19): un docente que hacía clic en "Microcurrículos" era redirigido al dashboard. Corregido el `RoleRoute` para incluir los 4 roles donde corresponde.
  7. Cuando el access token expiraba y el refresh token también fallaba (revocado o expirado), el cliente limpiaba los tokens de `localStorage` pero dejaba el estado de React (`usuario`) intacto: la interfaz seguía mostrando al usuario como autenticado mientras todas las peticiones fallaban en silencio con 401. Se agregó un evento (`sistema-academico:sesion-expirada`) que `AuthContext` escucha para cerrar la sesión en la UI y redirigir a `/login` en cuanto el refresh falla.
  8. **Auditoría con filtros vacíos daba 500.** La UI enviaba `accion=` (cadena vacía) y Prisma rechazaba ese valor para el enum `TipoAccion`. Corregido normalizando los parámetros vacíos a `undefined` en `auditoria.schemas.ts` y en `auditoria.service.ts`, y validando los valores con `z.nativeEnum(TipoAccion)` (un valor inválido ahora responde 422, no 500).
  9. **Respaldos daban 500 al listarlos.** `tamanoBytes` es `BigInt` en Prisma y `res.json()` de Express no sabe serializarlo. Corregido en `respaldos.service.ts` exponiéndolo como cadena decimal; el cliente ya hacía `Number(...)` para mostrar KB. Se verificó generación y restauración real desde la UI.
  10. **Los selectores de Grupo/Docente/Aula en "Nueva asignación de carga académica" y en "Inscribir grupo" (horario del estudiante) quedaban vacíos en silencio.** El frontend pedía `?tamano=200`, pero `paginationQuerySchema` limita `tamano` a un máximo de 100 (`422 Unprocessable Entity`); como la petición fallaba sin que nada la mostrara en pantalla, los `<select>` simplemente no tenían opciones. Corregido en `CargasAcademicasPage.tsx` y `MiHorarioPage.tsx` bajando el límite a `tamano=100`. Encontrado creando una carga académica real desde el navegador (no solo por API) como parte de una segunda verificación independiente tras el rediseño.

### 5.1 Rediseño completo de la interfaz (2026-11-24)

Se aplicó el sistema **Campus Editorial** a toda la app sin cambiar lógica de negocio: paleta marfil / verde tinta / terracota, jerarquía tipográfica con regla de acento en cada pantalla, componentes compartidos (`Card`, `StatCard`, `Button`, `Input`, `Table`, `Badge`, `Modal`, `States`) rediseñados, dashboards con accesos rápidos, login de doble panel y gráficas con el nuevo lenguaje visual.

Responsividad verificada en navegador real:

- **1440 px**: barra lateral de 268 px con navegación agrupada por secciones y tarjeta de perfil; contenido centrado hasta 1320 px.
- **768 px**: drawer lateral; una sola columna de contenido.
- **390 px**: drawer + barra inferior con 4 accesos rápidos por rol; cada fila de tabla se convierte en tarjeta con etiqueta; el horario semanal se sustituye por una agenda por día; los modales se abren como hoja inferior.
- Las **17 rutas de administrador** se recorrieron a 390 px: `scrollWidth === innerWidth`, cero elementos fuera de pantalla y cero peticiones fallidas.
- Auditoría de arte (`impeccable`) encontró 5 fallos; todos corregidos y verificados en vivo: cierre con Escape y gestión de foco del drawer, contraste del texto del horario (5.1:1), objetivos táctiles de 44 px, jerarquía del login móvil y regeneración de capturas con datos cargados. La reauditoría detectó además un overlay de modal roto en tablet/desktop por un ancestro con `transform`; corregido con `createPortal` a `document.body`, foco inicial, trap de Tab y restauración del foco. Medido en 1440/768/390: overlay = viewport, X de 44 px cliqueable y foco devuelto al disparador.
- Capturas en `docs/auditorias/rediseno/` y auditoría global final en `C:\Users\JDsal\.config\opencode\audits\2026-11-24-21-54-20\` (HTTP 200 en 1440 y 390, sin errores de consola ni peticiones fallidas).

**Veredicto de arte final: `IMPECCABLE: PASS`** (jerarquía, estados, responsividad, consistencia y consola/red). La especificación completa del sistema visual está en `docs/DESIGN.md`.

### 5.2 Estados temporales y respaldos reales (2026-11-24, segunda revisión)

El usuario pidió revisar dos cosas: si los respaldos «eran de mentira» y si había apartados que se montaban sin feedback de procesamiento/éxito.

- **Respaldos reales**: cada generación escribe un JSON en `server/backups/` con las 31 tablas en orden de dependencias y crea un registro en la tabla `Respaldo` con tamaño y duración. Verificado en disco: 31 tablas, 12 usuarios, 2 facultades, 6 estudiantes y 4 calificaciones en el último archivo (~31 KB). La restauración trunca y reinserta en transacción; se comprobó en vivo que un nombre de facultad modificado vuelve a su valor original.
- **Bug real corregido en la restauración**: antes se truncaba `usuarios` con `CASCADE`, lo que borraba la bitácora (HU-23) y los refresh tokens. Ahora `usuario` se reinserta con `skipDuplicates` sin truncarse, de modo que se recuperan cuentas faltantes sin invalidar sesiones ni borrar auditoría. Nueva prueba de regresión que verifica datos restaurados + bitácora + sesiones conservadas.
- **Feedback global**: `FeedbackProvider` muestra un overlay de `procesando → éxito/error` para respaldos, restauración, reportes y sincronización de sensores, con duración mínima visible de 700 ms, spinner, barra indeterminada, «Operación finalizada» y botón «Entendido». `MutationFeedbackBridge` convierte cualquier mutación de TanStack Query en un toast de confirmación/error; los botones muestran «Procesando…» con spinner y las notas/asistencias muestran guardado inline.
- **Accesibilidad del feedback**: el overlay es `aria-modal`/`aria-live`, atrapa Tab, no se cierra con Escape mientras procesa, enfoca «Entendido» al terminar y pausa el trap del modal subyacente mediante `body.dataset.feedbackActivo`. La primera auditoría de arte encontró un fallo real: al cerrar el overlay abierto sobre un Modal, el cleanup del modal restauraba `overflow` y después el overlay volvía a escribir `hidden`, dejando la página trabada y el foco en `BODY`. Se corrigió con `lib/scrollLock.ts` (bloqueo con contador compartido) y `lib/foco.ts` (el foco vuelve al disparador o, si el modal ya se cerró, al botón que lo abrió). Verificado en 390/768/1440: `overflow` computable `visible`, foco en «Generar respaldo», «Restaurar», «Simular lectura» o «Ver datos» según el flujo.
- **Detalle adicional corregido**: `Input`/`Select`/`Textarea` generan `id` con `useId()` cuando no reciben `name`; antes varios `select` tenían etiquetas no asociadas (fallaba `getByLabel('Periodo académico')`).
- **Objetivos táctiles uniformes**: `Button` usa 44 px de altura en tamaños `sm` y `md` y la paginación también; antes «Generar respaldo» medía 40 px y «Restaurar» 32 px en tablet/escritorio.
- Capturas de los estados en `docs/auditorias/rediseno/feedback-*.png` (respaldo, restauración, reporte y sincronización, en 390 y 1440). Auditoría global definitiva en `C:\Users\JDsal\.config\opencode\audits\2026-11-24-21-54-20\`.

### 5.3 Segunda verificación independiente, creando datos reales desde cero (2026-11-24, tercera revisión)

Tras el rediseño "Campus Editorial", se hizo una verificación adicional centrada en una sola pregunta: "¿si cargo cosas nuevas, me deja?" — es decir, probar los botones "Crear" de verdad, no solo revisar que las páginas carguen. Se creó, desde el navegador y en este orden, una facultad nueva, un programa en esa facultad, una materia, un aula, un docente (confirmando además por API que la contraseña temporal entregada en pantalla permite iniciar sesión de verdad), un grupo, una carga académica, una unidad temática de un microcurrículo, una configuración de evaluación y un sensor — los diez con éxito, reflejándose correctamente en los selectores de otras pantallas (ej. el docente recién creado ya aparece disponible al asignar carga académica).

En este proceso se encontró el error 10 de la lista anterior (`tamano=200`), que había pasado inadvertido porque no produce ningún error visible: el `<select>` simplemente queda sin opciones.

## 6. Pruebas ejecutadas

- `cd server && npm test` → **31/31 pruebas pasando** (Vitest + Supertest), cubriendo CP-01, CP-02, CP-04, CP-05, HU-23 y HU-24 contra la API real (no mocks), incluidas 4 regresiones de los errores 8 y 9 y la nueva prueba de restauración sin pérdida de bitácora/sesiones.
- `npx tsx scripts/_check.ts` → verificación de integridad a nivel de base de datos (EXIT 0): choques de horario y bitácora inmutable.
- `tsc --noEmit` sin errores en `server/` y `client/`.
- **Nota:** `npm test` limpia y repuebla la base de datos con sus propios datos; después de ejecutarlo se corrió `npm run db:seed` para restaurar los datos de demostración.

## 7. Errores y limitaciones conocidas (pendientes, documentados a propósito — ver Regla 8)

- **Transportador de correo real (SMTP) no implementado.** `EMAIL_TRANSPORT=console` imprime el mensaje en el log del servidor; `enviarCorreo()` ya aísla el contrato para conectar un proveedor real (ej. nodemailer) sin tocar los llamadores.
- **Sin página de "olvidé mi contraseña" en el login.** El flujo completo existe en la API (`/api/auth/solicitar-reset`, `/api/auth/confirmar-reset`) pero no hay enlace ni formulario en `LoginPage`.
- **La edición de personas desde la UI cubre un subconjunto deliberado de campos** (nombres, apellidos, celular; estudiante además programa e ICFES). El documento de identidad, la fecha de nacimiento y el sexo no se editan desde esta pantalla (la API sí los admite vía `PUT` si hace falta corregir un dato mal cargado).
- **La restauración se verificó en el navegador y en pruebas automatizadas** con un respaldo generado justo antes, confirmando que los datos académicos vuelven a su estado y que la bitácora y las sesiones se conservan. Sigue siendo una operación destructiva para los datos académicos: usar solo con respaldos conocidos.
- **Swagger (`/api-docs`) documenta el contrato de autenticación y facultades en detalle**, como referencia del patrón; los demás módulos están listados en `tags` pero no tienen cada operación documentada individualmente.
- **Sin pruebas E2E de frontend guardadas en el repositorio**: la verificación se hizo en tiempo real con Playwright (MCP) sobre los 4 roles y los flujos críticos, pero esos pasos no quedaron como archivos `.spec.ts`.
- El respaldo lógico (`server/src/modules/respaldos`) cubre 31 tablas (académicas y `usuario`), no la totalidad absoluta de las 40 tablas. Quedan fuera por diseño la tabla `Respaldo`, notificaciones, reset de contraseñas y refresh tokens; estos últimos se conservan deliberadamente al restaurar para no cerrar sesiones activas.
- `npm run build` del client termina correctamente, pero Vite avisa de que el bundle supera 500 kB (900 kB sin comprimir, 246 kB gzip). Es un aviso de rendimiento, no un error; se puede resolver con code splitting por ruta.

## 8. Decisiones técnicas tomadas en esta sesión

- Se agregó un módulo `periodos` (no estaba en la lista original de endpoints del documento maestro) porque todo el resto del sistema —grupos, carga académica, calificaciones, reportes— depende de un periodo académico, y no existía forma de crearlos ni listarlos por API.
- Se agregó `GET /api/grupos/:id/estudiantes` para cumplir el requisito explícito del rol DOCENTE ("Consultar estudiantes inscritos en sus grupos"), que no tenía endpoint propio.
- El dashboard se sirve desde un único endpoint `GET /api/dashboard` que resuelve el contenido según el rol del token, en vez de 4 endpoints separados, para simplificar el consumo desde el frontend.
- La capa de reportes genera los tres formatos (JSON, Excel, PDF) a partir de la misma consulta de datos, evitando triplicar lógica de negocio.
- Las fechas de las columnas `@db.Date` se formatean en el frontend leyendo componentes UTC explícitamente (no `toLocaleString`) para evitar el corrimiento de un día en husos horarios negativos.

## 9. Próximas tareas recomendadas (en orden)

1. Agregar un formulario de "olvidé mi contraseña" en el login.
2. Escribir pruebas E2E con Playwright para los flujos críticos (login, choque de horario, registro de asistencia por sensor, calificaciones) sobre la interfaz real.
3. Conectar un transportador SMTP real si se requiere envío de correo fuera del entorno de demostración.
4. Documentar cada operación de los módulos restantes en Swagger (hoy solo auth y facultades están documentados en detalle).
5. Guardar los flujos ya verificados con Playwright como pruebas E2E versionadas (`playwright.spec.ts`) para que se puedan repetir en CI.

## 10. Documentación generada (Fase 14)

- `docs/uml/`: 8 diagramas Mermaid (casos de uso, clases, 3 de secuencia, actividades, componentes, despliegue), fieles a la implementación real y con notas explícitas de dónde y por qué difieren del documento original.
- `docs/manuales/`: manual de instalación, de configuración, técnico (para quien continúe el proyecto) y uno de usuario por cada uno de los 4 roles.
- `docs/presentacion/Guia_Presentacion_Sistema_Academico.pdf` (Fase 15): guía de exposición pantalla por pantalla (35 páginas), con 26 capturas reales tomadas de la aplicación corriendo (una por cada pantalla relevante de los 4 roles), resumen del proyecto, stack tecnológico por capa y, para cada pantalla, un bloque "Qué mostrar" y "Qué decir" con las reglas de negocio que vale la pena resaltar en vivo. Las capturas están versionadas en `docs/presentacion/capturas/` y el script que genera el PDF (reportlab) en el historial de la sesión, por si hay que regenerarlo tras un cambio visual.
