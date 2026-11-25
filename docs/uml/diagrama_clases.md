# Diagrama de Clases — Sistema Académico Universitario

Refleja las 18 clases del documento original **tal como quedaron implementadas** en `server/prisma/schema.prisma` (40 modelos en total; aquí se muestran las 18 originales más las entidades de apoyo indispensables para entenderlas: `Usuario`, `Grupo`, `PeriodoAcademico`, `Sede`). Los atributos se simplificaron a los más representativos; el esquema real tiene además columnas de auditoría (`creadoEn`, `actualizadoEn`) en casi todas las tablas, omitidas aquí por brevedad.

```mermaid
classDiagram
    class Usuario {
        +String id
        +String email
        +String passwordHash
        +Rol rol
        +EstadoUsuario estado
        +Int intentosFallidos
        +DateTime bloqueadoHasta
    }

    class Administrador {
        +String id
        +String numeroDocumento
        +String nombres
        +String apellidos
        +String nivel
        +EstadoBasico estado
    }

    class Coordinador {
        +String id
        +String numeroDocumento
        +String nombres
        +String apellidos
        +EstadoBasico estado
    }

    class Docente {
        +String id
        +String numeroDocumento
        +String nombres
        +String apellidos
        +EstadoBasico estado
    }

    class Estudiante {
        +String id
        +String numeroDocumento
        +String nombres
        +String apellidos
        +Int puntajeIcfes
        +String nombreAcudiente
        +String sisben
        +EstadoBasico estado
    }

    class Facultad {
        +String id
        +String codigo
        +String nombre
        +Int numeroProgramas
        +EstadoBasico estado
    }

    class Programa {
        +String id
        +String codigo
        +String nombre
        +Int numeroCreditos
    }

    class Materia {
        +String id
        +String codigo
        +String nombre
        +Int numeroCreditos
        +String departamentoOfertante
    }

    class MateriaDocente {
        +String materiaId
        +String docenteId
    }

    class Aula {
        +String id
        +String codigo
        +String nombre
        +Int capacidad
        +EstadoAula estado
    }

    class Grupo {
        +String id
        +String codigo
        +Int cupo
        +EstadoBasico estado
    }

    class CargaAcademica {
        +String id
        +DiaSemana dia
        +DateTime horaInicio
        +DateTime horaFin
        +EstadoCarga estado
    }

    class HorarioEstudiante {
        +String id
        +String codigo
        +DateTime fechaInscripcion
        +EstadoInscripcion estado
    }

    class HorarioDocente {
        <<vista SQL>>
        +String codigoHorarioDocente
        +String nombreDocente
        +String nombreAula
        +String dia
        +DateTime horaInicio
        +DateTime horaFin
    }

    class Asistencia {
        +String id
        +String codigo
        +String tema
        +Date fecha
        +DateTime hora
        +EstadoSesion estado
    }

    class DetalleAsistencia {
        +String id
        +EstadoAsistencia estado
        +OrigenAsistencia origen
        +DateTime horaRegistro
        +String justificacion
    }

    class SensorAsistencia {
        +String id
        +String codigo
        +EstadoBasico estado
        +Boolean online
    }

    class Microcurriculo {
        +String id
        +String codigo
        +Int numeroCreditos
        +String nivelSuperior
        +String nivelNormal
        +String nivelBajo
        +String nivelDeficiente
        +String objetivoGeneral
        +String primerParcial
        +String segundoParcial
        +String tercerParcial
    }

    class ContenidoCompetenciaEspecifica {
        +String id
        +String codigo
        +String unidadTematica
        +String competenciasEspecificas
        +String resultadosAprendizaje
        +Int orden
    }

    class PlanMicrocurriculo {
        +String id
        +String codigo
        +Int anioLectivo
        +Date fechaInicio
        +Date fechaTerminacion
        +Int totalHoras
        +EstadoPlan estado
    }

    class PeriodoAcademico {
        +String id
        +String codigo
        +Int anio
        +EstadoPeriodo estado
    }

    class Sede {
        +String id
        +String codigo
        +String nombre
    }

    %% ---- Identidad y autenticacion ----
    Usuario "1" --> "0..1" Administrador : es
    Usuario "1" --> "0..1" Coordinador : es
    Usuario "1" --> "0..1" Docente : es
    Usuario "1" --> "0..1" Estudiante : es

    %% ---- Estructura academica ----
    Facultad "1" --> "*" Programa : tiene
    Programa "1" --> "*" Estudiante : matricula
    Programa "*" --> "*" Materia : MateriaPrograma
    Programa "0..1" --> "*" Coordinador : CoordinadorPrograma (vigente)
    Sede "1" --> "*" Aula : ubica

    %% ---- Oferta academica y grupos ----
    Materia "*" --> "*" Docente : MateriaDocente
    Materia "1" --> "*" Grupo : se dicta en
    Programa "1" --> "*" Grupo : ofrece
    PeriodoAcademico "1" --> "*" Grupo : agrupa

    %% ---- Carga academica y horarios ----
    Grupo "1" --> "*" CargaAcademica : tiene
    Docente "1" --> "*" CargaAcademica : dicta
    Aula "1" --> "*" CargaAcademica : aloja
    CargaAcademica "1" --> "*" HorarioEstudiante : inscribe
    Estudiante "1" --> "*" HorarioEstudiante : tiene
    CargaAcademica ..> HorarioDocente : origen de la vista

    %% ---- Asistencia ----
    CargaAcademica "1" --> "*" Asistencia : sesiones
    Asistencia "1" --> "*" DetalleAsistencia : registra
    Estudiante "1" --> "*" DetalleAsistencia : asiste
    Aula "1" --> "0..1" SensorAsistencia : tiene

    %% ---- Microcurriculo ----
    Materia "1" --> "*" Microcurriculo : define
    Programa "1" --> "*" Microcurriculo : adscribe
    Microcurriculo "1" --> "*" ContenidoCompetenciaEspecifica : contiene
    Microcurriculo "1" --> "*" PlanMicrocurriculo : planea
    Docente "1" --> "*" PlanMicrocurriculo : ejecuta
    PeriodoAcademico "1" --> "*" PlanMicrocurriculo : vigencia
```

## Diferencias respecto al documento original (y por qué)

> Cada nota corresponde a una decisión documentada en `docs/analysis/decisiones_arquitectonicas.md` (ADR) y `docs/analysis/reglas_de_negocio.md`.

- **`HorarioDocente` no es una tabla, es una vista SQL** (`CREATE VIEW horario_docente`) calculada sobre `CargaAcademica` + `Docente` + `Grupo` + `Materia` + `Aula`. El documento original la describe como una clase con los mismos atributos que `CargaAcademica` (`IdDocente`, `NombreDocente`, `NombreAula`, `Hora`, `Grupo`, `Dia`, `CodigoMateria`, `NombreMateria`); duplicarla como tabla habría exigido mantenerla sincronizada manualmente ante cada cambio de horario, con riesgo de inconsistencia. Al ser una vista, siempre refleja el estado actual de `cargas_academicas` sin trabajo adicional.
- **`Estudiante` no duplica `NombreFacultad` ni `NombrePrograma`** como lista el documento original: se relaciona con `Programa`, y la facultad se deriva transitivamente (`Estudiante → Programa → Facultad`). Lo mismo aplica a `PlanMicrocurriculo`, que no guarda `NombreDocente`/`Correo`/`Facultad` por separado: se derivan de sus relaciones con `Docente` y `Programa`.
- **`CargaAcademica` no se identifica por `CodigoPrograma`/`CodigoMateria` como en el documento**, sino por una relación a `Grupo` (que a su vez referencia `Materia` y `Programa`). Esto permite que una misma combinación materia-programa-periodo tenga varios grupos paralelos, algo que el documento original no distinguía explícitamente pero que es una necesidad real de cualquier institución.
- **`MateriaDocente` y la relación materia-programa (`MateriaPrograma`) son tablas de unión explícitas** porque el documento ya anticipaba que "una materia puede ser impartida por diferentes docentes" y "puede estar asociada a distintos programas" (relaciones muchos-a-muchos).
- Entidades que el documento original no contemplaba pero que resultaron indispensables para implementar lo que sí pedía: `Usuario` (autenticación separada de los datos de la persona, para no mezclar credenciales con datos académicos), `Grupo` (unidad real de inscripción del estudiante), `PeriodoAcademico` y `Sede`.
