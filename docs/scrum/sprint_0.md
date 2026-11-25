# Sprint 0 — Preparación

**Duración:** 1 semana (antes de la semana 1). **Puntos:** no se contabilizan en los 135 del backlog de producto (es un sprint de preparación técnica).

## Objetivo

Dejar listo el terreno: repositorio, ambiente de pruebas, integración continua, modelo de datos inicial y validación del sensor de asistencia, antes de comprometer cualquier historia de producto.

## Historias

| ID | Historia | Puntos |
|---|---|---|
| HU-T1 | Historia técnica: probar el sensor de asistencia (que conecte, que lea la identificación y cuánto demora) antes de comprometerse con HU-13 | — (spike, sin puntos de producto) |

## Entregable verificable (según Doc2)

- Esquema de base de datos de las 18 clases del enunciado.
- Pipeline que compila y corre pruebas.
- Informe de la prueba del sensor (tiempo de lectura por persona y estabilidad de la conexión).

## Punto de control antes del Sprint 4

Si HU-T1 muestra que el sensor demora más de 2 segundos por persona o no conecta de forma estable, se reorganiza el plan: primero se entrega el registro manual por el docente (en la misma tabla `DetalleAsistencia`) y el sensor pasa al Sprint 6. Esta decisión se toma con el Product Owner antes de empezar el Sprint 4, no a mitad de camino (Doc2, sección 4).

## Definición de Listo (DoR) y Definición de Hecho (DoD)

Igual para todos los sprints (Doc2, sección 1):

- **DoR:** la historia tiene criterios de aceptación, está estimada y sus dependencias están resueltas.
- **DoD:** código revisado por otro integrante, pruebas unitarias pasando, caso de prueba funcional ejecutado, sin errores críticos abiertos y desplegado en el ambiente de pruebas.

## Estado real a la fecha (2026-11-24)

Según `HANDOFF.txt`, lo correspondiente a este sprint está **cubierto a nivel de infraestructura, no como spike documentado de hardware**:

- ✅ Esquema de base de datos de las 18 clases (y sus 40 modelos Prisma derivados) implementado y migrado.
- ✅ Pipeline local que compila (`tsc`) y corre verificación de integridad (`scripts/_check.ts`, EXIT=0).
- ⚠️ **HU-T1 (prueba física del sensor) no se ha ejecutado**: no hay hardware disponible en este entorno de desarrollo. El Módulo 12 del prompt maestro autoriza explícitamente construir primero "un simulador funcional de sensor de asistencia" sin asumir que existe un dispositivo físico. El "informe de la prueba del sensor" de este sprint se sustituye, en esta implementación, por el diseño y las pruebas automatizadas del simulador (`SensorAsistencia` + `SensorLectura`), pendientes de construir en el backend (Fase 4-5 en adelante). Esto se documenta como decisión técnica, no como omisión silenciosa (Regla 8 del prompt maestro).
- ⬜ Integración continua (pipeline de CI) todavía no configurada; el pipeline actual es local (scripts npm).
