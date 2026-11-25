# Manual de Usuario — Administrador

El rol Administrador tiene acceso completo al sistema: gestiona la estructura académica, las personas de los cuatro roles, la seguridad y la continuidad de la operación (auditoría, respaldos).

## Iniciar sesión

1. Abra la aplicación y en la pantalla de inicio ingrese su correo institucional y contraseña.
2. Si olvida su contraseña, contacte a otro administrador para que se la restablezca (no hay enlace de "olvidé mi contraseña" en la pantalla de inicio de sesión en esta versión; el flujo existe en la API pero no tiene formulario propio — ver `docs/PROGRESS.md`).
3. Después de **5 intentos fallidos seguidos**, la cuenta se bloquea automáticamente por 15 minutos.

## Panel principal (Dashboard)

Al entrar, usted ve de inmediato:

- Totales de estudiantes, docentes, coordinadores, facultades, programas, materias y aulas.
- Un gráfico de barras con la distribución de estudiantes por facultad.
- Un gráfico circular con los registros de asistencia de los últimos 30 días.
- Un gráfico horizontal con la distribución de estudiantes por programa.

Todos los datos son reales y se actualizan en vivo; no son cifras de ejemplo.

## Gestionar facultades

1. En el menú lateral, seleccione **Facultades**.
2. Use el buscador para filtrar por código o nombre.
3. **Nueva facultad**: haga clic en el botón, complete código y nombre (la descripción es opcional) y confirme.
4. Para editar, haga clic en el icono de lápiz de la fila correspondiente.
5. Para eliminar, haga clic en el icono de papelera. **Solo se puede eliminar una facultad que no tenga programas asociados**; si los tiene, el sistema se lo indicará.

## Gestionar programas, materias y aulas

El flujo es el mismo que para facultades (listar, buscar, crear, editar, eliminar), en los menús **Programas**, **Materias** y **Aulas** respectivamente. Particularidades:

- Al crear un **programa**, debe asociarlo a una facultad existente.
- Un programa **no se puede eliminar** si tiene estudiantes matriculados.
- Una **materia** se puede asociar a varios programas y asignar a varios docentes.
- Un **aula** no se puede eliminar si ya tiene horarios asignados.

## Gestionar personas (Administradores, Coordinadores, Docentes, Estudiantes)

1. En el menú correspondiente (por ejemplo **Docentes**), haga clic en **Nuevo docente** (o administrador/coordinador/estudiante).
2. Complete los datos solicitados. El correo institucional será el usuario de acceso de esa persona.
3. Al confirmar, el sistema genera una **contraseña temporal** que se muestra una sola vez en pantalla — cópiela y entréguesela a la persona de forma segura; deberá cambiarla en su primer ingreso.
4. Para dar de baja a alguien sin perder su historial académico, use el botón **Desactivar** en la fila correspondiente (nunca se borra físicamente a una persona con historial). Para reactivarla, use **Reactivar**.
5. Al crear un **coordinador**, puede asignarle opcionalmente un programa a cargo desde el mismo formulario.

## Carga académica, grupos y sensores

Como administrador, usted también puede crear **grupos** y asignar **carga académica** (docente + aula + día + hora) de la misma forma que un coordinador — ver el [manual del Coordinador](manual_usuario_coordinador.md) para el detalle del flujo y las reglas de choque de horario.

En **Sensores**, puede registrar un sensor de asistencia para un aula y usar **Simular lectura** para probar el flujo de registro automático de asistencia (ver el [manual del Docente](manual_usuario_docente.md) para el detalle del simulador).

## Auditoría

En el menú **Auditoría** encontrará el registro completo de acciones críticas del sistema (creaciones, cambios, eliminaciones, inicios de sesión, cambios de nota, cambios de carga académica, respaldos, restauraciones, exportaciones), con filtros por entidad y por tipo de acción. **Esta bitácora es inmutable**: ni usted ni nadie puede editarla o borrarla desde la aplicación — está protegida por una regla en la propia base de datos.

## Respaldos

En el menú **Respaldos**:

1. **Generar respaldo** crea una copia lógica (archivo JSON) de los datos académicos y de seguridad principales.
2. La lista muestra cada respaldo con su tamaño, duración y estado.
3. **Restaurar** reemplaza los datos actuales por los del respaldo seleccionado. **Es una operación destructiva**: úsela solo cuando sea realmente necesario recuperar información perdida, idealmente probándola primero en un ambiente de pruebas.

## Reportes

Igual que el coordinador, usted puede generar reportes de asistencia, carga académica y desempeño académico, exportables a PDF y Excel, desde el menú **Reportes**.
