// Punto de entrada de producción:
// 1) resuelve DATABASE_URL, 2) aplica migraciones, 3) siembra datos demo SOLO
// cuando la base está vacía, 4) arranca la API (que también sirve el frontend).
import { spawnSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const candidatas = ['DATABASE_URL', 'DATABASE_PUBLIC_URL', 'POSTGRES_URL', 'PGURL'];

if (!process.env.DATABASE_URL?.trim()) {
  const encontrada = candidatas
    .slice(1)
    .find((nombre) => process.env[nombre]?.trim());

  if (encontrada) {
    process.env.DATABASE_URL = process.env[encontrada].trim();
    console.log(`[start:prod] DATABASE_URL tomada de ${encontrada}`);
  } else {
    console.error(
      '[start:prod] Falta DATABASE_URL. En Railway: agrega el servicio PostgreSQL ' +
        'al mismo proyecto y vincula la variable DATABASE_URL (o copia el valor ' +
        'de DATABASE_PUBLIC_URL del servicio de base de datos).'
    );
    process.exit(1);
  }
}

const esWindows = process.platform === 'win32';
const npx = esWindows ? 'npx.cmd' : 'npx';
const npm = esWindows ? 'npm.cmd' : 'npm';

/** @returns {number} código de salida del proceso hijo */
function ejecutar(comando, args, { shell = false } = {}) {
  const resultado = spawnSync(comando, args, {
    stdio: 'inherit',
    // En Windows los .cmd necesitan shell; node.exe NO (su ruta tiene espacios).
    shell,
    env: process.env,
  });

  if (resultado.error) {
    console.error(`[start:prod] No se pudo ejecutar ${comando}:`, resultado.error);
    return 1;
  }
  return resultado.status ?? 1;
}

function ejecutarOExit(comando, args, opciones) {
  const codigo = ejecutar(comando, args, opciones);
  if (codigo !== 0) process.exit(codigo);
}

// Las migraciones son idempotentes: corren en cada deploy.
ejecutarOExit(
  npx,
  ['prisma', 'migrate', 'deploy', '--schema', 'server/prisma/schema.prisma'],
  { shell: esWindows }
);

// Seed automático únicamente la primera vez. El seed de este proyecto borra
// datos existentes, así que NUNCA se ejecuta si ya hay información cargada.
if (process.env.SEED_ON_START !== 'false') {
  const prisma = new PrismaClient();
  try {
    const [usuarios, sedes] = await Promise.all([
      prisma.usuario.count(),
      prisma.sede.count(),
    ]);

    if (usuarios === 0 && sedes === 0) {
      console.log('[start:prod] Base de datos vacía: cargando datos de demostración...');
      const codigo = ejecutar(npm, ['run', 'db:seed', '--workspace', 'server'], {
        shell: esWindows,
      });
      if (codigo === 0) {
        console.log('[start:prod] Datos de demostración cargados.');
      } else {
        console.error('[start:prod] El seed falló; la API arrancará con la BD vacía.');
      }
    } else {
      console.log(
        `[start:prod] Datos existentes (${usuarios} usuarios): se omite el seed.`
      );
    }
  } catch (error) {
    console.error('[start:prod] No se pudo comprobar el estado de la BD:', error);
  } finally {
    await prisma.$disconnect();
  }
} else {
  console.log('[start:prod] SEED_ON_START=false: se omite el seed.');
}

ejecutarOExit(process.execPath, ['server/dist/main.js']);
