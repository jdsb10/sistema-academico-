// Punto de entrada de producción: aplica migraciones y arranca la API.
// Acepta los nombres de variable que usan los hosting más comunes para la URL
// de Postgres, para que un despliegue nuevo no muera antes de arrancar.
import { spawnSync } from 'node:child_process';

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

const ejecutar = (comando, args, usarShell = false) => {
  const resultado = spawnSync(comando, args, {
    stdio: 'inherit',
    // En Windows, `npx.cmd` necesita shell; node.exe NO debe pasar por shell
    // porque su ruta puede tener espacios ("C:\Program Files\nodejs\node.exe").
    shell: usarShell,
    env: process.env,
  });

  if (resultado.error) {
    console.error(`[start:prod] No se pudo ejecutar ${comando}:`, resultado.error);
    process.exit(1);
  }
  if (resultado.status !== 0) {
    process.exit(resultado.status ?? 1);
  }
};

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

ejecutar(npx, ['prisma', 'migrate', 'deploy', '--schema', 'server/prisma/schema.prisma'], process.platform === 'win32');
ejecutar(process.execPath, ['server/dist/main.js']);
