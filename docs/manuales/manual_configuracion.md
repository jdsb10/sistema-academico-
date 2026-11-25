# Manual de Configuración

Todas las variables de entorno del backend viven en `server/.env` (ya viene con valores funcionales para desarrollo local). Este manual explica qué hace cada una y cuáles **debe** cambiar antes de un despliegue real.

## Base de datos

| Variable | Qué hace | Valor de desarrollo | ¿Cambiar en producción? |
|---|---|---|---|
| `DATABASE_URL` | Cadena de conexión que usa Prisma para hablar con PostgreSQL | `postgresql://postgres:postgres@localhost:5432/sistema_academico?schema=public` | **Sí** — apuntar al servidor PostgreSQL real, con un usuario y contraseña propios (nunca `postgres`/`postgres`) |
| `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` | Usados por `scripts/db.ts` para inicializar y arrancar el PostgreSQL embebido | `5432` / `postgres` / `postgres` / `sistema_academico` | Solo aplican al PostgreSQL embebido de desarrollo; en producción con un PostgreSQL gestionado, estas variables no se usan |

## Servidor

| Variable | Qué hace | Valor de desarrollo | ¿Cambiar en producción? |
|---|---|---|---|
| `PORT` | Puerto donde escucha la API Express | `4000` | Según el entorno de despliegue |
| `NODE_ENV` | Activa comportamientos de producción (oculta el `stack` de errores en las respuestas, por ejemplo) | `development` | **Sí** → `production` |
| `API_PREFIX` | Prefijo de todas las rutas de la API | `/api` | Normalmente no hace falta cambiarlo |

## Seguridad — Autenticación

| Variable | Qué hace | Valor de desarrollo | ¿Cambiar en producción? |
|---|---|---|---|
| `JWT_ACCESS_SECRET` | Clave con la que se firman los access tokens (JWT de corta duración) | Una cadena de ejemplo marcada como "cambiar en producción" | **Obligatorio cambiar** por un valor aleatorio largo y secreto |
| `JWT_REFRESH_SECRET` | Clave con la que se firman los refresh tokens | Ídem | **Obligatorio cambiar**, y debe ser **distinta** de `JWT_ACCESS_SECRET` |
| `JWT_ACCESS_TTL` | Cuánto dura un access token antes de expirar | `15m` | Ajustar según la política de seguridad de la institución |
| `JWT_REFRESH_TTL` | Cuánto dura un refresh token (cuánto puede estar un usuario sin volver a escribir su contraseña) | `7d` | Ídem |
| `BCRYPT_ROUNDS` | Costo computacional del hash de contraseñas (más alto = más lento de calcular, más seguro) | `10` | `10`–`12` es razonable en producción; no bajarlo |
| `LOGIN_MAX_ATTEMPTS` | Intentos fallidos antes de bloquear la cuenta (HU-01) | `5` | Según política institucional |
| `LOGIN_LOCK_MINUTES` | Minutos que dura el bloqueo de la cuenta | `15` | Según política institucional |

**Nunca versione (suba a git) un `.env` con los secretos reales de producción.** El `.env` de este repositorio solo tiene valores de desarrollo, marcados explícitamente como tales.

## CORS

| Variable | Qué hace | Valor de desarrollo |
|---|---|---|
| `CORS_ORIGINS` | Lista de orígenes (separados por coma) autorizados a llamar la API desde el navegador | `http://localhost:5173,http://127.0.0.1:5173` |

En producción, debe listar el dominio real donde se sirve el frontend (por ejemplo `https://academico.miuniversidad.edu.co`); de lo contrario el navegador bloqueará las peticiones por política de same-origin.

## Correo (HU-22)

| Variable | Qué hace | Valor de desarrollo |
|---|---|---|
| `EMAIL_TRANSPORT` | `console` imprime el correo en el log del servidor (para demostrar el flujo sin credenciales reales); `smtp` intentaría enviarlo por un servidor SMTP real | `console` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Credenciales del proveedor SMTP, solo se usan si `EMAIL_TRANSPORT=smtp` | vacíos |
| `EMAIL_FROM` | Remitente que aparece en los correos enviados | `sistema-academico@universidad.edu.co` |

> El transportador SMTP real (`enviarPorSmtp()` en `server/src/modules/notificaciones/email.service.ts`) está **preparado pero no implementado** — hoy lanza un error explicativo si se activa sin completarlo. Ver `docs/PROGRESS.md`, sección de pendientes.

## Respaldos (HU-24)

| Variable | Qué hace | Valor de desarrollo |
|---|---|---|
| `BACKUP_DIR` | Carpeta donde se guardan los archivos JSON de respaldo lógico | `./backups` (relativo a `server/`) |

## Resumen: checklist antes de desplegar a producción

- [ ] `DATABASE_URL` apunta a un PostgreSQL real, no al embebido de desarrollo.
- [ ] `NODE_ENV=production`.
- [ ] `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` son valores nuevos, aleatorios y distintos entre sí (nunca los de este repositorio).
- [ ] `CORS_ORIGINS` lista el dominio real del frontend.
- [ ] Si se necesita envío real de correo, completar el transportador SMTP o conectar un proveedor externo.
- [ ] El archivo `.env` de producción **no** se sube al control de versiones.
