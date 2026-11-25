# Manual de Instalación

Guía detallada para dejar el Sistema Académico Universitario funcionando en un computador Windows (también válido para macOS/Linux, salvo donde se indique) **sin necesidad de experiencia previa configurando servidores**.

## 1. Requisitos previos

| Requisito | Por qué | Cómo verificarlo |
|---|---|---|
| Node.js versión 20 o superior | Ejecuta tanto el backend como el frontend | Abra una terminal y escriba `node -v` |
| npm (viene con Node.js) | Instala las dependencias y ejecuta los scripts del proyecto | `npm -v` |
| ~500 MB de espacio libre en disco | Dependencias de npm (`node_modules`) + el motor de PostgreSQL embebido que se descarga la primera vez | — |

**No necesita instalar PostgreSQL, Docker, ni tener permisos de administrador.** El proyecto descarga y gestiona su propio motor de base de datos la primera vez que se ejecuta `npm run db:up`.

## 2. Obtener el proyecto

Si recibió el proyecto como una carpeta (por ejemplo `sistema-academico/`), simplemente ábrala en una terminal:

```powershell
cd "ruta\donde\esta\la\carpeta\sistema-academico"
```

## 3. Instalar las dependencias

Desde la **raíz** del proyecto (la carpeta que contiene `package.json`, `server/` y `client/`):

```powershell
npm install
```

Esto instala, en un solo paso, las dependencias del backend (`server/`) y del frontend (`client/`), porque el proyecto usa *npm workspaces*. Puede tardar varios minutos la primera vez.

> Si npm pregunta por "scripts de instalación" de algún paquete (`@prisma/client`, `prisma`, `esbuild`, `@embedded-postgres/windows-x64`), apruébelos: son necesarios para generar el cliente de base de datos y para descargar el motor de PostgreSQL. El paquete `@scarf/scarf` puede denegarse sin problema (solo recolecta estadísticas de uso).

## 4. Levantar la base de datos

```powershell
npm run db:up
```

La primera vez, este comando:

1. Descarga los binarios oficiales de PostgreSQL 17 (a través del paquete `embedded-postgres`).
2. Inicializa un "cluster" de base de datos en `server/.pgdata/` (una carpeta local, no un servicio de Windows).
3. Arranca el servidor en `127.0.0.1:5432`.
4. Crea la base de datos `sistema_academico` si no existe.

Las siguientes veces, el mismo comando simplemente arranca el servidor ya existente. Para detenerlo: `npm run db:down`.

## 5. Aplicar las migraciones

```powershell
npm run db:migrate
```

Esto crea las ~40 tablas, la vista `horario_docente`, los triggers de integridad (bitácora inmutable, choques de horario) y genera el cliente de Prisma que usa el backend para hablar con la base de datos.

## 6. Cargar los datos de demostración

```powershell
npm run db:seed
```

Crea una institución de ejemplo completa: 2 facultades, 3 programas, 5 materias, 3 aulas, 1 administrador, 2 coordinadores, 3 docentes, 6 estudiantes, horarios, un sensor con historial, un microcurrículo con seguimiento y calificaciones parciales. Las credenciales se imprimen al final del comando y también están en el [`README.md`](../../README.md) raíz.

> **Atención:** `npm run db:seed` borra cualquier dato existente antes de cargar los datos de ejemplo. No lo ejecute si ya tiene información real cargada que quiera conservar.

## 7. Iniciar la aplicación

```powershell
npm run dev
```

Este comando levanta **backend y frontend al mismo tiempo** (usando `concurrently`), con salida diferenciada por color en la misma terminal:

- Backend: http://localhost:4000 (documentación interactiva de la API en http://localhost:4000/api-docs)
- Frontend: http://localhost:5173 ← **esta es la URL que debe abrir en el navegador**

Para detener ambos: `Ctrl + C` en la terminal donde corre `npm run dev`.

## 8. Verificar que todo funciona

1. Abra http://localhost:5173 en su navegador.
2. Inicie sesión con `admin@universidad.edu.co` / `DemoAcademico2026!`.
3. Debería ver el panel administrativo con cifras reales (6 estudiantes, 3 docentes, etc.) y gráficas.
4. Pruebe entrar con una de las cuentas de estudiante (`est.brochero@universidad.edu.co`) y revisar "Mi horario".

Si ambos pasos funcionan, la instalación fue exitosa.

## 9. Solución de problemas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| `EADDRINUSE` al iniciar el backend (puerto 4000 ocupado) | Ya hay otro proceso usando el puerto 4000 (quizás una ejecución anterior que no se cerró) | Cierre la terminal anterior, o localice y detenga el proceso: en Windows, `netstat -ano \| findstr :4000` para ver el PID y `taskkill /PID <pid> /F` para detenerlo |
| `pg_ctl: otro servidor puede estar en ejecución` | Ya hay un PostgreSQL embebido corriendo de una sesión anterior | Es informativo, no un error: `npm run db:up` sigue funcionando si el servidor ya estaba arriba. Si quiere reiniciarlo limpio: `npm run db:down` y luego `npm run db:up` |
| La página web no carga estilos o se ve "rota" | El frontend no terminó de compilar o el navegador tiene caché vieja | Espere unos segundos tras `npm run dev` y recargue con Ctrl+F5 |
| `npm install` falla por scripts bloqueados | Algún paquete necesita ejecutar un script de instalación y npm lo bloqueó por seguridad | Vuelva a ejecutar `npm install` y apruebe los scripts cuando se le pregunte (ver sección 3) |
| Quiero empezar de cero (borrar todos los datos) | — | `npm run db:reset` (detiene, borra `server/.pgdata/` y vuelve a arrancar); luego repita los pasos 5 y 6 |
| Las pruebas automatizadas (`npm test`) borraron mis datos de demostración | `npm test` limpia la base de datos para usar sus propios datos de prueba | Ejecute `npm run db:seed` de nuevo después de correr las pruebas |

## 10. Compilar para producción (opcional)

```powershell
npm run build   # compila backend (TypeScript → JS) y frontend (React → estáticos)
npm start       # ejecuta el backend compilado (sirve la API en el puerto configurado)
```

El frontend compilado queda en `client/dist/`; en un despliegue real se serviría desde un servidor web o un reverse proxy (ver `docs/uml/diagrama_despliegue.md` para la alternativa de producción sugerida).
