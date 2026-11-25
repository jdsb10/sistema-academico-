# Diagrama de Secuencia — Registro de asistencia con el sensor (HU-13, CP-03)

Basado en `server/src/modules/sensores/sensores.service.ts` (`registrarLectura`, `aplicarLectura`, `sincronizarPendientes`). El sensor físico no está conectado: el simulador expone `POST /api/sensores/:id/lecturas { numeroDocumento, conectado }`, que una persona autorizada (ADMINISTRADOR o DOCENTE) dispara desde la interfaz haciendo de "lectura del dispositivo".

## Lectura con conexión (camino feliz y los tres rechazos posibles)

```mermaid
sequenceDiagram
    actor D as Docente (simula el sensor)
    participant F as Frontend
    participant API as POST /sensores/:id/lecturas
    participant SVC as sensores.service.ts
    participant DB as PostgreSQL

    D->>F: Ingresa numeroDocumento leido, conectado=true
    F->>API: POST { numeroDocumento, conectado: true }
    API->>SVC: registrarLectura(sensorId, numeroDocumento, true)
    SVC->>DB: SELECT sensor_asistencia WHERE id

    alt Sensor inactivo
        SVC-->>API: 409 "El sensor está inactivo"
    else Sensor activo
        SVC->>DB: INSERT sensor_lectura (estado=PENDIENTE)
        SVC->>DB: UPDATE sensor_asistencia SET online=true
        SVC->>SVC: aplicarLectura(aulaId, numeroDocumento)
        SVC->>DB: SELECT estudiante WHERE numeroDocumento

        alt Estudiante no existe
            SVC-->>API: resultado = ESTUDIANTE_NO_EXISTE
        else
            SVC->>DB: SELECT asistencia WHERE carga.aulaId=aula AND estado=ABIERTA
            alt No hay sesión activa en esa aula
                SVC-->>API: resultado = SIN_SESION_ACTIVA
            else Hay sesión activa
                SVC->>DB: SELECT horario_estudiante WHERE estudianteId AND carga.grupoId = sesion.grupoId
                alt Estudiante no pertenece al grupo
                    SVC-->>API: resultado = NO_PERTENECE_AL_GRUPO
                else Pertenece al grupo
                    SVC->>DB: SELECT detalle_asistencia WHERE asistenciaId + estudianteId
                    alt Ya registrado en esta sesión
                        SVC-->>API: resultado = YA_REGISTRADO
                    else No registrado
                        SVC->>DB: INSERT detalle_asistencia (estado=PRESENTE, origen=SENSOR)
                        SVC-->>API: resultado = REGISTRADO
                    end
                end
            end
        end
        SVC->>DB: UPDATE sensor_lectura SET estado=PROCESADA|RECHAZADA, resultado, mensaje
    end
    API-->>F: { resultado, mensaje }
    F-->>D: Muestra el mensaje (ej. "Asistencia registrada para Javier Brochero")
```

## Lectura sin conexión y sincronización posterior (R-01, alerta A-01)

```mermaid
sequenceDiagram
    actor D as Docente
    participant API as POST /sensores/:id/lecturas
    participant SVC as sensores.service.ts
    participant DB as PostgreSQL

    D->>API: POST { numeroDocumento, conectado: false }
    API->>SVC: registrarLectura(sensorId, numeroDocumento, false)
    SVC->>DB: INSERT sensor_lectura (estado=PENDIENTE)
    SVC->>DB: UPDATE sensor_asistencia SET online=false
    SVC-->>API: { resultado: GUARDADO_LOCAL, mensaje: "Sin conexión: la lectura se guardó localmente" }

    Note over D,API: ... la conexión del aula se restablece ...

    D->>API: POST /sensores/:id/sincronizar
    API->>SVC: sincronizarPendientes(sensorId)
    SVC->>DB: SELECT sensor_lectura WHERE sensorId AND estado=PENDIENTE
    loop por cada lectura pendiente (en orden de llegada)
        SVC->>SVC: aplicarLectura(aulaId, numeroDocumento) (mismas validaciones del diagrama anterior)
        SVC->>DB: UPDATE sensor_lectura SET estado=PROCESADA|RECHAZADA
    end
    SVC->>DB: UPDATE sensor_asistencia SET online=true
    SVC-->>API: [ { resultado, mensaje }, ... ]
```

**Relación con el riesgo R-01 y la alerta A-01** (`docs/scrum/analisis_riesgos.md`): si el sensor pierde la red durante 5 minutos en horario de clase, el docente tiene como respaldo el registro manual (`POST /asistencias/:id/detalles`, ver módulo `asistencias`), que usa las mismas reglas de pertenencia al grupo pero con `origen=MANUAL` en vez de `SENSOR`.
