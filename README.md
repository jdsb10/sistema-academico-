# Sistema Académico Universitario

Proyecto Final — Ingeniería de Software II. Plataforma académica completa (backend + frontend + base de datos) para gestionar facultades, programas, materias, aulas, carga académica, horarios, asistencia (con simulador de sensor), microcurrículos, calificaciones, reportes, auditoría y respaldos, con autenticación por rol (Administrador, Coordinador, Docente, Estudiante).

Construida a partir de dos documentos fuente: el enunciado original (18 clases) y el plan ágil (24 historias de usuario, Scrum, riesgos y plan de pruebas). Ver [`docs/`](docs/) para el análisis completo.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js 24 + Express 4 + TypeScript, arquitectura modular (routes → controllers → services → Prisma) |
| Base de datos | PostgreSQL 17 **embebido** (sin instalación, sin privilegios de administrador) + Prisma ORM |
| Validación | Zod (centralizada por módulo) |
| Autenticación | JWT (access + refresh), bcrypt, bloqueo de cuenta tras 5 intentos fallidos |
| Frontend | React 19 + Vite 6 + TypeScript + Tailwind CSS + React Router 7 + TanStack Query 5 + Recharts |
| Reportes | pdfkit (PDF) y exceljs (Excel) |
| Pruebas | Vitest + Supertest (backend, 30 casos de integración) |
| Diseño | Sistema visual "Campus Editorial" (tokens 60-30-10, responsive por rol): ver `docs/DESIGN.md` |

## Requisitos previos

- Node.js ≥ 20 (probado con Node 24) y npm.
- Windows, macOS o Linux. **No necesita** PostgreSQL, Docker ni permisos de administrador: el proyecto descarga y gestiona su propio PostgreSQL embebido la primera vez que se ejecuta `npm run db:up`.

## Instalación y ejecución (paso a paso)

```powershell
# 1. Instalar dependencias de todo el monorepo (raíz, server y client)
npm install

# 2. Levantar PostgreSQL embebido (crea el cluster la primera vez)
npm run db:up

# 3. Aplicar las migraciones y generar el cliente de Prisma
npm run db:migrate

# 4. Cargar datos de demostración (institución, roles, horarios, notas de ejemplo)
npm run db:seed

# 5. Iniciar backend y frontend juntos
npm run dev
```

- Backend: http://localhost:4000 — documentación Swagger en http://localhost:4000/api-docs
- Frontend: http://localhost:5173

Para detener la base de datos: `npm run db:down`. Para reiniciarla desde cero: `npm run db:reset` (borra los datos; vuelva a correr `db:migrate` y `db:seed`).

## Despliegue

Un solo contenedor sirve el frontend y la API en la misma URL (`/`, `/api`, `/api-docs`), con PostgreSQL administrado externo. Instrucciones completas para Railway, Render y Fly.io en [`docs/DESPLEGUE.md`](docs/DESPLEGUE.md). No ejecutar `npm run db:up` en la nube.

## Credenciales de demostración

Todas las cuentas de ejemplo usan la misma contraseña: **`DemoAcademico2026!`**

| Rol | Correo |
|---|---|
| Administrador | `admin@universidad.edu.co` |
| Coordinador (Ingeniería de Software) | `coordinador.isw@universidad.edu.co` |
| Coordinador (Administración de Empresas) | `coordinador.adm@universidad.edu.co` |
| Docente | `docente.rendon@universidad.edu.co`, `docente.lafont@universidad.edu.co`, `docente.salas@universidad.edu.co` |
| Estudiante | `est.brochero@universidad.edu.co`, `est.molina@universidad.edu.co`, `est.perez@universidad.edu.co`, `est.gutierrez@universidad.edu.co`, `est.rojas@universidad.edu.co`, `est.vargas@universidad.edu.co` |

## Variables de entorno

`server/.env` ya viene configurado para desarrollo local (JWT, bloqueo de cuenta, CORS, correo en modo consola). **Nunca** versione un `.env` con secretos reales de producción; cambie `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` antes de desplegar.

## Pruebas automatizadas

```powershell
cd server
npm test
```

31 pruebas de integración (Vitest + Supertest) contra la API real, cubriendo los 6 casos de prueba del plan ágil (CP-01 a CP-05, HU-23): bloqueo de cuenta, choques de horario (docente/aula/contiguos), inscripción de estudiante sin choques ni sobrecupo, rango y trazabilidad de calificaciones, control de acceso por rol (IDOR) y bitácora de auditoría. Incluyen regresiones para los filtros vacíos de auditoría, la serialización de respaldos y la restauración real sin borrar bitácora ni sesiones activas.

> **Importante:** `npm test` limpia y repuebla la base de datos con datos de prueba propios. Si venía de usar la aplicación con los datos de demostración, ejecute `npm run db:seed` de nuevo después de correr las pruebas.

## Estructura del proyecto

```
sistema-academico/
├── server/                   # API REST (Express + Prisma)
│   ├── src/
│   │   ├── config/           # Variables de entorno validadas (Zod)
│   │   ├── shared/           # Prisma client, errores, paginación, auditoría, JWT
│   │   ├── middleware/       # Autenticación, roles, rate limiting, manejo de errores
│   │   ├── modules/          # Un módulo por dominio (auth, facultades, cargas-academicas, ...)
│   │   └── docs/swagger.ts   # Documentación OpenAPI
│   ├── prisma/                # Esquema (40 modelos), migraciones, seed
│   ├── scripts/                # Ciclo de vida de PostgreSQL embebido, verificación de integridad
│   └── tests/                  # Pruebas de integración
├── client/                   # SPA (React + Vite + Tailwind)
│   └── src/
│       ├── components/        # Design system (ui/, layout/, horario/)
│       ├── context/             # Autenticación (JWT + refresh) y feedback global de operaciones
│       ├── pages/                # Una página por módulo, organizadas por rol
│       └── lib/                    # Cliente API, formato de fechas
└── docs/
    ├── analysis/             # Requerimientos, reglas de negocio, decisiones arquitectónicas (ADR)
    ├── scrum/                # Backlog, sprints, riesgos, plan de pruebas
    ├── uml/                  # Diagramas Mermaid: casos de uso, clases, secuencia, actividades, componentes, despliegue
    └── manuales/             # Manual de instalación, configuración, técnico y de usuario por rol
```

## Módulos implementados

Las 18 entidades del enunciado original y las 24 historias de usuario del plan ágil están implementadas de extremo a extremo (base de datos → API → interfaz), incluyendo:

- Autenticación JWT por rol, bloqueo de cuenta, recuperación de contraseña.
- CRUD de facultades, programas, materias, aulas, grupos y las 4 personas (administrador, coordinador, docente, estudiante) con baja lógica.
- Carga académica con restricciones de choque de horario (docente, aula y grupo) a nivel de base de datos (`EXCLUDE` constraints) y de API.
- Horarios de estudiante y docente (vista semanal), inscripción con validación de cupo y choques.
- Asistencia por sesión + **simulador del sensor de asistencia** (registro, validaciones, cola de sincronización sin conexión).
- Microcurrículo, competencias específicas y planes de seguimiento por periodo.
- Calificaciones con configuración de evaluaciones (porcentajes deben sumar 100%), rango 0.0–5.0 y trazabilidad completa (bitácora de cambios).
- Reportes exportables a PDF y Excel con datos reales.
- Bitácora de auditoría inmutable (trigger de base de datos) y respaldos lógicos reales en JSON (31 tablas); la restauración no borra la bitácora ni los tokens en uso.
- Feedback visible en toda la app: estados de carga con spinner, botones con «Procesando…», overlay de operaciones largas (respaldos, reportes, sincronización) con pantalla de «Operación finalizada» y notificaciones de confirmación/error para el resto de mutaciones.

Ver [`docs/PROGRESS.md`](docs/PROGRESS.md) para el estado detallado, decisiones técnicas y pendientes.
