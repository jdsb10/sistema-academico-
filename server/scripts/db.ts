/**
 * Ciclo de vida de PostgreSQL local (binarios embebidos).
 *
 * Motivo: la maquina de desarrollo no tiene PostgreSQL ni Docker instalados y
 * no dispone de privilegios de administrador para instalar servicios. Este
 * script levanta un PostgreSQL real (binarios oficiales 17.x) con pg_ctl,
 * que desacopla el servidor del proceso que lo invoca, de modo que el
 * proyecto sea ejecutable con un unico comando y sin instalacion.
 *
 * Paquete embebido: @embedded-postgres/windows-x64 (solo trae initdb,
 * pg_ctl y postgres; no incluye psql ni pg_dump, por lo que el respaldo
 * logico de HU-24 se implementa en TypeScript sobre Prisma).
 *
 * Uso:
 *   npm run db:up      -> arranca el servidor y crea la base si no existe
 *   npm run db:down    -> detiene el servidor
 *   npm run db:reset   -> detiene, borra los datos y vuelve a arrancar
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, '.pgdata');
const logFile = path.join(rootDir, 'postgres.log');
const binDir = path.resolve(
  rootDir,
  '..',
  'node_modules',
  '@embedded-postgres',
  'windows-x64',
  'native',
  'bin',
);

const PORT = Number(process.env.PG_PORT ?? 5432);
const USER = process.env.PG_USER ?? 'postgres';
const PASSWORD = process.env.PG_PASSWORD ?? 'postgres';
const DB_NAME = process.env.PG_DATABASE ?? 'sistema_academico';

function bin(name: string): string {
  const file = path.join(binDir, `${name}.exe`);
  if (!fs.existsSync(file)) {
    throw new Error(`Binario no encontrado: ${file}`);
  }
  return file;
}

function run(command: string, args: string[], ignoreError = false): string {
  try {
    return execFileSync(command, args, {
      cwd: rootDir,
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PGDATA: dataDir },
    });
  } catch (error) {
    if (ignoreError) return '';
    const err = error as { stderr?: string; message?: string };
    throw new Error(`${err.stderr || err.message}`);
  }
}

function serverIsRunning(): boolean {
  const status = run(bin('pg_ctl'), ['-D', dataDir, 'status'], true);
  return status.includes('pg_ctl: server is running');
}

async function createDatabaseIfMissing(): Promise<void> {
  // No hay psql en el paquete embebido: se usa Prisma Client contra la base
  // por defecto "postgres" para crear la base de datos del proyecto.
  const adminUrl = `postgresql://${USER}:${PASSWORD}@localhost:${PORT}/postgres?schema=public`;
  const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } });
  try {
    const rows = await admin.$queryRawUnsafe<Array<{ datname: string }>>(
      `SELECT datname FROM pg_database WHERE datname = '${DB_NAME}'`,
    );
    if (rows.length === 0) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`[db] Base de datos "${DB_NAME}" creada.`);
    } else {
      console.log(`[db] La base de datos "${DB_NAME}" ya existe.`);
    }
  } finally {
    await admin.$disconnect();
  }
}

async function up(): Promise<void> {
  if (!fs.existsSync(path.join(dataDir, 'PG_VERSION'))) {
    console.log(`[db] Inicializando cluster en ${dataDir}...`);
    const pwFile = path.join(rootDir, '.pgpass.tmp');
    fs.writeFileSync(pwFile, PASSWORD, { encoding: 'utf8' });
    run(bin('initdb'), [
      '-D',
      dataDir,
      '-U',
      USER,
      '-A',
      'scram-sha-256',
      '--pwfile',
      pwFile,
      '-E',
      'UTF8',
    ]);
    fs.rmSync(pwFile, { force: true });
    console.log('[db] Cluster inicializado.');
  }

  if (!serverIsRunning()) {
    console.log(`[db] Arrancando PostgreSQL en el puerto ${PORT}...`);
    run(bin('pg_ctl'), [
      '-D',
      dataDir,
      '-l',
      logFile,
      '-o',
      `-p ${PORT} -c listen_addresses=127.0.0.1 -c log_min_messages=warning`,
      '-w',
      'start',
    ]);
    console.log('[db] Servidor iniciado.');
  } else {
    console.log('[db] El servidor ya estaba en ejecucion.');
  }

  await createDatabaseIfMissing();
  console.log('[db] PostgreSQL listo.');
}

async function down(): Promise<void> {
  if (!fs.existsSync(dataDir)) {
    console.log('[db] No hay cluster que detener.');
    return;
  }
  console.log('[db] Deteniendo PostgreSQL...');
  run(bin('pg_ctl'), ['-D', dataDir, '-m', 'fast', '-w', 'stop'], true);
  console.log('[db] Detenido.');
}

async function reset(): Promise<void> {
  await down();
  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true });
    console.log('[db] Datos eliminados.');
  }
  await up();
}

const command = process.argv[2] ?? 'up';
const runners: Record<string, () => Promise<void>> = { up, down, reset };
const runner = runners[command];

if (!runner) {
  console.error(`[db] Comando desconocido: ${command}. Use up | down | reset`);
  process.exit(1);
}

runner()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error('[db] Error:', error.message);
    process.exit(1);
  });
