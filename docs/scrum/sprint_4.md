# Sprint 4 — Semanas 7-8

## Objetivo

Registrar la asistencia automáticamente con el sensor y consultarla.

## Historias (21 puntos)

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| HU-13 | El sensor registra la asistencia de los estudiantes que llegan al aula | M | 13 |
| HU-14 | El docente consulta la asistencia de sus grupos por fecha y tema | M | 5 |
| HU-15 | El estudiante visualiza sus asistencias por materia | S | 3 |

## Entregable verificable (según Doc2)

Sensor integrado en un aula piloto, registro de asistencia y consulta por docente y estudiante.

## Punto de control antes de este sprint

Si HU-T1 (Sprint 0) mostró que el sensor demora más de 2 segundos por persona o no conecta de forma estable, se reorganiza: primero se entrega el registro manual por el docente (en la misma tabla `DetalleAsistencia`) y el sensor pasa al Sprint 6. Esta decisión se toma con el Product Owner antes de empezar este sprint, no a mitad de camino (Doc2, sección 4).

**Decisión adoptada en esta implementación:** como no hay hardware físico disponible en el entorno de desarrollo (ver `docs/scrum/sprint_0.md`), se sigue la instrucción explícita del Módulo 12 del prompt maestro: construir primero un **simulador funcional de sensor de asistencia** (API que simula la lectura de una identificación, valida estudiante+grupo+sesión activa+sin duplicados, y permite conectar hardware real después). Esto no es la contingencia de "registro manual primero" de Doc2 — es la vía recomendada por el propio cliente del proyecto para no bloquear la historia por falta de hardware. El registro manual de respaldo (alerta A-01) se implementa igualmente como función independiente del docente.

## Definición de Listo / Hecho

Ver `docs/scrum/sprint_0.md`.

## Estado real a la fecha (2026-11-24)

- ✅ **Base de datos:** modelos `Asistencia`, `DetalleAsistencia`, `SensorAsistencia`, `SensorLectura` migrados, con cola de lecturas (`SensorLectura.estado`: `PENDIENTE`/`PROCESADA`/`RECHAZADA`) que soporta el caso "si no hay red, guarda localmente y sincroniza después" de HU-13.
- ⬜ **Simulador de sensor, servicios de asistencia y UI: pendientes.** CP-03 (registro de asistencia con el sensor, incluida la detección de duplicados y la sincronización sin red) todavía no tiene implementación que verificar.
