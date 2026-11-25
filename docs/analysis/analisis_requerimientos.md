# Análisis de Requerimientos — Sistema Académico Universitario

**Proyecto:** Proyecto Final Ingeniería de Software II — "Sistema Académico"
**Versión:** 1.0
**Fuentes documentales:**

| Código | Documento | Contenido principal |
|---|---|---|
| Doc1 | PROYECTO FINAL INGENIERIA DE SOFTWARE II (enunciado, 20 páginas) | Modelo estructural: 18 clases con atributos, métodos y relaciones; instrucción de que toda adición que genere valor agregado será tenida en cuenta |
| Doc2 | parcial_Ingenieria-del-software-Juan Salas (plan ágil, 21 páginas) | Scrum adaptado, 24 historias de usuario (RF-01..RF-24), 7 sprints (0 a 6), 10 riesgos, 7 alertas, 4 niveles de falla, 6 casos de prueba (CP-01..CP-06) y matriz de trazabilidad |

> Regla de redacción de este documento: todo lo que no proviene literalmente de Doc1 o Doc2 se marca como **"Interpretación adoptada"**.

---

## 1. Planteamiento del problema

Las instituciones de educación superior operan información académica distribuida y con alta sensibilidad: estructura organizacional (facultades, programas, aulas), oferta académica (materias, microcurrículos), operación diaria (carga académica, horarios, asistencia, calificaciones) y el seguimiento del avance de cada estudiante en su plan formativo.

Hoy ese ciclo se atiende con hojas de cálculo, registros manuales y herramientas aisladas. Como consecuencia, se presentan los siguientes problemas:

1. **Choques de programación no detectados a tiempo.** Un mismo docente o la misma aula quedan asignados en el mismo día y hora a grupos distintos, y el conflicto se descubre cuando ya afecta la operación.
2. **Asistencia sujeta a error humano.** La lista manual tarda tiempo de clase, no deja evidencia confiable y no permite al estudiante consultar sus faltas oportunamente.
3. **Información académica sin trazabilidad.** Las calificaciones y los cambios de carga se modifican sin registro de quién, cuándo y con qué valor anterior, lo que impide auditar decisiones académicas.
4. **Pérdida de información.** No existen respaldos automáticos ni un procedimiento de restauración probado; una falla de disco o un error humano puede borrar la historia académica completa.
5. **Falta de control de acceso.** Sin autenticación ni permisos por rol, un usuario podría consultar o editar información que no le corresponde, incluyendo datos personales protegidos por la Ley 1581 de 2012 (documento, SISBEN, puntaje ICFES, datos del acudiente).
6. **Microcurrículo desactualizado.** El contenido programático, las competencias y el plan por periodo se manejan en documentos sueltos, sin seguimiento real de lo cubierto en clase.

El sistema académico propuesto ataca estos seis problemas en una sola plataforma con cuatro roles (ADMINISTRADOR, COORDINADOR, DOCENTE, ESTUDIANTE), integrando el registro de asistencia mediante un sensor de asistencia (con simulador de hardware) y manteniendo la trazabilidad completa de las acciones críticas.

---

## 2. Justificación

**Académica.** El proyecto aplica de forma integral los contenidos de Ingeniería de Software II: modelamiento de dominio (18 clases del enunciado), metodología ágil (Scrum), análisis y mitigación de riesgos, plan de pruebas con trazabilidad y arquitectura de software con separación de capas.

**Técnica.** Doc2 declara que el sistema tiene 18 clases que dependen unas de otras y que las funciones críticas (autenticación, horarios, asistencia) no admiten fallas. Un enfoque estructurado desde el análisis —con reglas de negocio explícitas, requerimientos funcionales y no funcionales trazables y decisiones arquitectónicas documentadas— reduce el riesgo R-10 (retraso del cronograma) y R-05 (requerimientos ambiguos o cambiantes del microcurrículo).

**Institucional.** El sistema sustituye procesos manuales, permite al coordinador armar el semestre sin choques, al docente registrar asistencia sin pasar lista, al estudiante consultar su horario y sus faltas, y al administrador respaldar y auditar toda la operación. Doc2 fija metas concretas: responder horarios en menos de 3 segundos, enviar notificaciones en menos de 5 minutos, respaldar diariamente y restaurar en menos de 2 horas.

**Legal.** El tratamiento de datos personales debe cumplir la Ley 1581 de 2012 (citada en Doc2, riesgo R-02), lo que exige mínimo privilegio, cifrado en tránsito, hash de contraseñas y bitácora de auditoría.

**Valor agregado.** Doc1 establece que *"toda adición al proyecto que esté por fuera de este documento pero que genere valor agregado será tenida en cuenta"*; por ello se incorporan sedes, periodos académicos y los módulos transversales que Doc2 exige aunque Doc1 no los modela (ver sección 9.3).

---

## 3. Objetivo general

Diseñar e implementar un sistema académico universitario que integre la gestión de la estructura institucional, la operación académica diaria (carga, horarios, asistencia y calificaciones) y el seguimiento curricular (microcurrículo, competencias y plan), garantizando control de acceso por rol, integridad y trazabilidad de los datos, y disponibilidad de la información académica mediante respaldos y auditoría.

---

## 4. Objetivos específicos

| # | Objetivo específico | Requerimientos asociados |
|---|---|---|
| OE-1 | Modelar las 18 clases del enunciado y su persistencia en PostgreSQL mediante Prisma, normalizando referencias y eliminando atributos redundantes | Todos (Doc1) |
| OE-2 | Implementar autenticación con JWT y bcrypt, bloqueo de cuenta a los 5 intentos fallidos por 15 minutos y guards de autorización por rol en backend y frontend | RF-01 |
| OE-3 | Construir la gestión de la estructura académica (sedes, facultades, programas, aulas, materias, estudiantes, docentes y coordinadores) con unicidad de códigos, validación de campos obligatorios y baja lógica que conserve el historial | RF-02 a RF-08, RF-25 |
| OE-4 | Implementar la gestión de carga académica con detección de choques de docente, aula y grupo en día y hora (permitiendo horas contiguas), validada contra el periodo académico vigente | RF-09, RF-26 |
| OE-5 | Implementar los horarios semanales por rol con consulta en menos de 3 segundos, validación de cupo y sin choques para el estudiante | RF-10, RF-11, RF-12 |
| OE-6 | Implementar el registro de asistencia con simulador de sensor, validación de estudiante inscrito, sesión activa, horario y ausencia de duplicados, más cola offline con sincronización posterior | RF-13, RF-14, RF-15 |
| OE-7 | Digitalizar el microcurrículo, las competencias específicas, el plan microcurrículo por periodo y el seguimiento de avance por unidad, con los cuatro niveles de desempeño | RF-16 a RF-19 |
| OE-8 | Implementar la gestión de calificaciones en escala 0.0 a 5.0, editable solo por el docente del grupo, con trazabilidad de cada cambio y cierre por periodo | RF-20 |
| OE-9 | Implementar los módulos transversales: reportes con exportación a PDF y Excel, bitácora de auditoría inmutable, respaldos automáticos con restauración probada y notificaciones por correo con transportador configurable | RF-21 a RF-24 |
| OE-10 | Cumplir los requerimientos no funcionales de seguridad, rendimiento, disponibilidad, usabilidad, mantenibilidad y cumplimiento legal, verificados con pruebas automatizadas (Vitest, Supertest y Playwright) | RNF-01 en adelante |

---

## 5. Alcance

### 5.1 Dentro del alcance

| # | Componente del alcance | Fuente |
|---|---|---|
| A-01 | Autenticación por correo y contraseña con bloqueo 15 min tras 5 intentos y separación de pantallas por rol | Doc2 RF-01 |
| A-02 | CRUD de facultades, sedes, programas, aulas, materias, estudiantes, docentes y coordinadores | Doc1 + Doc2 RF-02..RF-08, RF-25 |
| A-03 | Asignación materia–docente (MateriaDocente) | Doc1 + Doc2 RF-07 |
| A-04 | Carga académica por periodo con detección de choques de docente, aula y grupo | Doc1 + Doc2 RF-09 |
| A-05 | Horarios semanales de docente y de estudiante, con creación por el estudiante | Doc1 + Doc2 RF-10..RF-12 |
| A-06 | Sesión de asistencia y detalle de asistencia, con simulador de sensor, cola offline y sincronización | Doc1 + Doc2 RF-13..RF-15 |
| A-07 | Microcurrículo y competencias específicas con niveles de desempeño y tres parciales | Doc1 + Doc2 RF-16, RF-17 |
| A-08 | Plan microcurrículo por periodo y docente, con seguimiento de avance por unidad | Doc1 + Doc2 RF-18, RF-19 |
| A-09 | Calificaciones 0.0–5.0 con trazabilidad de cambios | Doc2 RF-20 |
| A-10 | Reportes de asistencia y carga académica exportables a PDF y Excel | Doc2 RF-21 |
| A-11 | Notificaciones por correo (cambios de horario, inasistencias reiteradas, alertas) | Doc2 RF-22 |
| A-12 | Bitácora de auditoría de acciones críticas, de solo lectura | Doc2 RF-23 |
| A-13 | Respaldo diario de la base de datos con copia externa y restauración probada en menos de 2 horas | Doc2 RF-24 |
| A-14 | Periodos académicos como ancla de la carga, los planes y el cierre de notas | Doc1 (atributos) + Doc2 (periodo vigente) |
| A-15 | Dashboard de bienvenida por rol y explorador de reportes | Contexto del sistema (Interpretación adoptada) |

### 5.2 Fuera del alcance

| # | Fuera de alcance | Justificación |
|---|---|---|
| B-01 | Módulo de matrícula financiera, cobros y pagos | No aparece en Doc1 ni en Doc2 |
| B-02 | Portal de padre o acudiente | Doc1 solo registra datos del acudiente como atributos del estudiante; no define gestión ni notificación al acudiente |
| B-03 | Fabricación, calibración o firmware del sensor físico | Doc2 HU-T1 solo exige *probar* el sensor (conexión, lectura y demora); la integración se hace sobre una interfaz adaptable |
| B-04 | Aprobación de prerrequisitos automática con reglas institucionales complejas | Doc2 HU-16 exige "prerrequisitos válidos" como validación de datos, no un motor de aprobación |
| B-05 | Gestión de biblioteca, laboratorios, bienes o talento humano | Sin mención en ningún documento |
| B-06 | Aplicación nativa móvil | Doc2 define interfaces por rol en web; la regla responsive 360/768/1440 cubre el acceso móvil (Interpretación adoptada) |
| B-07 | Sistema de videoconferencias o clases virtuales | Sin mención en ningún documento |
| B-08 | Migración definitiva de datos históricos de hojas de cálculo | Doc2 R-08 contempla una carga inicial con reporte de errores y revisión del Product Owner, no un proyecto de migración permanente |

---

## 6. Supuestos

| # | Supuesto | Tipo |
|---|---|---|
| S-01 | La institución (Product Owner: Vicerrectoría Académica o Registro) entregará datos iniciales de prueba (facultades, programas, docentes, estudiantes y aulas) y validará las reglas académicas en cada Sprint Review | Doc2 |
| S-02 | Se cuenta con un equipo de 5 integrantes y un Product Owner externo, con sprints de 2 semanas y un Sprint 0 de una semana | Doc2 |
| S-03 | El sensor de asistencia estará disponible para la prueba HU-T1 en el Sprint 0 y operará en un aula piloto antes de extenderse | Doc2 |
| S-04 | La máquina de desarrollo **no tiene PostgreSQL instalado ni Docker**, por lo que la base de datos debe ejecutarse sin instalación de software de sistema | Contexto del proyecto |
| S-05 | En el ambiente de desarrollo el correo saldrá por un transportador en consola/log; la configuración SMTP real se activa por variable de entorno | Contexto del proyecto |
| S-06 | La interfaz del sensor se implementará primero como simulador de software con la misma interfaz que consumirá el hardware real | Contexto del proyecto (coherente con Doc2 R-01) |
| S-07 | Los datos sensibles del estudiante (documento, SISBEN, ICFES, acudiente) están permitidos por la normativa de la institución bajo la Ley 1581 de 2012 | Doc2 R-02 |
| S-08 | El idioma de la interfaz es el español (Colombia) y los navegadores objetivo son modernos (Chrome, Edge, Firefox, Safari actuales) | Interpretación adoptada |
| S-09 | No existen integraciones externas (SIS, plataformas de pago, APIs gubernamentales) en esta fase | Interpretación adoptada |
| S-10 | La "carga inicial con reporte de errores" (R-08) se hará sobre el ambiente de pruebas y será aprobada por el Product Owner antes de producción | Doc2 |

---

## 7. Dependencias

| # | Dependencia | Tipo | Impacto si no se cumple | Fuente |
|---|---|---|---|---|
| D-01 | Prueba del sensor HU-T1 en el Sprint 0 (conexión, lectura de identificación, demora) | Externa (hardware) | Si demora más de 2 segundos por persona o no conecta de forma estable, se reorganiza el plan: primero registro manual por el docente y el sensor pasa al Sprint 6 | Doc2 |
| D-02 | Red Wi-Fi disponible en el aula piloto | Externa (infraestructura) | Aumenta el riesgo R-01; obliga a la cola offline con sincronización | Doc2 R-01 |
| D-03 | Base de datos ejecutable sin instalación en la máquina de desarrollo | Técnica | Imposible ejecutar pruebas y desarrollar contra PostgreSQL | Contexto del proyecto |
| D-04 | Definiciones del Product Owner sobre campos del microcurrículo, niveles de desempeño y formato del plan | Externa (cliente) | Riesgo R-05 (requisitos ambiguos o cambiantes) | Doc2 |
| D-05 | Accesos y permisos del ambiente de pruebas, e integración continua operativa desde el Sprint 0 | Técnica | No se cumple la Definición de Hecho; se bloquea el Sprint 0 | Doc2 |
| D-06 | Espacio de almacenamiento y permisos para la copia externa de respaldos | Externa (infraestructura) | Alerta A-03 (respaldo fallido); riesgo R-06 | Doc2 |
| D-07 | Definición de la estructura académica (facultades y programas) antes que horarios, asistencia o microcurrículo | Interna (secuencia de dependencias) | Los sprints posteriores no pueden estimarse ni construirse | Doc2 |
| D-08 | Definición de la carga académica antes que horarios, y de horarios y aulas antes que el sensor | Interna (secuencia de dependencias) | El sensor no sabe qué clase está registrando | Doc2 |
| D-09 | Disponibilidad de usuarios reales de cada rol para las Sprint Reviews y la prueba de usabilidad con 3 usuarios por rol | Externa (cliente) | Riesgo R-09 (baja adopción); se pierde validación temprana | Doc2 |
| D-10 | Cumplimiento de la Ley 1581 de 2012 para el tratamiento de datos personales | Legal | Sanciones y riesgo R-02 crítico | Doc2 R-02 |

---

## 8. Glosario

| Término | Definición |
|---|---|
| **RF-n** | Requerimiento funcional con código RF-01 a RF-24; Doc2 declara que cada historia HU-n corresponde al requerimiento RF-n |
| **HU-n** | Historia de usuario; 24 en total (HU-01 a HU-24) más la historia técnica HU-T1 del Sprint 0 |
| **HU-T1** | Historia técnica de prueba del sensor en el Sprint 0 (spike) antes de comprometer HU-13 |
| **MoSCoW** | Método de priorización: Must (debe), Should (debería), Could (podría) |
| **Sprint** | Iteración de Scrum de 2 semanas; el proyecto define 6 sprints más un Sprint 0 de una semana (7 sprints en total, 0 a 6) |
| **DoR / DoD** | Definición de Listo (criterios de aceptación, estimación y dependencias resueltas) y Definición de Hecho (código revisado, pruebas unitarias y funcionales pasando, sin fallas nivel 1 o 2, desplegado) |
| **CP-xx** | Caso de prueba; el plan define CP-01 a CP-06, uno por función crítica |
| **R-xx** | Riesgo de la matriz de riesgos (10 en total, R-01 a R-10) |
| **A-xx** | Alerta de monitoreo y respuesta (7 en total, A-01 a A-07) |
| **RN-n** | Regla de negocio del sistema |
| **RNF-n** | Requerimiento no funcional |
| **Carga académica** | Asignación de materia, docente, aula, día, hora, grupo y periodo a un programa |
| **Choque** | Dos registros de carga que coinciden en docente o aula en el mismo día y hora; también el solape entre grupos del mismo estudiante |
| **Traslape** | Solape real de intervalos de hora; las horas contiguas (8:00–10:00 y 10:00–12:00) **no** son choque |
| **Baja lógica** | Desactivación de un registro conservando todos sus datos e historial; no se borra físicamente |
| **Microcurrículo** | Contenido programático de una materia: objetivos, competencias, contenidos, niveles de desempeño y parciales |
| **Competencias específicas** | Competencias por unidad temática con resultados de aprendizaje y niveles de desempeño, ligadas a un microcurrículo |
| **Plan microcurrículo** | Tabla complementaria del microcurrículo por docente, periodo y fechas, con detalle de avance |
| **Niveles de desempeño** | Superior, Normal, Bajo y Deficiente; categorías de evaluación presentes en el microcurrículo y en las competencias |
| **Cupo** | Número máximo de estudiantes admitidos en un grupo |
| **Periodo académico** | Ventana temporal vigente en la que se autoriza crear carga, inscribir grupos, planear y calificar |
| **Sensor de asistencia** | Dispositivo electrónico que lee la identificación de quien llega al aula y la registra en la sesión de asistencia |
| **Cola offline / sincronización** | Almacenamiento local del sensor cuando no hay red, con envío posterior sin duplicar registros |
| **Bitácora / auditoría** | Registro inmutable de acciones críticas (altas, bajas, cambios de nota y de carga) con usuario, fecha, hora y valor anterior |
| **Respaldo / restauración** | Copia diaria de la base de datos con copia fuera del servidor y procedimiento de recuperación probado |
| **SISBEN / ICFES** | Sistema de identificación de beneficios sociales y resultado del examen de estado; datos sensibles del estudiante según R-02 |
| **Ley 1581 de 2012** | Estatuto de protección de datos personales en Colombia, citado en Doc2 R-02 |
| **JWT** | JSON Web Token: token firmado que transporta la identidad y el rol del usuario autenticado |
| **bcrypt** | Algoritmo de hash adaptativo usado para almacenar contraseñas (R-02) |
| **Prisma** | ORM de Node.js/TypeScript usado para acceder a PostgreSQL |
| **Transportador de correo** | Componente configurable de envío de correos; en desarrollo usa consola/log |
| **Simulador de sensor** | Implementación de software de la interfaz del sensor, reemplazable por el hardware real |

---

## 9. Análisis conjunto de los dos documentos

### 9.1 Qué aporta cada documento

| Dimensión | Doc1 (enunciado) | Doc2 (plan ágil) |
|---|---|---|
| Tipo de contenido | Modelo estructural del dominio | Plan de proceso, riesgos y verificación |
| Qué responde | **Qué** debe existir: clases, atributos, métodos y relaciones | **Cómo, cuándo y cómo se verifica** que funciona |
| Unidad de análisis | 18 clases (una por página, páginas 3 a 20) | 24 historias de usuario = 24 requerimientos RF |
| Prioridades | No define prioridades ni plazos | MoSCoW (M/S/C) y 135 puntos repartidos en sprints |
| Reglas de negocio | Implícitas en los atributos y métodos | Explícitas en los criterios de aceptación de cada HU |
| Seguridad | No menciona autenticación ni autorización | RF-01 es "la función más crítica"; bloqueo 15 min, bcrypt, HTTPS, mínimo privilegio, Ley 1581 |
| Verificación | No define pruebas | 6 casos de prueba CP-01..CP-06, 4 niveles de falla, DoD |
| Riesgos | No define riesgos | 10 riesgos (R-01..R-10) con P, I, P×I y responsable |
| Operación | No define operación | 7 alertas (A-01..A-07), metas de recuperación (24 h de datos perdidos máximo, vuelta a operar en menos de 2 h) |

### 9.2 Estructura del Doc1: las 18 clases

| # | Clase (Doc1) | Atributos clave | Métodos | Relaciones declaradas |
|---|---|---|---|---|
| 1 | Administrador | IdAdministrador, Nombre, Apellido, FechaNacimiento, Sexo, Celular, Correo, Dirección, Ciudad, Departamento, País | GestionarCoordinador, GestionarDocente, GestionarEstudiante, GestionarFacultad, GestionarPrograma, GestionarAula, GestionarMateria | Coordinador, Docente, Estudiante, Facultad, Programa, Aula |
| 2 | Aula | CodigoAula, NombreAula | — | Asistencia |
| 3 | Asistencia | CodigoAsistencia, DocenteResponsable, Asignatura, CodigoAsignatura, Grupo, Tema, Fecha, Sede, Aula, Hora | — | DetalleAsistencia |
| 4 | DetalleAsistencia | CodigoAsistencia, Identificación, Nombre, Apellido, Correo, Estado | — | — |
| 5 | SensorAsistencia | CodigoSensor, CodigoAula, NombreAula | RegistrarAsistencia | Asistencia |
| 6 | Coordinador | IdCoordinador, Nombre, Apellido, FechaNacimiento, Sexo, Celular, Correo, Dirección, Ciudad, Departamento, País | GestionarCargaAcademica, ConsultarHorarioDocente, ConsultarHorarioEstudiante, GestionarMicrocurriculo, GestionarPlanMicrocurriculo, SeguimientoMicrocurriculo | Programa |
| 7 | Programa | CodigoPrograma, NombrePrograma, NumeroCreditos | — | Estudiante, CargaAcademica, Microcurriculo |
| 8 | Microcurriculo | CodigoMicrocurriculo, Programa, NombreMateria, NumeroCreditos, NivelSuperior/Normal/Bajo/Deficiente, Prerequisitos, DepartamentoOferente, TipoAsignatura, NaturalezaAsignatura, DescripcionAsignatura, ObjetivoGeneral, ObjetivosEspecificos, CompetenciasGenericas, EstrategiasPedagogicasMetodologicas, ReferenciasBibliograficas, PrimerParcial, SegundoParcial, TercerParcial | — | ContenidoCompetenciasEspecificas, PlanMicrocurriculo, DetallePlanMicrocurriculo |
| 9 | ContenidoCompetenciasEspecificas | CodigoCompetencia, CodigoMicrocurriculo, UnidadTematica, CompetenciasEspecificas, ResultadosDeAprendizaje, NivelSuperior/Normal/Bajo/Deficiente | — | — |
| 10 | PlanMicrocurriculo | CodigoPlanMicrocurriculo, CodigoMicrocurriculo, NombreDocente, ApellidoDocente, Correo, Programa, Facultad, CodigoMateria, Materia, Creditos, TipoAsignatura, NaturalezaAsignatura, AñoLectivo, PeriodoAcademico, FechaInicio, TotalHoras, FechaTerminacion | — | DetallePlanMicrocurriculo |
| 11 | CargaAcademica | CodigoPrograma, NombrePrograma, CodigoMateria, NombreMateria, IdDocente, NombreDocente, CodigoAula, Hora, Grupo, Dia, PeriodoCarga | — | — |
| 12 | Facultad | CodigoFacultad, NombreFacultad, NumeroProgramas | — | Estudiante, Programa, Microcurriculo |
| 13 | Estudiante | IdEstudiante, TipoDocumento, FechaExpedicion, Nombre, Apellido, FechaNacimiento, Sexo, Celular, Correo, EstadoCivil, Direccion, Ciudad, Departamento, País, PuntajeICFES, NombreAcudiente, ApellidoAcudiente, CelularAcudiente, SISBEN, CodigoFacultad, NombreFacultad, CodigoPrograma, NombrePrograma | CrearHorarioAcademico, VisualizarHorarioAcademico, VisualizarAsistencias, SeguimientoPlanMicrocurriculo | HorarioEstudiante |
| 14 | HorarioEstudiante | CodigoHorario, IdEstudiante, NombreEstudiante, CodigoMateria, NombreMateria, NombreAula, Hora, Grupo, Dia | — | — |
| 15 | Materia | CodigoMateria, NombreMateria, NumeroCreditos | — | — |
| 16 | Docente | IdDocente, NombreDocente, ApellidoDocente, FechaNacimiento, Sexo, Celular, Correo, Direccion, Ciudad, Departamento, Pais | SeguimientoPlanMicrocurriculo, GestionarCalificaciones, CrearHorarioAcademico, VisualizarHorarioAcademico, VisualizarAsistenciaEstudiantes | HorarioDocente |
| 17 | MateriaDocente | CodigoMateriaDocente, IdDocente, NombreDocente, CodigoMateria, NombreMateria | — | Materia, Docente |
| 18 | HorarioDocente | CodigoHorarioDocente, IdDocente, NombreDocente, NombreAula, Hora, Grupo, Dia, CodigoMateria, NombreMateria | — | Docente |

**Observaciones del análisis estructural (Doc1):**

- El modelo está fuertemente **desnormalizado**: los nombres (NombreDocente, NombreMateria, NombrePrograma, NombreFacultad, NombreAula) se repiten en varias clases. Se sustituyen por referencias a las entidades principales, exponiendo la forma denormalizada solo como vista de lectura (**Interpretación adoptada**).
- **No existen clases de autenticación, calificaciones, notificaciones, auditoría, respaldos ni periodos**, pese a que Doc2 los exige como RF-01, RF-20 y RF-21 a RF-24.
- La clase Administrador declara el método `GestionarMateria` pero su lista de relaciones **omite Materia** (inconsistencia interna del Doc1; se resuelve relacionándola con Materia según RF-06).
- La clase Asistencia contiene el atributo `Sede` **sin que exista una clase Sede** que lo sustente (origen de RF-25).
- Las clases Programa, CargaAcademica y PlanMicrocurriculo contienen campos de periodo (`NumeroCreditos`, `PeriodoCarga`, `PeriodoAcademico`, `AñoLectivo`) pero **no hay una entidad Periodo académico** que los rija (origen de RF-26).

### 9.3 Estructura del Doc2: plan, riesgos y verificación

**Backlog:** 24 historias de usuario, 135 puntos. RF-n corresponde a HU-n.

| Sprint | Semanas | Objetivo | Historias (puntos) | Entregable verificable |
|---|---|---|---|---|
| 0 | 0 | Terreno: repositorio, ambiente, CI, modelo de datos inicial y validación del sensor | HU-T1 | Esquema de las 18 clases, pipeline que compila y corre pruebas, informe de la prueba del sensor |
| 1 | 1–2 | Acceso y estructura académica con estudiantes | HU-01, 02, 03, 04 (26) | Inicio de sesión por rol; CRUD de facultades, programas, estudiantes y docentes |
| 2 | 3–4 | Oferta académica y carga del semestre sin choques | HU-05, 06, 07, 08, 09 (22) | CRUD de coordinadores, materias, aulas y MateriaDocente; carga con validación de choques |
| 3 | 5–6 | Horarios por rol, auditoría y respaldos | HU-10, 11, 12, 23, 24 (24) | Horarios por rol, bitácora de auditoría, respaldo diario con restauración probada |
| 4 | 7–8 | Asistencia automática con sensor y su consulta | HU-13, 14, 15 (21) | Sensor integrado en aula piloto, registro y consulta por docente y estudiante |
| 5 | 9–10 | Microcurrículo y su seguimiento | HU-16, 17, 18, 19 (26) | Microcurrículo, competencias, plan por periodo y seguimiento de avance |
| 6 | 11–12 | Calificaciones, reportes, notificaciones y puesta en producción | HU-20, 21, 22 (16) + pruebas, correcciones y despliegue | Calificaciones, reportes exportables, notificaciones, manual de usuario y sistema desplegado |

**Riesgos:** 10 (P × I de 1 a 25). Críticos: R-01 (sensor, 16) y R-02 (fuga de datos personales, 15). Altos: R-03 (disponibilidad, 12), R-04 (choques de horario en producción, 12), R-05 (microcurrículo ambiguo, 12), R-06 (pérdida de datos, 10), R-07 (calificaciones sin autorización, 10). Medios: R-08 (datos duplicados, 9), R-09 (baja adopción, 9), R-10 (retraso del cronograma, 9).

**Alertas:** 7 (A-01 sensor sin señal, A-02 intentos de acceso sospechosos, A-03 respaldo fallido, A-04 servicio lento o caído, A-05 choque de horario en producción, A-06 cambio de notas anómalo, A-07 espacio de almacenamiento).

**Funciones críticas (Doc2 §9):** críticas → RF-01 (la más crítica), RF-20, RF-13, RF-09 y RF-11, RF-24; no críticas → RF-16 a RF-19, RF-21 y RF-22.

**Casos de prueba:** CP-01 (RF-01), CP-02 (RF-09), CP-03 (RF-13), CP-04 (RF-11), CP-05 (RF-20 con RF-23), CP-06 (RF-24). Cada uno prueba camino normal, error y caso límite.

**Metas operativas fijadas por Doc2:** horario en menos de 3 s (HU-11, A-04), correo en menos de 5 min (HU-22), respaldo diario y pérdida máxima de 24 h de datos, restauración en menos de 2 h (HU-24, §8), bloqueo de 15 min a los 5 fallos (HU-01, A-02).

### 9.4 Cómo se complementan

Los documentos no compiten: Doc1 define el **esqueleto de datos** y Doc2 define el **comportamiento, la prioridad y la verificación**. La síntesis adoptada es:

1. **Doc1 manda en estructura:** las 18 clases son el mínimo obligatorio y sus atributos se conservan (se normalizan las referencias, no se eliminan campos).
2. **Doc2 manda en comportamiento:** cada criterio de aceptación de HU-01..HU-24 se traduce en reglas de negocio (RN) y casos de prueba.
3. **Doc2 manda en secuencia:** el orden de los sprints sigue las dependencias entre clases de Doc1 (sin estructura no hay carga; sin carga no hay horarios; sin horarios y aulas el sensor no sabe qué clase registra).
4. **Doc2 manda en calidad:** DoD, niveles de falla, alertas y matriz de trazabilidad son obligatorios para cerrar historias.
5. **El valor agregado de Doc1** (adiciones que generen valor) habilita las RF-25 y RF-26 y los módulos transversales que Doc2 exige sin modelar en Doc1.

---

## 10. Diferencias entre documentos y decisión adoptada

Se identificaron **10 diferencias** entre el enunciado estructural (Doc1) y el plan ágil (Doc2). Todas se resuelven a favor de la posición de Doc2 cuando hay conflicto, porque Doc2 contiene criterios de aceptación verificables, y a favor de Doc1 cuando Doc2 es silencioso.

| # | Aspecto | Doc1 (enunciado) | Doc2 (plan ágil) | Impacto | Decisión técnica adoptada |
|---|---|---|---|---|---|
| DIF-01 | **Autenticación y roles de acceso** | No define login, contraseñas, sesiones ni permisos; las clases son entidades de negocio pura | Exige RF-01/HU-01 como la función más crítica: ingreso por correo y contraseña, menú por rol, bloqueo 15 min a los 5 intentos, CP-01 y alerta A-02 | Sin este módulo no se puede aplicar ningún control de acceso y falla la mitigación de R-02 | Módulo de autenticación con **JWT + bcrypt**, bloqueo por intentos fallidos (15 min) y **guards por rol en backend** (middleware Express) y en el enrutado del frontend. Los usuarios se derivan de las cuatro clases persona de Doc1 |
| DIF-02 | **Alcance funcional transversal** | Solo modela 18 clases académicas; no hay reportes, notificaciones, bitácora ni respaldos | Agrega HU-21 reportes PDF/Excel, HU-22 notificaciones por correo, HU-23 bitácora inmutable, HU-24 respaldos con restauración < 2 h (RF-21..RF-24) | Cuatro funcionalidades completas sin entidad ni endpoint previsto en Doc1 | Crear los módulos transversales **M16 (reportes), MT2 (auditoría), MT3 (respaldos) y MT4 (notificaciones)** con las entidades `BitacoraAuditoria`, `Notificacion` y registro de respaldos; la bitácora se escribe por servicio + triggers de base de datos |
| DIF-03 | **Periodo académico** | Aparece solo como atributos sueltos: `PeriodoCarga` (CargaAcademica), `PeriodoAcademico` y `AñoLectivo` (PlanMicrocurriculo); no hay entidad que lo rija | Depende del "periodo vigente" en HU-09 (carga por periodo), HU-11 y HU-12 (horarios del periodo vigente), HU-18 (plan por periodo), R-07 (cierre de notas por periodo) y A-06 (cambio de nota fuera del periodo de calificación) | Las reglas de negocio no tendrían dónde anclarse: no se podría validar qué está vigente | Nueva entidad **`PeriodoAcademico`** (RF-26, Interpretación adoptada) con estados `VIGENTE`/`CERRADO`; la carga, la inscripción de grupos, los planes y las notas se validan contra el periodo vigente |
| DIF-04 | **Reglas del sensor y modo offline** | `SensorAsistencia.RegistrarAsistencia` es un método simple; no describe validaciones ni comportamiento sin red | HU-13 y CP-03 exigen: identificar a la persona, guardar en DetalleAsistencia con estado y hora, no duplicar en la misma sesión, guardar localmente sin red y sincronizar después; R-01 es crítico y HU-T1 lo prueba en el Sprint 0 | Cola offline, idempotencia y modo degradado no están previstos | Interfaz **`IAsistenciaSensor`** con implementación `SimuladorSensor` (sustituible por hardware real), tabla de cola offline con sincronización, clave única `(CodigoAsistencia, IdEstudiante)` y ruta de registro manual de respaldo del docente (misma tabla DetalleAsistencia) |
| DIF-05 | **Calificaciones** | Solo existe el método `Docente.GestionarCalificaciones`; no hay clase de notas, ni escala, ni porcentajes, ni trazabilidad | RF-20/HU-20 exige escala 0.0–5.0, edición solo por el docente del grupo, cada cambio con fecha y usuario, CP-05 y R-07 con cierre por periodo | No se podría calcular ni auditar una nota | Nuevas entidades **`Calificacion`** y **`CambioCalificacion`** (o BitacoraAuditoria asociada), validación de rango en el endpoint y en la base de datos, y bloqueo de edición fuera del periodo de calificación (alerta A-06) |
| DIF-06 | **Cupo de grupo** | `CargaAcademica` y `HorarioEstudiante` tienen `Grupo` pero **no** atributo de cupo | HU-11 y CP-04 exigen rechazar la inscripción cuando el grupo no tiene cupo ("G-C se rechaza por falta de cupo") | El estudiante podría inscribirse en grupos sobreocupados | Agregar el atributo **`Cupo`** a la asignación/grupo (Interpretación adoptada sobre Doc1), validado en el momento de inscribir el grupo al horario |
| DIF-07 | **Cardinalidad coordinador–programa** | El Coordinador es "persona encargada de **un** programa" y se relaciona con Programa (relación 1:1 aparente) | HU-05 exige: "un coordinador se asigna a **uno o más** programas; un programa tiene **un coordinador vigente**" | Modelo relacional inconsistente; no se podría reasignar programas ni conservar la vigencia | Tabla intermedia **`CoordinadorPrograma`** con fechas de vigencia, garantizando "un coordinador vigente por programa" |
| DIF-08 | **Desnormalización de datos** | Repite nombres en múltiples clases (NombreDocente en CargaAcademica, HorarioDocente, MateriaDocente y PlanMicrocurriculo; NombrePrograma en CargaAcademica; NombreFacultad en Estudiante) | R-08 exige claves únicas y datos consistentes; R-04 exige restricciones únicas en base de datos además de la validación en código | Riesgo de datos inconsistentes al actualizar un nombre | Normalizar con claves foráneas (`IdDocente`, `CodigoMateria`, `CodigoPrograma`) y entregar la forma denormalizada como **vista de lectura de la API** para no romper las pantallas |
| DIF-09 | **Sedes y calendario** | Usa el atributo `Sede` en Asistencia **sin clase Sede**; no define calendario | No menciona sedes; sí exige periodos (DIF-03) | El campo "Sede" queda sin maestro y sin validación | **RF-25** (Interpretación adoptada, permitida por la cláusula de valor agregado de Doc1): catálogo mínimo de sedes con código y nombre, ligado a aulas y a las sesiones de asistencia |
| DIF-10 | **Códigos de trazabilidad y cronograma** | No usa códigos de requerimiento ni define plazos ni sprints | Declara literalmente: "Cada historia HU-n corresponde al requerimiento RF-n, que es el código que usamos en la trazabilidad", y fija 6 sprints de 2 semanas más un Sprint 0 de una semana | Sin código único no hay matriz de trazabilidad ni planificación | Adoptar **RF-n = HU-n** como identificador maestro en todos los documentos de análisis; el cronograma se expresa como sprints 0 a 6 (7 sprints en total) |

**Observación adicional (inconsistencia interna del Doc1):** la clase Administrador declara el método `GestionarMateria` pero su lista de relaciones omite `Materia`. Se resuelve relacionando Administrador con Materia (RF-06), conforme al método declarado.

**Regla de desempate adoptada:** en caso de conflicto entre documentos manda Doc2 para comportamiento, prioridad y verificación; manda Doc1 para estructura de datos; y las adiciones de valor (Doc1 §2) permiten crear RF nuevas, siempre marcadas como *Interpretación adoptada*.

---

## 11. Productos derivados de este análisis

| Documento | Contenido |
|---|---|
| `requerimientos_funcionales.md` | Tabla RF-01..RF-26 con prioridad MoSCoW, sprint y módulo; detalle por módulo funcional M1..M16 y transversales |
| `requerimientos_no_funcionales.md` | Tabla RNF-01 en adelante con categoría, criterio medible y fuente |
| `reglas_de_negocio.md` | Reglas RN numeradas con enunciado, origen, fuente de verdad y mensaje de error |
| `identificacion_de_actores.md` | Actores principales y secundarios con matriz de permisos por módulo y casos de uso |
| `decisiones_arquitectonicas.md` | ADR-01 a ADR-12 |
| `matriz_trazabilidad.md` | RF → clase del doc1 → módulo → entidad Prisma → endpoint → HU → sprint → CP → riesgo |
| `../PROGRESS.md` | Registro de progreso por fase y estado de las 18 entidades |
