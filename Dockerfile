# Un solo servicio: frontend compilado + API Express en la misma URL.
# El PostgreSQL es externo (administrado): NO ejecutar `npm run db:up` aquí.
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

COPY . .
# Generar el cliente de Prisma ANTES de compilar: TS necesita los enums y tipos
# exportados por @prisma/client (Rol, TipoAccion, DiaSemana, PrismaClientKnownRequestError...).
RUN npx prisma generate --schema server/prisma/schema.prisma \
 && npm run build --workspace server \
 && npm run build --workspace client

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    BACKUP_DIR=/data/backups

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates openssl \
 && mkdir -p /data/backups \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 4000

# Aplica migraciones y arranca el servidor que también sirve el frontend.
CMD ["npm", "run", "start:prod"]
