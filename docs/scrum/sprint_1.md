# Sprint 1 — Semanas 1-2

## Objetivo

Que cualquier persona autorizada entre al sistema y que existan la estructura académica y los estudiantes.

## Historias (26 puntos)

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| HU-01 | Inicio de sesión por rol | M | 8 |
| HU-02 | Gestión de facultades y programas | M | 5 |
| HU-03 | Registro y actualización de estudiantes | M | 8 |
| HU-04 | Gestión de docentes | M | 5 |

## Entregable verificable (según Doc2)

Inicio de sesión por rol; CRUD de facultades, programas, estudiantes y docentes.

## Definición de Listo / Hecho

Ver `docs/scrum/sprint_0.md` (misma DoR/DoD para todos los sprints).

## Estado real a la fecha (2026-11-24)

- ✅ **Base de datos:** modelos `Usuario`, `Facultad`, `Programa`, `Estudiante`, `Docente`, `RefreshToken`, `IntentoAcceso`, `Auditoria` migrados y verificados.
- ⬜ **Código de aplicación (backend/frontend) de este sprint: pendiente.** A la fecha del handoff no existía todavía `src/main.ts` ni ningún controlador/servicio; es el primer bloque de código de aplicación a construir, siguiendo el orden recomendado del handoff (punto 9: vertical slice de un módulo como patrón, luego paralelizar).
- Las reglas CP-01 (inicio de sesión y bloqueo de cuenta) están diseñadas a nivel de esquema (campos `intentos_fallidos`, `bloqueado_hasta` en `Usuario`) pero la lógica de autenticación (JWT, bcrypt, guards por rol) todavía no se ha escrito.
