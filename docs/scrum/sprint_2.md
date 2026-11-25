# Sprint 2 — Semanas 3-4

## Objetivo

Quedar con toda la oferta académica y la carga del semestre armada sin choques.

## Historias (22 puntos)

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| HU-05 | Gestión de coordinadores y asignación a programa | M | 5 |
| HU-06 | Gestión de materias | M | 3 |
| HU-07 | Asignación de materias a docentes (MateriaDocente) | M | 3 |
| HU-08 | Gestión de aulas | M | 3 |
| HU-09 | Carga académica de un programa, sin choques de docente ni de aula | M | 8 |

## Entregable verificable (según Doc2)

CRUD de coordinadores, materias, aulas y MateriaDocente; carga académica con validación de choques.

## Definición de Listo / Hecho

Ver `docs/scrum/sprint_0.md`.

## Estado real a la fecha (2026-11-24)

- ✅ **Base de datos:** modelos `Coordinador`, `CoordinadorPrograma`, `Materia`, `MateriaDocente`, `MateriaPrograma`, `Aula`, `Sede`, `Grupo`, `CargaAcademica`, `PeriodoAcademico` migrados.
- ✅ **Regla de negocio más crítica de este sprint ya verificada a nivel de base de datos:** las tres restricciones `EXCLUDE` (`cargas_sin_traslape_docente`, `cargas_sin_traslape_aula`, `cargas_sin_traslape_grupo`) rechazan los choques de CP-02 (casos A y B) y aceptan correctamente el caso límite de horas contiguas sin traslape (CP-02 Caso C), confirmado por `scripts/_check.ts` (EXIT=0).
- ✅ Índice único parcial `coordinador_vigente_por_programa` (garantiza un único coordinador vigente por programa, HU-05) migrado.
- ⬜ **Código de aplicación (endpoints, servicios, UI) de este sprint: pendiente.** La validación de choques existe en la base de datos (defensa final) pero aún falta la capa de servicio que traduzca el error de PostgreSQL en un mensaje claro para el coordinador, como exige el criterio de aceptación de HU-09.
