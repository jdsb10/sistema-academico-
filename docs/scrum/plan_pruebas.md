# Plan de Pruebas — Casos CP-01 a CP-06

Fuente: `parcial_Ingenieria-del-software-Juan Salas.pdf`, sección 10. Seis casos de prueba, uno por cada función crítica identificada en la sección 9 de Doc2 (autenticación, carga académica, horario del estudiante, asistencia con sensor, calificaciones, respaldo). En cada uno se prueba el camino normal, un error y un caso límite. El resto de historias se prueban dentro del sprint donde se construyen (ver `docs/scrum/sprint_1.md` a `sprint_6.md`).

---

## CP-01 · Inicio de sesión por rol y bloqueo de cuenta
- **Requerimiento:** RF-01 (HU-01) · **Prioridad:** Alta
- **Precondiciones:** existe un docente activo con correo y contraseña válidos; existe un estudiante activo; el sistema está en el ambiente de pruebas.
- **Datos de entrada:** correo y contraseña correctos del docente; luego la contraseña incorrecta "clave-mala" cinco veces; luego de nuevo la contraseña correcta.
- **Pasos:**
  1. Abrir la pantalla de inicio de sesión.
  2. Ingresar las credenciales correctas del docente.
  3. Revisar el menú y cerrar sesión.
  4. Ingresar el correo del docente con la contraseña incorrecta cinco veces seguidas.
  5. Ingresar la contraseña correcta.
  6. Con la sesión del estudiante, escribir en el navegador la dirección de una pantalla del administrador.
- **Resultado esperado:** Paso 2 — entra al menú de docente, sin opciones de administración. Paso 4 — al quinto intento fallido la cuenta se bloquea 15 min y se muestra el mensaje de bloqueo. Paso 5 — se rechaza mientras dure el bloqueo. Paso 6 — acceso denegado y no se muestra ningún dato.

## CP-02 · Carga académica sin choques de docente ni de aula
- **Requerimiento:** RF-09 (HU-09) · **Prioridad:** Alta
- **Precondiciones:** coordinador autenticado de su programa; el docente D1 tiene la materia M1 en el aula A101 los lunes de 8:00 a 10:00 en el periodo vigente; existen la materia M2, el docente D2 y el aula A205.
- **Datos de entrada:** Caso A: D1, M2, A205, lunes 8:00 a 10:00. Caso B: D2, M2, A101, lunes 8:00 a 10:00. Caso C: D1, M2, A205, lunes 10:00 a 12:00.
- **Pasos:**
  1. Abrir Gestionar carga académica.
  2. Registrar el caso A y guardar.
  3. Registrar el caso B y guardar.
  4. Registrar el caso C y guardar.
  5. Consultar el horario de D1.
- **Resultado esperado:** Caso A rechazado (docente ya tiene clase en ese horario). Caso B rechazado (aula ocupada); en ambos no se guarda nada. Caso C aceptado (horas contiguas, sin traslape) y el horario de D1 muestra M1 y M2 sin choques.
- **Estado de verificación en esta implementación:** ✅ verificado a nivel de base de datos (`server/scripts/_check.ts`, EXIT=0) mediante las restricciones `EXCLUDE` (ver ADR-10). Pendiente verificar el mensaje de error legible al nivel de servicio/API.

## CP-03 · Registro de asistencia con el sensor
- **Requerimiento:** RF-13 (HU-13) · **Prioridad:** Alta
- **Precondiciones:** sesión de asistencia creada para un grupo en el aula A101 con el docente responsable; sensor de A101 encendido, conectado y asociado a esa aula; estudiantes E1 y E2 inscritos en el grupo; un tercer estudiante E3 no inscrito.
- **Datos de entrada:** identificación de E1 leída por el sensor dos veces; identificación de E3; identificación de E2 con la red desconectada.
- **Pasos:**
  1. Pasar la identificación de E1.
  2. Pasarla otra vez.
  3. Pasar la identificación de E3.
  4. Desconectar la red del sensor y pasar la identificación de E2.
  5. Reconectar la red.
  6. El docente abre la asistencia de la sesión.
- **Resultado esperado:** Paso 1 — E1 queda en `DetalleAsistencia` con identificación, nombre, correo, estado Presente y la hora. Paso 2 — no se duplica y el sensor indica que ya está registrado. Paso 3 — se rechaza y E3 no aparece como presente. Paso 4 — el sensor guarda localmente. Paso 5 — E2 se sincroniza sin duplicarse. Paso 6 — la lista muestra a E1 y E2 una sola vez cada uno.
- **Estado de verificación en esta implementación:** ⬜ pendiente (requiere el simulador de sensor y los servicios de asistencia, aún no construidos a la fecha de este documento).

## CP-04 · El estudiante arma su horario sin choques ni sobrecupo
- **Requerimiento:** RF-11 (HU-11) · **Prioridad:** Media
- **Precondiciones:** estudiante autenticado y activo en un programa; existen el grupo G-A (lunes 8:00 a 10:00, con cupo), el grupo G-B (lunes 9:00 a 11:00, con cupo) y el grupo G-C (martes 8:00 a 10:00, sin cupo).
- **Datos de entrada:** selección de G-A, luego G-B, luego G-C.
- **Pasos:**
  1. Abrir Crear horario académico.
  2. Inscribir G-A.
  3. Inscribir G-B.
  4. Inscribir G-C.
  5. Abrir Visualizar horario académico y medir el tiempo de carga.
- **Resultado esperado:** G-A queda inscrito. G-B se rechaza por choque con G-A. G-C se rechaza por falta de cupo. El horario muestra solo G-A y carga en menos de 3 s.
- **Estado de verificación en esta implementación:** ⬜ pendiente (requiere el servicio de inscripción de horario del estudiante, aún no construido).

## CP-05 · Calificaciones: rango válido, grupo propio y trazabilidad
- **Requerimiento:** RF-20 (HU-20), con RF-23 (bitácora) · **Prioridad:** Alta
- **Precondiciones:** docente D1 autenticado con el grupo G1 y el estudiante E1 en él; existe un grupo G2 de otro docente D2.
- **Datos de entrada:** notas 4.2, 5.5 y -1 para E1; luego cambio de 4.2 a 4.5; luego intento de editar una nota de G2.
- **Pasos:**
  1. Abrir Gestionar calificaciones de G1.
  2. Guardar 4.2 para E1.
  3. Intentar guardar 5.5.
  4. Intentar guardar -1.
  5. Cambiar 4.2 a 4.5.
  6. Buscar un estudiante de G2 y tratar de editar su nota.
  7. Consultar la bitácora como administrador.
- **Resultado esperado:** 4.2 se guarda. 5.5 y -1 se rechazan con el mensaje del rango válido 0.0 a 5.0. El cambio a 4.5 se guarda. El paso 6 es denegado. La bitácora muestra el cambio de 4.2 a 4.5 con usuario, fecha, hora y valor anterior.
- **Estado de verificación en esta implementación:** ✅ la bitácora inmutable (paso 7, HU-23) está verificada a nivel de base de datos. ⬜ el resto (pasos 1-6) requiere el módulo de calificaciones, aún no construido.

## CP-06 · Restauración de un respaldo
- **Requerimiento:** RF-24 (HU-24) · **Prioridad:** Alta
- **Precondiciones:** ambiente de pruebas con datos de ejemplo, con estudiantes inscritos en horarios; el administrador tiene permiso para respaldar y restaurar.
- **Datos de entrada:** tres estudiantes nuevos; el respaldo generado; la tabla de estudiantes borrada a propósito en el ambiente de pruebas.
- **Pasos:**
  1. Registrar tres estudiantes nuevos.
  2. Ejecutar el respaldo y confirmar que se generó la copia externa.
  3. Borrar la tabla de estudiantes del ambiente de pruebas.
  4. Restaurar desde el respaldo y medir el tiempo.
  5. Abrir un horario de estudiante y los tres estudiantes nuevos.
- **Resultado esperado:** la copia externa existe. Tras restaurar, los tres estudiantes aparecen con todos sus datos. Los horarios siguen apuntando a sus estudiantes (sin registros huérfanos). La restauración toma menos de 2 h.
- **Estado de verificación en esta implementación:** ⬜ pendiente (el script de respaldo lógico en TypeScript, ver ADR-09, aún no se ha construido).

---

## Matriz de trazabilidad corta (Doc2, sección 10)

| Requerimiento | Clase del enunciado | Sprint | Caso de prueba | Riesgo que reduce |
|---|---|---|---|---|
| RF-01 | Autenticación por rol (Administrador, Coordinador, Docente, Estudiante) | 1 | CP-01 | R-02 |
| RF-09 | Carga académica (`CargaAcademica`, `Aula`, `MateriaDocente`) | 2 | CP-02 | R-04 |
| RF-11 | Horario del estudiante (`HorarioEstudiante`, `Estudiante`) | 3 | CP-04 | R-04 |
| RF-13 | Asistencia con sensor (`SensorAsistencia`, `Asistencia`, `DetalleAsistencia`) | 4 | CP-03 | R-01 |
| RF-20 | Calificaciones (`Docente`) | 6 | CP-05 | R-07 |
| RF-24 | Respaldo y restauración (todas las clases, base de datos) | 3 | CP-06 | R-06 |

Los casos se corren al cerrar cada historia (Definición de Hecho) y otra vez completos antes del despliegue del Sprint 6.
