# Decisiones Arquitectónicas — Sistema Académico Universitario

**Formato:** Architecture Decision Record (ADR). Cada decisión documenta Contexto, Decisión, Alternativas consideradas y Consecuencias. Referencias a RF-xx/HU-xx remiten a `parcial_Ingenieria-del-software-Juan Salas.pdf` (Doc2); referencias a clases remiten a `PROYECTO FINAL INGENIERIA DE SOFTWARE II.pdf` (Doc1).

---

## ADR-01. Monorepo con npm workspaces

**Contexto.** El proyecto tiene un backend (API) y un frontend (SPA) que evolucionan juntos durante los 6 sprints y comparten convenciones de nombres y tipos (DTOs). El equipo es de cuatro desarrolladores (Doc2, sección 2) trabajando en paralelo sobre módulos distintos.

**Decisión.** Se adopta un monorepo (`sistema-academico/`) con `npm workspaces` (`server/`, `client/`), un único `package.json` raíz con scripts (`dev`, `build`, `test`, `db:*`) que orquestan ambos paquetes con `concurrently`.

**Alternativas consideradas.** (a) Dos repositorios separados: descartado porque duplicaría la configuración de CI y dificultaría mantener sincronizados los contratos de API durante sprints cortos de 2 semanas. (b) Monorepo con Turborepo/Nx: descartado por complejidad innecesaria para un equipo de 4 personas y un backend/frontend (no hay librerías compartidas que justifiquen un build system de monorepo avanzado.

**Consecuencias.** Un solo `npm install` en la raíz instala ambos paquetes; los scripts `db:up`, `db:migrate`, `db:seed` quedan expuestos desde la raíz. Si el proyecto creciera a más de 2 paquetes con dependencias cruzadas, se debería reevaluar Nx/Turborepo.

---

## ADR-02. Backend modular: Node.js + Express + TypeScript

**Contexto.** Doc2 (sección 1) exige que ninguna función crítica (acceso, horarios, asistencia) falle, y Doc1 exige cubrir 18 clases con lógica de negocio no trivial (choques de horario, bitácora inmutable, validación de porcentajes de evaluación).

**Decisión.** Backend en Node.js 24 + TypeScript 5.7 + Express 4, con arquitectura en capas: `routes -> controllers -> services -> repositorio Prisma`, un módulo por entidad/dominio bajo `src/modules/`, validación Zod en el borde de cada ruta, manejo de errores centralizado y capa `shared/` para utilidades transversales (paginación, auditoría, `asyncHandler`).

**Alternativas consideradas.** (a) NestJS: ofrece DI e inyección de módulos out-of-the-box, pero añade decoradores y una curva de aprendizaje que no aporta valor proporcional al tamaño del equipo y el plazo (12 semanas, Doc2 sección 4); se opta por Express con una convención manual de capas equivalente. (b) Monolito sin separación de capas: descartado explícitamente por la Regla 5 del prompt maestro ("Evita código duplicado y archivos gigantes") y porque dificultaría las pruebas unitarias de servicios exigidas en la Fase 12.

**Consecuencias.** Cada módulo puede probarse de forma aislada (servicios con Vitest, API con Supertest). El tipado estricto de TypeScript reduce errores en los DTOs compartidos conceptualmente con el frontend.

---

## ADR-03. Prisma ORM + PostgreSQL, convenciones snake_case e IDs `cuid()`

**Contexto.** Doc1 exige integridad referencial, claves primarias/foráneas y relaciones 1-1, 1-N y N-N entre las 18 clases. El equipo necesita migraciones versionadas y tipado end-to-end desde la base de datos hasta el backend.

**Decisión.** PostgreSQL 17 como motor relacional, Prisma 6.19 como ORM y generador de migraciones. Las tablas y columnas se nombran en `snake_case` mediante `@map`/`@@map` (ej. `numero_programas`, `@@map("facultades")`) mientras el código TypeScript usa `camelCase`; los identificadores son `cuid()` en vez de autoincrementales.

**Alternativas consideradas.** (a) IDs autoincrementales (`serial`): descartado porque el proyecto plantea sincronización futura del sensor de asistencia sin conexión (HU-13) y los `cuid()` permiten generar identificadores válidos del lado del cliente sin coordinación con la base de datos. (b) TypeORM o Sequelize: descartados por el soporte superior de Prisma para migraciones declarativas legibles y su integración directa con TypeScript.

**Consecuencias.** El esquema SQL resultante es idiomático para un DBA (snake_case) sin sacrificar la ergonomía de TypeScript. Las migraciones (`prisma/migrations/`) quedan versionadas en el repositorio y son reproducibles con `prisma migrate deploy`.

---

## ADR-04. PostgreSQL embebido (`embedded-postgres` + `pg_ctl`) en el entorno de desarrollo

**Contexto.** La máquina de desarrollo (Windows 11) no tiene PostgreSQL instalado, no tiene Docker y no dispone de permisos de administrador (winget requiere UAC). La Regla 2 del prompt maestro exige que el proyecto sea ejecutable localmente sin asumir conocimientos avanzados de configuración de servidores (Fase 15).

**Decisión.** Se usa `embedded-postgres@17.12.0-beta.19` (binarios oficiales de PostgreSQL 17.12 descargados por npm) junto con un script propio (`server/scripts/db.ts`) que invoca `initdb.exe`/`pg_ctl.exe` directamente, en vez de la API Node del paquete (que apagaba el servidor al salir el proce15 padre). `pg_ctl start -w` desacopla el proceso del servidor y lo deja persistente entre comandos.

**Alternativas consideradas.** (a) Pedir al usuario instalar PostgreSQL o Docker manualmente: descartado por la Regla 15 ("no asumas que tengo conocimientos avanzados de configuración de servidores") y porque requeriría permisos de administrador no disponibles. (b) SQLite: descartado porque el proyecto necesita `EXCLUDE` constraints con `btree_gist` (choques de horario, ver ADR-10) y tipos `Decimal`/`Json` que SQLite no soporta de forma nativa y confiable.

**Consecuencias.** `npm run db:up` levanta un PostgreSQL real con un solo comando, sin instalación. El paquete embebido no incluye `psql` ni `pg_dump`, lo que obliga a la decisión de respaldo lógico del ADR-09. En producción se recomienda sustituir por un PostgreSQL gestionado o instalado de forma estándar (ver manual de instalación).

---

## ADR-05. Validación centralizada con Zod

**Contexto.** Doc1 exige campos obligatorios/opcionales, códigos únicos y validación de duplicados en casi todos los módulos (Facultades, Programas, Materias, Aulas); Doc2 (CP-05) exige rechazar notas fuera de rango con mensajes claros. La Regla 4 del prompt maestro prohíbe formularios o endpoints que no validen realmente.

**Decisión.** Toda validación de entrada (body, params, query) se declara con esquemas Zod en el backend, ejecutados en un middleware antes de llegar al controlador. El frontend reutiliza las mismas reglas de negocio documentadas (no necesariamente los mismos esquemas) para dar feedback inmediato, pero el backend es la única fuente de verdad.

**Alternativas consideradas.** (a) `class-validator`/decoradores: acoplado a un estilo orientado a clases que no se usa en el resto del backend (Express plano). (b) Validación manual por `if`: descartada por duplicación de código y por violar la Regla 5 (evitar código duplicado).

**Consecuencias.** Los esquemas Zod documentan el contrato de cada endpoint y generan mensajes de error consistentes. Permite derivar tipos TypeScript (`z.infer`) sin mantenerlos por separado.

---

## ADR-06. Autenticación JWT (access + refresh) con bcrypt y bloqueo de cuenta

**Contexto.** HU-01/RF-01 (la función más crítica según Doc2, sección 9) exige inicio de sesión por rol, bloqueo tras 5 intentos fallidos durante 15 minutos, y que un rol no pueda abrir pantallas de otro (CP-01). R-02 (Doc2, sección 5) califica la fuga de datos como riesgo crítico (P×I=15).

**Decisión.** Contraseñas con `bcryptjs` (hash, nunca texto plano). Sesión mediante JWT de acceso de vida corta (`JWT_ACCESS_TTL=15m`) y JWT de refresco de vida larga (`JWT_REFRESH_TTL=7d`) persistido con hash en la tabla `refresh_tokens` (revocable). Bloqueo de cuenta contado en `usuarios.intentos_fallidos`/`bloqueado_hasta`, con cada intento registrado en `intentos_acceso` (detecta también fallos repetidos desde una misma IP, alerta A-02). Autorización por rol mediante *guards* de middleware en el backend (no solo ocultando botones en el frontend), exigido también por la Fase 4 del prompt maestro.

**Alternativas consideradas.** (a) Sesiones de servidor con cookies + almacenamiento en memoria: descartado porque complica escalar a múltiples instancias y el frontend es una SPA separada del backend (CORS). (b) Un solo JWT de larga duración sin refresh: descartado porque un token robado seguiría siendo válido por mucho tiempo, contradiciendo la mitigación de R-02.

**Consecuencias.** El cierre de sesión revoca el refresh token (tabla `refresh_tokens.revocada`). El bloqueo de 15 minutos y los 5 intentos son configurables por variable de entorno (`LOGIN_MAX_ATTEMPTS`, `LOGIN_LOCK_MINUTES`) sin tocar código, cumpliendo CP-01.

---

## ADR-07. Frontend: React 19 + Vite 6 + TypeScript + Tailwind 3 + React Router 7 + TanStack Query 5

**Contexto.** La Fase 6 del prompt maestro exige una apariencia profesional tipo SaaS, con cuatro dashboards distintos por rol, y la Regla 4 prohíbe datos estáticos que simulen funcionalidades que deberían venir del backend.

**Decisión.** SPA en React 19 con Vite 6 (build rápido, HMR), TypeScript estricto, Tailwind CSS 3 con tokens de diseño propios (ver `docs/design/` cuando se cree), React Router 7 para enrutamiento por rol y TanStack Query 5 como capa de datos (cache, invalidación, estados `loading`/`error` reales contra la API), `lucide-react` para iconografía y `recharts` para gráficas de dashboards.

**Alternativas consideradas.** (a) Next.js: su renderizado híbrido servidor/cliente no aporta valor para una SPA interna detrás de autenticación y añade complejidad de despliegue. (b) Redux/Zustand para estado remoto: descartado porque TanStack Query ya resuelve cache e invalidación de datos del servidor sin necesidad de un store global adicional; el estado de UI puramente local usa `useState`/Context.

**Consecuencias.** Cada pantalla consulta datos reales vía TanStack Query contra `/api/...`; los estados de carga, vacío y error son explícitos (ver checklist Impeccable del proyecto). No se usa una librería de componentes genérica (Material UI, Ant Design) para evitar la apariencia "plantilla" que la Regla de diseño del usuario prohíbe explícitamente.

---

## ADR-08. `HorarioDocente` como vista SQL en vez de tabla propia

**Contexto.** Doc1 define la clase `HorarioDocente` con atributos (`CodigoHorarioDocente`, `IdDocente`, `NombreDocente`, `NombreAula`, `Hora`, `Grupo`, `Dia`, `CodigoMateria`, `NombreMateria`) que son, en su totalidad, derivables de `CargaAcademica` + `Docente` + `Aula` + `Grupo` + `Materia`. HU-12/RF-12 solo exige *consultar* el horario del docente, nunca editarlo directamente.

**Decisión.** `HorarioDocente` se implementa como una **vista SQL** (`horario_docente`) sobre `cargas_academicas`, sin tabla ni modelo de escritura propio. La edición real ocurre sobre `CargaAcademica` (HU-09); la vista solo expone una proyección de lectura ya resuelta (docente, aula, día, hora, materia).

**Alternativas consideradas.** (a) Tabla `horarios_docentes` poblada por trigger o por el servicio de carga académica: descartada porque duplicaría el mismo dato que ya vive en `cargas_academicas`, con riesgo de desincronización (contradice el mandato del prompt maestro de "no guardar información duplicada si puede obtenerse correctamente mediante relaciones").

**Consecuencias.** La vista se mantiene siempre consistente con la carga académica sin lógica adicional. El modelo relacional documentado en `docs/database/` debe señalar explícitamente que `HorarioDocente` no es una tabla base. Queda verificado en `_check.ts` (handoff, punto 6).

---

## ADR-09. Respaldo lógico en TypeScript sobre Prisma, en vez de `pg_dump`

**Contexto.** HU-24/RF-24 exige respaldo diario con copia externa y restauración probada en menos de 2 horas (CP-06). El paquete `embedded-postgres` para Windows x64 no incluye el binario `pg_dump` (ADR-04).

**Decisión.** El respaldo se implementa como un volcado lógico en TypeScript: un script que lee todas las tablas vía Prisma Client, serializa el contenido a JSON (con metadatos de fecha/tabla) y lo guarda en `BACKUP_DIR`; la restauración recorre el mismo JSON y repuebla las tablas respetando el orden de dependencias (FK). El resultado queda registrado en el modelo `Respaldo` (nombre de archivo, tamaño, duración, estado).

**Alternativas consideradas.** (a) Instalar `pg_dump` por separado: descartado porque reintroduce una dependencia de instalación manual que el ADR-04 buscaba evitar. (b) Respaldo a nivel de archivo (copiar `.pgdata`): descartado porque exige detener el servidor para garantizar consistencia, lo que no es aceptable para un respaldo diario en producción.

**Consecuencias.** El formato de respaldo es portable (JSON) y auditable por fuera de PostgreSQL, a costa de ser más lento que `pg_dump` en bases muy grandes; aceptable para el volumen de un sistema académico institucional. En un despliegue de producción con PostgreSQL estándar, se recomienda complementar con `pg_dump`/`pg_basebackup`.

---

## ADR-10. Restricciones `EXCLUDE` con `btree_gist` para choques de horario

**Contexto.** HU-09/RF-09 y CP-02 exigen que el sistema rechace que un mismo docente o una misma aula queden asignados a dos clases distintas en el mismo día y horario, incluyendo el caso límite de horas contiguas (8-10 y 10-12) que NO deben considerarse traslape. R-04 (Doc2) califica los choques de horario que llegan a producción como riesgo alto, y su mitigación pide "restricciones únicas en base de datos además de la validación en código".

**Decisión.** La migración `integridad_y_reglas_de_negocio` habilita la extensión `btree_gist` y define tres restricciones `EXCLUDE` sobre `cargas_academicas` (`cargas_sin_traslape_docente`, `cargas_sin_traslape_aula`, `cargas_sin_traslape_grupo`), todas delimitadas por `periodo_id` y `dia`, usando `numrange` en minutos para expresar el rango horario. Como `extract()` y la conversión de enum a texto son `STABLE` (no `IMMUTABLE`) en PostgreSQL, se crean funciones envoltorio marcadas `IMMUTABLE` (`rango_minutos`, `dia_codigo`) para que la restricción `EXCLUDE` sea válida.

**Alternativas consideradas.** (a) Validar el choque únicamente en el servicio (lectura + comparación antes de insertar): descartada como única defensa porque no es atómica ante escrituras concurrentes (dos coordinadores guardando al mismo tiempo); se mantiene como primera línea de validación (mensajes de error claros) pero la base de datos es la garantía final.

**Consecuencias.** Un choque de horario es imposible de persistir incluso ante condiciones de carrera. El caso límite de horas contiguas (CP-02 Caso C) quedó verificado en `_check.ts` (handoff, punto 6).

---

## ADR-11. Trigger de bitácora inmutable (`auditorias`)

**Contexto.** HU-23/RF-23 exige una bitácora de auditoría de acciones críticas (altas, bajas, cambios de nota y de carga) que registre usuario, fecha, hora y valor anterior, y que "no se pueda editar". La alerta A-06 (Doc2) exige poder restaurar un valor anterior desde la bitácora ante un cambio de notas anómalo, lo que solo tiene sentido si la bitácora misma es confiable.

**Decisión.** Se crea un trigger de base de datos (`bloquear_auditoria()`) que rechaza explícitamente cualquier `UPDATE` o `DELETE` sobre la tabla `auditorias`; solo se permite `INSERT`. La limpieza en pruebas automatizadas debe hacerse con `TRUNCATE TABLE auditorias CASCADE` (no `DELETE`), documentado como trampa resuelta en el handoff.

**Alternativas consideradas.** (a) Controlar la inmutabilidad solo a nivel de aplicación (no exponer un método `update`/`delete` en el servicio): descartada porque no protege contra accesos directos a la base de datos ni cumple con el espíritu de "bitácora que no se puede editar" exigido literalmente por HU-23.

**Consecuencias.** Verificado en `_check.ts`: un intento de `UPDATE`/`DELETE` sobre `auditorias` es rechazado por PostgreSQL (handoff, punto 6). Cualquier corrección de un registro de auditoría debe hacerse mediante un nuevo registro `INSERT` que referencie al anterior, nunca modificando el original.

---

## ADR-12. Normalización: no duplicar campos derivables de una relación

**Contexto.** Doc1 repite, en varias clases, atributos que son en realidad propiedades de una entidad relacionada: `Estudiante` lista `CodigoFacultad`/`NombreFacultad` aunque la facultad se deriva del programa; `Aula` no tiene `Sede` pero el enunciado la espera disponible por aula; `HorarioEstudiante` repite `NombreEstudiante`/`NombreMateria`/`NombreAula` que ya existen en las entidades relacionadas; `PlanMicrocurriculo` repite `NombreDocente`/`Correo`/`Facultad`/`Materia`/`Creditos` del docente, programa y microcurrículo. El prompt maestro autoriza expresamente modificar la implementación interna y normalizar siempre que se conserve la cobertura conceptual de los atributos (sección 4 del prompt maestro, fase 3 del enunciado).

**Decisión.** Estos atributos **no se guardan como columnas duplicadas**; se exponen calculados en la capa de API mediante los `include`/`select` de Prisma sobre las relaciones ya existentes (ej. `estudiante.programa.facultad`, `aula.sede`, `cargaAcademica.grupo.materia`). La decisión exacta por campo queda en `docs/database/decisiones_normalizacion.md`.

**Alternativas consideradas.** (a) Duplicar literalmente cada atributo como columna, sincronizada por triggers: descartada porque multiplica el riesgo de inconsistencia (R-08, "datos duplicados o inconsistentes") sin ganancia real de rendimiento para el volumen esperado de una sola institución. Única excepción ya existente: `facultades.numero_programas`, que el documento exige como contador propio de `Facultad` y que se sincroniza con un trigger (`sincronizar_numero_programas`) porque no es un campo "derivado de una fila" sino una agregación que conviene materializar para lectura rápida en el dashboard administrador.

**Consecuencias.** El esquema relacional es más pequeño y consistente por construcción. El costo es que cada consulta que necesita estos campos debe pedir explícitamente el `include` de la relación; se mitiga con DTOs de respuesta estándar por módulo que siempre incluyen los campos derivados esperados por el frontend.
