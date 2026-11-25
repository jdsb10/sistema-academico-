# Manual de Usuario — Docente

El rol Docente consulta su horario, registra la asistencia de sus clases (manualmente o con el simulador de sensor) y gestiona las calificaciones de sus grupos.

## Panel principal (Dashboard)

Al iniciar sesión, usted ve:

- Cuántas materias tiene asignadas y en cuántos grupos dicta clase.
- El número total de estudiantes bajo su cargo.
- Sus próximas clases (materia, aula, día).
- Un resumen de la asistencia registrada en sus clases en los últimos 14 días.

## Mi horario

En el menú **Mi horario** verá una cuadrícula semanal (lunes a sábado, de 7:00 a 19:00) con todas sus clases asignadas: materia, grupo y aula. Este horario proviene directamente de la carga académica que el Coordinador o el Administrador le asignaron — usted no puede editarlo desde aquí.

## Registrar asistencia

### Abrir una sesión de clase

1. Vaya a **Asistencias** → **Nueva sesión**.
2. Seleccione la clase (grupo + día + hora) para la que va a registrar asistencia, escriba el tema que va a dictar, y confirme la fecha y la hora.
3. La sesión queda **Abierta**.

### Registrar quién asistió

1. Haga clic sobre la fila de la sesión en la tabla.
2. Verá la lista de estudiantes **inscritos en ese grupo** (solo ellos pueden registrarse).
3. Para cada estudiante, seleccione su estado: **Presente**, **Ausente**, **Tardanza** o **Justificado**. El cambio se guarda de inmediato.
4. Cuando termine, haga clic en **Cerrar sesión**. Una vez cerrada, los estados ya no se pueden modificar.

### Usar el simulador de sensor de asistencia

Si su institución tiene un sensor configurado en el aula (lo configura un Administrador en el menú **Sensores**), el registro puede hacerse automáticamente:

1. En **Sensores**, localice el sensor del aula donde está dictando clase y haga clic en **Simular lectura**.
2. Ingrese el número de documento del estudiante que "pasó" por el sensor.
3. Si el sensor está conectado a la red, el sistema valida automáticamente: que el estudiante exista, que pertenezca al grupo de la sesión abierta en esa aula, que haya una sesión activa, y que no esté ya registrado — y si todo es correcto, lo marca **Presente**.
4. Si marca "sin conexión", la lectura se guarda localmente y usted puede sincronizarla más tarde con el botón **Sincronizar pendientes** (así funcionaría el sensor real si la red del aula falla).
5. Si el estudiante no pertenece al grupo, ya está registrado, o no hay sesión abierta en esa aula, el sistema se lo indica con un mensaje específico — no registra nada incorrecto.

> El registro manual (primera sección) y el simulador de sensor son complementarios: si el sensor falla, usted siempre puede registrar la asistencia a mano como respaldo.

## Calificaciones

### Configurar las evaluaciones de un grupo

1. Vaya a **Calificaciones** y seleccione el grupo.
2. Haga clic en **Configurar evaluación** para ese grupo y periodo.
3. Agregue cada evaluación con su nombre y porcentaje (por ejemplo "Parcial 1" — 30 %, "Parcial 2" — 30 %, "Proyecto final" — 40 %).
4. **Los porcentajes deben sumar exactamente 100 %** antes de poder cerrar la configuración; el sistema no lo permitirá si suman menos o más.

### Registrar notas

1. Con la evaluación configurada, aparece una tabla con sus estudiantes inscritos en filas y cada evaluación en columnas.
2. Escriba la nota directamente en la celda correspondiente (rango válido: **0.0 a 5.0**); el sistema rechaza cualquier valor fuera de ese rango.
3. Cada cambio de nota queda registrado con la fecha, la hora y quién lo hizo (usted) — este historial no se puede alterar ni esconder.
4. Solo usted, como docente asignado a ese grupo, puede calificarlo; otro docente no podrá editar esas notas aunque conozca el enlace.
5. Una vez que todas las evaluaciones tengan nota, el sistema calcula la nota final ponderada automáticamente.

## Microcurrículo y plan de seguimiento

En **Microcurrículos**, si tiene un plan de seguimiento asignado sobre un microcurrículo de su materia, puede registrar el avance por cada unidad temática (pendiente, en curso, desarrollado) y el porcentaje de avance, para que el coordinador y el propio estudiante puedan ver qué tanto del contenido ya se cubrió en clase.
