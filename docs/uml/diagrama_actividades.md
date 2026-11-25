# Diagrama de Actividades — Flujo académico completo de un semestre

Recorre de punta a punta el ciclo que conecta a los 4 roles: desde que el Administrador crea la estructura académica hasta que el Estudiante consulta sus resultados finales. Corresponde a los sprints 1 a 6 del plan ágil (`docs/scrum/`) ejecutados en secuencia sobre un mismo periodo académico.

```mermaid
flowchart TD
    Start([Inicio de semestre]) --> A1[Administrador crea Facultad]
    A1 --> A2[Administrador crea Programa en esa Facultad]
    A2 --> A3[Administrador crea Materia y Aula]
    A3 --> A4[Administrador registra Docentes y Estudiantes]
    A4 --> A5[Administrador asigna Coordinador vigente al Programa]
    A5 --> B1[Coordinador crea Periodo Académico ACTIVO]
    B1 --> B2[Coordinador crea Grupo de la Materia en el Periodo]
    B2 --> B3[Coordinador asigna Carga Académica: Docente + Aula + Día + Hora]

    B3 --> C1{¿Choca con otra<br/>carga del docente,<br/>aula o grupo?}
    C1 -->|Sí| C2[Sistema rechaza y explica el choque específico]
    C2 --> B3
    C1 -->|No| D1[Carga académica creada]

    D1 --> E1[Estudiante busca el Grupo e intenta inscribirse]
    E1 --> E2{¿Hay cupo<br/>disponible?}
    E2 -->|No| E3[Sistema rechaza: sin cupo]
    E3 --> End1([Estudiante busca otro grupo])
    E2 -->|Sí| E4{¿El horario del grupo<br/>choca con otra materia<br/>ya inscrita?}
    E4 -->|Sí| E5[Sistema rechaza: choque de horario]
    E5 --> End1
    E4 -->|No| F1[Estudiante inscrito en HorarioEstudiante]

    F1 --> G1[Docente abre sesión de asistencia para esa carga]
    G1 --> G2{¿Sensor conectado?}
    G2 -->|Sí| G3[Sensor registra asistencia en tiempo real]
    G2 -->|No| G4[Lectura se encola localmente]
    G4 --> G5[Al reconectar: sincronización procesa las lecturas pendientes]
    G3 --> H1[Docente cierra la sesión de asistencia]
    G5 --> H1

    H1 --> I1[Docente configura evaluaciones del Grupo]
    I1 --> I2{¿Los porcentajes<br/>suman 100%?}
    I2 -->|No| I3[Sistema impide cerrar la configuración]
    I3 --> I1
    I2 -->|Sí| J1[Docente registra notas por evaluación]
    J1 --> J2{¿Nota entre<br/>0.0 y 5.0?}
    J2 -->|No| J3[Sistema rechaza la nota]
    J3 --> J1
    J2 -->|Sí| J4[Nota guardada + historial de trazabilidad]

    J4 --> K1[Estudiante consulta su horario, asistencias y calificaciones]
    K1 --> K2[Coordinador/Administrador generan reportes del periodo]
    K2 --> L1[Administrador genera respaldo de la base de datos]
    L1 --> End([Fin del periodo académico])
```

**Nota:** cada rechazo del diagrama (choque de horario, sin cupo, porcentaje distinto de 100%, nota fuera de rango) corresponde a una regla de negocio con prueba automatizada en `server/tests/api.test.ts` y, cuando aplica, a una restricción a nivel de base de datos (ver `docs/analysis/reglas_de_negocio.md`).
