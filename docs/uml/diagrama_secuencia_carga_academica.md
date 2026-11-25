# Diagrama de Secuencia — Carga académica sin choques (HU-09, CP-02)

Basado en `server/src/modules/cargas-academicas/cargas-academicas.service.ts` (`crear`, `verificarChoques`) y en la migración `20261124173500_integridad_y_reglas_de_negocio` (restricciones `EXCLUDE` con `btree_gist` sobre `cargas_academicas`). La validación ocurre en **dos capas independientes**: un pre-chequeo en la API (da un mensaje específico) y una restricción `EXCLUDE` en PostgreSQL (garantía final ante condiciones de carrera, por si dos peticiones llegan al mismo tiempo).

```mermaid
sequenceDiagram
    actor C as Coordinador / Administrador
    participant F as Frontend
    participant API as POST /api/cargas-academicas
    participant SVC as cargas-academicas.service.ts
    participant DB as PostgreSQL (cargas_academicas)

    C->>F: Completa grupo, docente, aula, periodo, día, hora inicio/fin
    F->>API: POST { grupoId, docenteId, aulaId, periodoId, dia, horaInicio, horaFin }
    API->>SVC: crear(input, creadoPor)
    SVC->>DB: SELECT periodo_academico WHERE id

    alt Periodo CERRADO
        SVC-->>API: 409 "No se pueden crear asignaciones en un periodo cerrado"
    else Periodo ACTIVO o PLANEADO
        SVC->>SVC: verificarChoques(periodo, dia, horaInicio, horaFin, docenteId, aulaId, grupoId)
        par Chequeo de docente
            SVC->>DB: SELECT carga WHERE docenteId AND dia AND traslape de horas
        and Chequeo de aula
            SVC->>DB: SELECT carga WHERE aulaId AND dia AND traslape de horas
        and Chequeo de grupo
            SVC->>DB: SELECT carga WHERE grupoId AND dia AND traslape de horas
        end

        alt Choque de docente encontrado
            SVC-->>API: 409 "El docente ya tiene una clase asignada en ese día y horario"
        else Choque de aula encontrado
            SVC-->>API: 409 "El aula ya está ocupada en ese día y horario"
        else Choque de grupo encontrado
            SVC-->>API: 409 "El grupo ya tiene otra materia asignada en ese día y horario"
        else Sin choques detectados por el pre-chequeo
            SVC->>DB: INSERT carga_academica (...)
            Note right of DB: La restricción EXCLUDE (btree_gist) de PostgreSQL<br/>re-valida el traslape por docente, aula y grupo<br/>como garantía final ante condiciones de carrera.
            alt La restricción EXCLUDE rechaza el INSERT (23P01)
                DB-->>SVC: error 23P01 exclusion_violation
                SVC-->>API: 409 HORARIO_EN_CONFLICTO (capturado por errorHandler)
            else INSERT exitoso
                DB-->>SVC: carga creada
                SVC-->>API: 201 { carga académica }
                API-->>F: Carga creada
                F-->>C: Confirmación visual
            end
        end
    end
```

## Caso concreto verificado (CP-02, probado en `tests/api.test.ts` y `scripts/_check.ts`)

| Caso | Entrada | Resultado |
|---|---|---|
| Base | Docente D1, Grupo G1, Aula A101, lunes 08:00–10:00 | ✅ Creada |
| A | Mismo docente D1, otro grupo/aula, lunes 08:00–10:00 | ❌ 409 — choque de docente |
| B | Otro docente D2, misma aula A101, lunes 08:00–10:00 | ❌ 409 — choque de aula |
| C | Docente D1, aula A101, lunes **10:00–12:00** (horas contiguas) | ✅ Creada — no hay traslape (`horaFin` del existente = `horaInicio` del nuevo) |

La condición de traslape usada tanto en el pre-chequeo como en la restricción `EXCLUDE` es la intersección estricta de intervalos (`horaInicio < otro.horaFin AND horaFin > otro.horaInicio`), por lo que dos clases contiguas (una termina exactamente cuando la otra empieza) **no** se consideran un choque — este es el comportamiento que exige el Caso C.
