# Diagrama de Casos de Uso — Sistema Académico Universitario

Representa los cuatro actores del sistema (roles de autenticación) y sus casos de uso principales, agrupados por rol. Mermaid no soporta de forma estable la notación UML de casos de uso nativa en todos los renderizadores; se usa un `flowchart LR` con los actores como nodos rectangulares y los casos de uso como nodos ovalados (`(( ))` / `([ ])`), agrupados en subgrafos por rol.

```mermaid
flowchart LR
    Admin([Administrador])
    Coord([Coordinador])
    Doc([Docente])
    Est([Estudiante])

    subgraph CU_Admin["Casos de uso — Administrador"]
        direction TB
        ua1(Gestionar facultades)
        ua2(Gestionar programas)
        ua3(Gestionar materias)
        ua4(Gestionar aulas)
        ua5(Gestionar administradores)
        ua6(Gestionar coordinadores)
        ua7(Gestionar docentes)
        ua8(Gestionar estudiantes)
        ua9(Asignar coordinador a programa)
        ua10(Consultar dashboard general)
        ua11(Consultar bitacora de auditoria)
        ua12(Generar y restaurar respaldos)
        ua13(Gestionar sensores de asistencia)
        ua14(Gestionar periodos academicos)
    end

    subgraph CU_Coord["Casos de uso — Coordinador"]
        direction TB
        uc1(Gestionar carga academica de su programa)
        uc2(Consultar horario de docentes y estudiantes)
        uc3(Gestionar microcurriculo)
        uc4(Gestionar plan de microcurriculo)
        uc5(Hacer seguimiento al plan)
        uc6(Gestionar grupos)
        uc7(Generar reportes)
        uc8(Consultar dashboard de su programa)
    end

    subgraph CU_Doc["Casos de uso — Docente"]
        direction TB
        ud1(Consultar su horario)
        ud2(Abrir sesion de asistencia)
        ud3(Registrar asistencia manual)
        ud4(Cerrar sesion de asistencia)
        ud5(Configurar evaluaciones de un grupo)
        ud6(Registrar calificaciones)
        ud7(Registrar avance del plan de microcurriculo)
        ud8(Consultar estudiantes inscritos en sus grupos)
    end

    subgraph CU_Est["Casos de uso — Estudiante"]
        direction TB
        ue1(Inscribir grupo en su horario)
        ue2(Retirar grupo de su horario)
        ue3(Consultar su horario semanal)
        ue4(Consultar sus asistencias)
        ue5(Consultar sus calificaciones)
        ue6(Consultar su perfil academico)
    end

    subgraph CU_Comun["Comun a los 4 roles"]
        direction TB
        uu1(Iniciar sesion)
        uu2(Cerrar sesion)
        uu3(Cambiar / recuperar contrasena)
    end

    Admin --> uu1 & uu2 & uu3
    Coord --> uu1 & uu2 & uu3
    Doc --> uu1 & uu2 & uu3
    Est --> uu1 & uu2 & uu3

    Admin --> ua1 & ua2 & ua3 & ua4 & ua5 & ua6 & ua7 & ua8 & ua9 & ua10 & ua11 & ua12 & ua13 & ua14
    Coord --> uc1 & uc2 & uc3 & uc4 & uc5 & uc6 & uc7 & uc8
    Doc --> ud1 & ud2 & ud3 & ud4 & ud5 & ud6 & ud7 & ud8
    Est --> ue1 & ue2 & ue3 & ue4 & ue5 & ue6

    uc1 -. incluye .-> ua13
    ud2 -. puede usar .-> ua13
    ue1 -. valida .-> uc1
```

## Casos de uso no obvios (aclaración)

- **Asignar coordinador a programa (ua9):** no es una acción del coordinador sobre sí mismo; la ejecuta el Administrador. El sistema cierra automáticamente la asignación vigente anterior (índice único parcial `coordinador_vigente_por_programa`), de modo que un programa siempre tiene a lo sumo un coordinador activo.
- **Gestionar sensores de asistencia (ua13) / ud2 "puede usar":** en la implementación, el registro de asistencia por sensor es un simulador: un usuario con permisos (ADMINISTRADOR o DOCENTE) dispara la lectura desde la interfaz como si fuera el dispositivo físico. No existe un actor "Sensor" separado porque el hardware no está conectado; el caso de uso lo inicia una persona, no un dispositivo.
- **ue1 "valida" uc1:** la inscripción del estudiante en un grupo depende de que exista una carga académica (uc1) asignada a ese grupo; sin carga académica, el grupo no tiene horario y la inscripción se rechaza.
- **Consultar estudiantes inscritos en sus grupos (ud8):** requisito explícito del enunciado para el rol Docente, usado también como paso intermedio del caso de uso "Registrar asistencia manual" (ud3), ya que el formulario de asistencia se arma a partir de la lista de inscritos.
- **Gestionar periodos académicos (ua14):** no estaba en la lista original de endpoints del documento maestro, pero es un prerrequisito de todos los demás módulos académicos (grupos, carga académica, calificaciones, reportes), por lo que se agregó como caso de uso propio del Administrador.
