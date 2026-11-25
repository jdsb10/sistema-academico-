# Sprint 3 — Semanas 5-6

## Objetivo

Que docentes, estudiantes y coordinadores vean y armen horarios, y que el sistema tenga auditoría y respaldos.

## Historias (24 puntos)

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| HU-10 | Consultar horario de un docente y de un estudiante (coordinador) | M | 5 |
| HU-11 | Crear y visualizar horario académico (estudiante) | M | 8 |
| HU-12 | Visualizar horario académico (docente) | M | 3 |
| HU-23 | Bitácora de auditoría de acciones críticas | S | 3 |
| HU-24 | Respaldos automáticos y restauración probada | M | 5 |

## Entregable verificable (según Doc2)

Horarios por rol, bitácora de auditoría, respaldo diario con restauración probada.

## Definición de Listo / Hecho

Ver `docs/scrum/sprint_0.md`.

## Estado real a la fecha (2026-11-24)

- ✅ **Base de datos:** modelo `HorarioEstudiante` migrado; vista SQL `horario_docente` creada y verificada (`scripts/_check.ts` confirma 2 filas resueltas con docente, aula y día — handoff, punto 6).
- ✅ **HU-23 (bitácora inmutable):** trigger `bloquear_auditoria()` creado y verificado — un intento de `UPDATE`/`DELETE` sobre `auditorias` es rechazado por PostgreSQL.
- ⬜ **HU-24 (respaldos):** el modelo `Respaldo` existe en el esquema, pero el script de volcado lógico en TypeScript (ADR-09) y el procedimiento de restauración probada todavía no se han implementado; el paquete `embedded-postgres` no trae `pg_dump`, por lo que esta historia requiere código propio (ver `docs/analysis/decisiones_arquitectonicas.md`, ADR-09).
- ⬜ **Código de aplicación de HU-10, HU-11, HU-12 (endpoints y UI de horarios): pendiente.** CP-04 (estudiante arma su horario sin choques ni sobrecupo) todavía no tiene implementación de servicio que probar.
