# Despliegue — un solo servicio

Frontend, API y Swagger se sirven desde **la misma URL y el mismo contenedor**. El PostgreSQL es externo/administrado: el paquete embebido del proyecto es Windows y **no debe ejecutarse en la nube**.

## Archivos preparados

| Archivo | Función |
|---|---|
| `Dockerfile` | Build multi-stage: compila server + client y arranca con `npm run start:prod` |
| `.dockerignore` | Excluye `node_modules`, `dist`, `.env`, backups y logs del contexto |
| `package.json` → `start:prod` | `prisma migrate deploy` + `node server/dist/main.js` |
| `server/src/app.ts` | Sirve `client/dist` y hace fallback de React Router detrás de `/api`, `/api-docs` y `/health` |

> El contexto de build debe ser la carpeta **`sistema-academico/`** (donde está el `Dockerfile`), no la raíz del disco.

## Variables de entorno

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://usuario:password@host:5432/sistema_academico
JWT_ACCESS_SECRET=<secreto-nuevo-largo>
JWT_REFRESH_SECRET=<otro-secreto-nuevo-largo>
CORS_ORIGINS=https://tu-dominio.com
BACKUP_DIR=/data/backups
```

- `DATABASE_URL` la entrega la plataforma al crear el PostgreSQL. Si el hosting usa otro nombre (`DATABASE_PUBLIC_URL`, `POSTGRES_URL` o `PGURL`), `scripts/start-prod.mjs` lo detecta y lo copia automáticamente. Si ninguna existe, el contenedor falla con un mensaje claro en vez de arrancar a medias.
- Los `JWT_*` del `server/.env` son solo de desarrollo: genéralos nuevos.
- `CORS_ORIGINS` debe ser el dominio final exacto (sin `/api`, sin coma si solo hay uno).
- `/data` debe ser un **volumen persistente**: ahí se guardan los respaldos HU-24.

`EMAIL_TRANSPORT=console` está bien si no quieres correos reales. Para SMTP, agrega `EMAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `EMAIL_FROM`.

## Railway (recomendado)

1. Crea proyecto → **New → Database → Add PostgreSQL**.
2. En el mismo proyecto → **New → Deploy from GitHub repo** o, sin repo, desde la carpeta `sistema-academico`:
   ```powershell
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```
   Railway detecta el `Dockerfile` automáticamente.
3. En el servicio web → **Variables** pega las variables de arriba. Para la DB, haz clic en **+ New Variable → Add reference** y elige la variable `DATABASE_URL` del servicio PostgreSQL. Si no aparece, entra al servicio PostgreSQL → **Variables**, copia `DATABASE_PUBLIC_URL` y pégala como `DATABASE_URL` en el servicio web. `scripts/start-prod.mjs` también acepta `DATABASE_PUBLIC_URL` directo.
   > Si ves `Environment variable not found: DATABASE_URL`, significa que el servicio PostgreSQL aún no está creado o no está vinculado: no es un error de código.
4. En el servicio → **Settings → Volumes → New volume**, mount path `/data`.
5. **Settings → Generate Domain**. Healthcheck: `/health`.
6. Los datos de demo se cargan **automáticamente en el primer deploy**: `scripts/start-prod.mjs` aplica las migraciones y, si la base está vacía (0 usuarios y 0 sedes), ejecuta el seed. En deploys siguientes detecta los datos existentes y no los borra. Para desactivarlo, agrega la variable `SEED_ON_START=false`.
   > El seed es destructivo por diseño, por eso solo corre con la base vacía. Si necesitas recargarlo, hazlo a mano con `railway run -- npm run db:seed --workspace server`.

## Render

1. Sube `sistema-academico/` a GitHub/GitLab.
2. **New → PostgreSQL** y copia el *Internal Database URL* en `DATABASE_URL`.
3. **New → Web Service** apuntando al repo, **Root Directory = `sistema-academico`**, Runtime `Docker`, `Dockerfile Path = ./Dockerfile`.
4. Variables de entorno las de arriba. En **Disks** agrega un disk montado en `/data` y deja `BACKUP_DIR=/data/backups`.
5. Health Check Path: `/health`.

## Fly.io

1. Desde `sistema-academico/`:
   ```powershell
   fly launch --no-deploy
   fly postgres create --name academia-db
   fly postgres attach academia-db
   fly volumes create backups --size 1
   fly secrets set NODE_ENV=production JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." CORS_ORIGINS="https://tu-app.fly.dev" BACKUP_DIR=/data/backups
   fly deploy
   ```
2. En `fly.toml` confirma `internal_port = 4000` y agrega el mount:
   ```toml
   [[mounts]]
     source = "backups"
     destination = "/data"
   ```

## Verificación después de desplegar

```text
GET  https://TU_DOMINIO/health        → {"estado":"ok",...}
GET  https://TU_DOMINIO/              → frontend (H1 de login o dashboard)
GET  https://TU_DOMINIO/api-docs      → Swagger
POST https://TU_DOMINIO/api/auth/login con las credenciales demo → 200 con tokens
POST https://TU_DOMINIO/api/respaldos con Bearer token → archivo en /data/backups
```

Si `/health` responde pero `/` da 404, revisa que el build haya generado `client/dist` y que no se esté usando `npm run start` (sin migraciones) en vez de `start:prod`.

## No olvidar

- **Nunca** corras `npm run db:up` en Linux: intentaría arrancar binarios Windows.
- Las migraciones son idempotentes y corren en cada arranque; no hay que ejecutarlas a mano.
- El seed crea usuarios demo con contraseña conocida: úsalo solo en entornos de prueba.
- Sin volumen persistente, los respaldos desaparecen al redeploy.
