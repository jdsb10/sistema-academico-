import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // Un solo proceso: todas las pruebas comparten la misma base de datos
    // embebida (no hay forma economica de paralelizar sin un Postgres por
    // worker), asi que se ejecutan en secuencia dentro de un unico archivo.
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 20000,
  },
});
