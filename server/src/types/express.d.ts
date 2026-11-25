import type { Rol } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        rol: Rol;
        /** id del registro Administrador/Coordinador/Docente/Estudiante asociado al usuario */
        perfilId: string | null;
      };
    }
  }
}

export {};
