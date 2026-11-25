# Seguimiento de Sprints — Estado real

**Fecha de este corte:** 2026-11-24. **Fuente del estado real:** `HANDOFF.txt` (entregado por la sesión anterior de desarrollo) y verificación directa del repositorio en esta fecha.

> Este documento se actualiza al cierre de cada sprint (o, mientras no haya Sprint Review formal con el Product Owner real, al final de cada bloque de trabajo relevante). No anticipa trabajo no verificado.

| Sprint | Semanas (plan) | Historias planeadas | Puntos planeados | Estado real a 2026-11-24 | Notas |
|---|---|---|---|---|---|
| 0 | Previa | HU-T1 | — | 🟡 Parcial | Esquema de BD y pipeline local listos; spike físico del sensor sustituido por decisión documentada de construir un simulador (no hay hardware disponible). Ver `sprint_0.md`. |
| 1 | 1-2 | HU-01, 02, 03, 04 | 26 | 🟡 Parcial | Modelos de base de datos de este sprint migrados y verificados (`Usuario`, `Facultad`, `Programa`, `Estudiante`, `Docente`). Ningún endpoint ni pantalla de aplicación construidos todavía. |
| 2 | 3-4 | HU-05, 06, 07, 08, 09 | 22 | 🟡 Parcial | Modelos migrados; la regla de choques de horario (núcleo de HU-09) ya está verificada en base de datos (`EXCLUDE` + `scripts/_check.ts`, EXIT=0). Falta la capa de aplicación (servicios, API, UI). |
| 3 | 5-6 | HU-10, 11, 12, 23, 24 | 24 | 🟡 Parcial | `HorarioEstudiante` migrado; vista `horario_docente` creada y verificada. HU-23 (bitácora inmutable) verificada con trigger de base de datos. HU-24 (respaldo lógico) sin implementar todavía. Sin endpoints ni UI de horarios. |
| 4 | 7-8 | HU-13, 14, 15 | 21 | ⬜ No iniciado (código de aplicación) | Modelos de asistencia y sensor migrados (incluida la cola de sincronización `SensorLectura`). Simulador de sensor y servicios de asistencia aún no construidos. |
| 5 | 9-10 | HU-16, 17, 18, 19 | 26 | ⬜ No iniciado (código de aplicación) | Modelos de microcurrículo, competencias y plan microcurricular migrados con los 21 campos originales. Ningún endpoint ni pantalla construidos. |
| 6 | 11-12 | HU-20, 21, 22 | 16 | ⬜ No iniciado (código de aplicación) | Modelos de calificaciones migrados (incluido historial de cambios). Dependencias de exportación (`pdfkit`, `exceljs`) instaladas. Transportador de correo "console" planeado. Sin manual de usuario ni despliegue. |

## Resumen cuantitativo

- **Puntos de producto totales:** 135.
- **Puntos cuya base de datos ya está migrada y verificada:** 135 de 135 (100% — las 40 tablas/vistas que sustentan las 24 HU existen y pasan la verificación de integridad `_check.ts`).
- **Puntos cuyo código de aplicación (backend + frontend) ya está construido y probado:** 0 de 135 a la fecha de este corte — este es exactamente el punto donde retoma esta sesión de desarrollo, según el propio `HANDOFF.txt` ("Aún no se ha escrito código de aplicación: solo infraestructura").

## Leyenda

- 🟡 Parcial: la base de datos del sprint está lista, pero falta parte o todo el código de aplicación.
- ⬜ No iniciado: ni base de datos de aplicación ni código construidos para ese alcance (más allá de los modelos ya cubiertos por el esquema global).
- ✅ Completo: base de datos y código de aplicación verificados end-to-end (ningún sprint llega a este estado todavía).

## Próxima actualización

Este archivo debe actualizarse inmediatamente después de completar cada vertical slice o módulo de backend/frontend (ver `docs/PROGRESS.md` para el detalle módulo por módulo), no solo al cierre formal de un sprint de 2 semanas, dado que esta reconstrucción del proyecto no sigue un calendario de sprints en tiempo real sino sesiones de desarrollo continuas.
