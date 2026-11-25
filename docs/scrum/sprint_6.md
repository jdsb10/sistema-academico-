# Sprint 6 — Semanas 11-12

## Objetivo

Cerrar con calificaciones, reportes y notificaciones, y poner el sistema en producción.

## Historias (16 puntos) + pruebas de aceptación, correcciones y despliegue

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| HU-20 | Registro y modificación de calificaciones de los grupos del docente | M | 8 |
| HU-21 | Reportes de asistencia y de carga académica | C | 5 |
| HU-22 | Notificaciones por correo de cambios de horario o inasistencias reiteradas | C | 3 |

Este sprint queda deliberadamente en 16 puntos (frente a los ~24 de los demás) para dejar holgura de pruebas, correcciones y despliegue (Doc2, sección 4), mitigando R-10 (retraso del cronograma).

## Entregable verificable (según Doc2)

Calificaciones, reportes exportables, notificaciones, manual de usuario y sistema desplegado.

## Definición de Listo / Hecho

Ver `docs/scrum/sprint_0.md`. Además, en este sprint se ejecutan completos los 6 casos de prueba (CP-01 a CP-06) antes del despliegue (Doc2, sección 10).

## Estado real a la fecha (2026-11-24)

- ✅ **Base de datos:** modelos `ConfiguracionEvaluacion`, `Evaluacion`, `Calificacion`, `HistorialCalificacion` migrados, con `Decimal(3,2)` para notas (rango 0.0-5.0 de CP-05) y tabla de historial para la trazabilidad de cambios (HU-20 + alerta A-06).
- ✅ Dependencias `pdfkit` y `exceljs` ya instaladas en `server/package.json` para la exportación de reportes (HU-21).
- ✅ Capa de correo planeada con transportador "console" por defecto (sin credenciales SMTP necesarias para demostrar el flujo) y configuración SMTP opcional por `.env` (HU-22).
- ⬜ **Ningún código de aplicación de este sprint existe todavía:** ni endpoints de calificaciones/reportes/notificaciones, ni frontend, ni manual de usuario, ni despliegue. Es, junto con los Sprints 4-5, el trabajo pendiente de mayor volumen del proyecto a la fecha de este documento.
