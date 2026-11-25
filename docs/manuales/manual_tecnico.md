# Manual Técnico

Dirigido a quien continúe el desarrollo de este proyecto. Explica la arquitectura, las convenciones de código y cómo extenderlo siguiendo el mismo patrón, para que un módulo nuevo se vea y se comporte como los existentes.

## 1. Arquitectura en una mirada

```
Request HTTP
   │
   ▼
*.routes.ts        (Express Router: define el path, el método HTTP, el middleware de auth/rol y el schema de validación)
   │
   ▼
*.controller.ts    (lee req.body/params/query ya validados, llama al service, arma la respuesta HTTP y registra auditoría)
   │
   ▼
*.service.ts       (toda la lógica de negocio: reglas, validaciones de dominio, llamadas a Prisma)
   │
   ▼
Prisma Client      (server/src/shared/prisma.ts — instancia única)
   │
   ▼
PostgreSQL
```

Cada módulo de dominio vive en `server/src/modules/<nombre>/` y sigue siempre esta misma forma de 3 o 4 archivos. Ver `server/src/modules/facultades/` como el ejemplo más simple y completo (CRUD con paginación, búsqueda y auditoría).

## 2. Convenciones de código

- **Nombres en español** en todo el dominio de negocio (variables, funciones, mensajes de error, rutas de la API cuando tiene sentido: `/api/facultades`, `/api/cargas-academicas`). Los nombres técnicos genéricos (`req`, `res`, `next`, nombres de libraries) quedan en inglés, como es estándar.
- **Base de datos en snake_case**: el modelo Prisma usa camelCase (`numeroDocumento`), pero cada campo tiene `@map("numero_documento")` y cada tabla `@@map("nombre_plural")`, de modo que el SQL generado es snake_case idiomático. Si agrega un campo nuevo, siga el mismo patrón.
- **IDs**: `cuid()`, nunca autoincrementales, para evitar enumeración y permitir generación distribuida.
- **Errores centralizados** en `server/src/shared/errors.ts` (`BadRequestError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `LockedError`, `TooManyRequestsError`). Un service **nunca** responde HTTP directamente: lanza uno de estos errores, y `middleware/errorHandler.ts` los traduce al código de estado y formato JSON correctos (`{ error: { code, message, details } }`). Ese mismo manejador también traduce errores conocidos de Prisma (`P2002` duplicado, `P2025` no encontrado, `P2003` llave foránea) y el error crudo de PostgreSQL `23P01` (restricción `EXCLUDE`, usado para choques de horario) a respuestas HTTP coherentes.
- **Validación con Zod**, centralizada: cada módulo define sus schemas en `*.schemas.ts` y los aplica con el middleware genérico `shared/validate.ts` (`validate(schema, 'body' | 'query' | 'params')`). La ruta queda declarativa: `router.post('/', requireRole('ADMINISTRADOR'), validate(crearXSchema), controller.crear)`.
- **Autenticación y roles**: `middleware/auth.ts` expone `authenticate` (exige un JWT válido y llena `req.usuario`) y `requireRole(...roles)` (autoriza por rol). El control de acceso por **dato** (por ejemplo, que un estudiante solo vea su propio registro) se verifica explícitamente dentro del controller — ver `estudiantes.controller.ts` (`asegurarPropioRegistroOEquipo`) como ejemplo del patrón a replicar en cualquier endpoint nuevo que exponga datos de una persona específica.
- **Auditoría**: el único punto de escritura de la bitácora es `registrarAuditoria()` en `shared/auditoria.ts`. Se llama desde el controller, después de que la operación tuvo éxito, con la acción (`TipoAccion`), la entidad y, cuando aplica, los valores anteriores/nuevos. La tabla `auditorias` es inmutable por un trigger de base de datos (`bloquear_auditoria`); ni Prisma ni el código de aplicación pueden editarla o borrarla (solo `TRUNCATE`, usado exclusivamente en scripts de limpieza de pruebas).
- **Paginación**: `shared/pagination.ts` (`paginationQuerySchema`, `buildPaginatedResult`) y `shared/crudFactory.ts` (`listarPaginado`) estandarizan el formato `{ datos, paginacion: { pagina, tamano, total, totalPaginas } }` en todos los listados. Úselo para cualquier endpoint de listado nuevo en vez de paginar a mano.
- **Horas de clase**: las columnas `@db.Time(0)` de Postgres requieren objetos `Date` con fecha fija en la época (`1970-01-01T...Z`); use siempre el helper `shared/time.ts` (`horaATimestamp` / `timestampAHora`) en vez de construir el `Date` a mano, para no repetir el mismo bug dos veces.

## 3. Cómo agregar un módulo nuevo

1. Cree `server/src/modules/<nombre>/` con `<nombre>.schemas.ts`, `<nombre>.service.ts`, `<nombre>.controller.ts`, `<nombre>.routes.ts`.
2. En `schemas.ts`, defina los Zod schemas de entrada (crear/actualizar/query).
3. En `service.ts`, implemente la lógica contra `prisma` (importado de `../../shared/prisma.js`), lanzando los errores de `../../shared/errors.js` cuando corresponda. **No** importe Express aquí.
4. En `controller.ts`, envuelva cada handler con `asyncHandler` (de `shared/asyncHandler.ts`, propaga errores async a Express sin try/catch repetido), llame al service, y registre auditoría si la operación es de escritura.
5. En `routes.ts`, declare el `Router`, aplique `authenticate` (y `requireRole` donde aplique) y `validate(schema)` antes de cada handler.
6. Registre el router nuevo en `server/src/app.ts` (`api.use('/su-ruta', suRouter)`).
7. Si el frontend necesita consumirlo, agregue los tipos en `client/src/types/api.ts` y una página en `client/src/pages/`, reutilizando los componentes de `client/src/components/ui/` (`Card`, `Table`, `Modal`, `Button`, `Input`, `Select`, `Badge`, `LoadingState/EmptyState/ErrorState`) — no cree componentes de UI nuevos para necesidades ya cubiertas por el design system existente.

## 4. Frontend: convenciones

- **Tokens de diseño únicos** en `client/src/styles/tokens.css` (variables CSS, regla 60-30-10): nunca hardcodear un color hex en un componente; use las clases de Tailwind mapeadas (`bg-primary`, `text-accent`, `border-border`, etc. — ver `client/tailwind.config.js`).
- **Un solo cliente API** (`client/src/lib/api.ts`), que agrega el token de autenticación y refresca automáticamente la sesión ante un 401 (ver el propio archivo para el detalle del flujo de refresh).
- **TanStack Query** para todo fetching: `useQuery` para lecturas (con `queryKey` descriptivo) y `useMutation` + `queryClient.invalidateQueries` para escrituras, siguiendo el patrón ya usado en `FacultadesPage.tsx` (la página más completa como referencia).
- **Fechas puras** (`@db.Date`, sin hora) deben formatearse con `client/src/lib/format.ts` (`formatFecha`), no con `toLocaleDateString`, para evitar el corrimiento de un día en husos horarios negativos (bug real encontrado y corregido durante esta sesión — ver `docs/PROGRESS.md`).

## 5. Cómo correr las pruebas

```powershell
cd server
npm test
```

26 pruebas de integración (Vitest + Supertest) contra la API real (`createApp()` de `src/app.ts`), sin mocks, usando el mismo PostgreSQL embebido. `tests/helpers.ts` expone `limpiarBaseDeDatos()` (limpia todas las tablas en el orden correcto de dependencias) y `crearFixturesBase()` (un escenario académico mínimo reutilizable). `vitest.config.ts` fuerza `fileParallelism: false` porque todas las pruebas comparten una única base de datos — no hay un Postgres por worker.

**Importante:** correr las pruebas borra los datos de demostración. Después de `npm test`, ejecute `npm run db:seed` para restaurarlos si va a seguir demostrando la aplicación.

## 6. Dónde están documentados los pendientes

- `docs/PROGRESS.md` — estado real módulo por módulo (qué tiene backend, qué tiene frontend), errores encontrados y corregidos durante el desarrollo, limitaciones conocidas y las próximas tareas recomendadas, en orden de prioridad.
- `docs/analysis/decisiones_arquitectonicas.md` — el porqué de cada decisión técnica, en formato ADR.
- `docs/analysis/matriz_trazabilidad.md` — qué requerimiento (RF-01 a RF-24) se implementa en qué módulo, modelo y endpoint.

Antes de empezar a trabajar, lea `docs/PROGRESS.md`: ahí está la lista exacta de lo que falta y por qué se dejó así, para no repetir investigación ya hecha.
