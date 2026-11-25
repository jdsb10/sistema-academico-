# Diagrama de Despliegue — Sistema Académico Universitario

## Despliegue actual (desarrollo local, el que realmente corre hoy)

El proyecto fue diseñado para ejecutarse en una sola máquina **sin instalar PostgreSQL ni Docker** y **sin permisos de administrador** (ver ADR correspondiente en `docs/analysis/decisiones_arquitectonicas.md`): usa binarios oficiales de PostgreSQL 17 descargados por npm (`embedded-postgres`) y gestionados con `pg_ctl` directamente.

```mermaid
flowchart LR
    subgraph Maquina["Una sola máquina (desarrollador o evaluador)"]
        direction TB

        Browser["Navegador\n(Chrome, Edge, Firefox)"]

        subgraph NodeProc1["Proceso Node — Vite dev server"]
            Vite["Vite 6\npuerto 5173\nsirve client/ + proxy /api → :4000"]
        end

        subgraph NodeProc2["Proceso Node — API"]
            Express["Express 4 + TypeScript\npuerto 4000\nserver/src/main.ts"]
        end

        subgraph PGProc["Proceso PostgreSQL embebido"]
            PGCtl["pg_ctl (binarios oficiales 17.12)\npuerto 5432\ndata dir: server/.pgdata"]
        end

        Disco[("Disco local\nserver/.pgdata/ (datos)\nserver/backups/ (respaldos JSON)")]

        Browser -- "HTTP :5173" --> Vite
        Vite -- "proxy /api/*" --> Express
        Express -- "Prisma Client\nTCP :5432" --> PGCtl
        PGCtl --> Disco
    end
```

Para producción local (`npm run build && npm start`), `NodeProc1` desaparece: el frontend se compila a archivos estáticos y Express podría servirlos directamente, o se despliegan por separado como en la alternativa de abajo.

## Alternativa sugerida para un despliegue real en producción (no implementada en este proyecto)

Si la institución necesitara exponer el sistema en internet para varios usuarios concurrentes, la recomendación — **no construida en esta sesión, solo documentada como siguiente paso** — sería:

```mermaid
flowchart LR
    Users["Usuarios\n(navegador)"] -->|HTTPS| LB["Reverse proxy / balanceador\n(nginx o similar) + TLS"]
    LB -->|Archivos estáticos| CDN["Frontend compilado\n(client/dist) servido estáticamente o por CDN"]
    LB -->|/api/*| AppServers["1..N instancias de la API\n(Node/Express, sin estado)"]
    AppServers -->|Prisma Client\nTCP 5432 con TLS| ManagedPG[("PostgreSQL gestionado\n(servicio administrado o\nservidor dedicado, con pg_dump/pg_restore reales)")]
    AppServers --> SMTP["Proveedor SMTP real\n(reemplaza el transportador 'consola')"]
    ManagedPG --> Backups[("Respaldos automáticos\ndel propio proveedor + copia externa")]
```

Diferencias clave frente al entorno actual:

- PostgreSQL embebido (un solo proceso, pensado para desarrollo sin privilegios) se reemplaza por un **PostgreSQL gestionado o dedicado**, que sí trae `pg_dump`/`pg_restore` nativos — el respaldo lógico en TypeScript (`server/src/modules/respaldos`) dejaría de ser necesario, aunque podría conservarse como respaldo adicional de aplicación.
- La API pasaría de un proceso único a **N instancias sin estado** detrás de un balanceador, ya que la autenticación es JWT (no depende de sesión en memoria).
- El transportador de correo "consola" (`EMAIL_TRANSPORT=console`) se reemplazaría por un proveedor SMTP real, cambiando solo una variable de entorno y la función `enviarPorSmtp()` ya prevista en `email.service.ts`.
- Se agregaría TLS/HTTPS en el borde (reverse proxy), que hoy no es necesario porque todo corre en `localhost`.
