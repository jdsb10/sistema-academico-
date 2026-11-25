# Sprint 5 — Semanas 9-10

## Objetivo

Digitalizar el microcurrículo y su seguimiento.

## Historias (26 puntos)

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| HU-16 | Gestión del microcurrículo de cada materia del programa | S | 8 |
| HU-17 | Registro de competencias específicas y resultados de aprendizaje por unidad temática | S | 5 |
| HU-18 | Gestión del plan de microcurrículo por periodo y docente | S | 8 |
| HU-19 | Seguimiento del plan de microcurrículo (docente marca avance, estudiante consulta) | S | 5 |

## Entregable verificable (según Doc2)

Microcurrículo, competencias, plan por periodo y seguimiento de avance.

## Definición de Listo / Hecho

Ver `docs/scrum/sprint_0.md`.

## Riesgo asociado (Doc2, sección 5)

R-05 (requisitos del microcurrículo ambiguos o cambiantes, P×I=12, Alto) se mitiga poniendo estas historias en el Sprint 5 (da tiempo de validación con la institución) y mostrando prototipos en cada Sprint Review antes de construir.

## Estado real a la fecha (2026-11-24)

- ✅ **Base de datos:** modelos `Microcurriculo`, `MicrocurriculoPrerequisito`, `ContenidoCompetenciaEspecifica`, `PlanMicrocurriculo`, `DetallePlanMicrocurriculo` migrados, con los 21 campos originales del microcurrículo (incluidos los cuatro niveles de desempeño y los tres parciales) y el enum `AvancePlan` (`PENDIENTE`/`EN_CURSO`/`DESARROLLADO`) para el seguimiento de HU-19.
- ⬜ **Código de aplicación de este sprint: pendiente por completo** (ningún endpoint ni pantalla construidos todavía). Este sprint depende de que Programa, Materia y Docente (Sprints 1-2) ya existan, lo cual sí está resuelto en base de datos.
