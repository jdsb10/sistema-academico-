import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './shared/prisma.js';

async function main() {
  await prisma.$connect();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[server] Sistema Academico API escuchando en http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.log(`[server] Documentacion Swagger en http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] Señal ${signal} recibida, cerrando...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[server] Error fatal al iniciar:', error);
  process.exit(1);
});
