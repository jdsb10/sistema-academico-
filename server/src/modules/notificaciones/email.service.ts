import { prisma } from '../../shared/prisma.js';
import { env } from '../../config/env.js';

interface EnviarCorreoInput {
  claveUnica: string;
  usuarioId: string;
  asunto: string;
  cuerpo: string;
}

/**
 * Capa de correo (HU-22). Transportador "console" por defecto: imprime el
 * mensaje en el log del servidor para poder demostrar el flujo completo sin
 * credenciales SMTP. claveUnica evita reenviar el mismo correo dos veces
 * (deduplicacion exigida por HU-22: "no envia duplicados").
 */
export async function enviarCorreo(input: EnviarCorreoInput): Promise<void> {
  const existente = await prisma.notificacionCorreo.findUnique({ where: { claveUnica: input.claveUnica } });
  if (existente && existente.estado === 'ENVIADA') {
    return;
  }

  const registro =
    existente ??
    (await prisma.notificacionCorreo.create({
      data: {
        claveUnica: input.claveUnica,
        usuarioId: input.usuarioId,
        asunto: input.asunto,
        cuerpo: input.cuerpo,
      },
    }));

  try {
    if (env.EMAIL_TRANSPORT === 'console') {
      console.log('--- [email:console] -------------------------------------');
      console.log(`Para usuario: ${input.usuarioId}`);
      console.log(`Asunto: ${input.asunto}`);
      console.log(input.cuerpo);
      console.log('------------------------------------------------------------');
    } else {
      await enviarPorSmtp(input);
    }

    await prisma.notificacionCorreo.update({
      where: { id: registro.id },
      data: { estado: 'ENVIADA', enviadoEn: new Date() },
    });
  } catch (error) {
    await prisma.notificacionCorreo.update({
      where: { id: registro.id },
      data: { estado: 'FALLIDA', intentos: { increment: 1 }, error: (error as Error).message },
    });
    throw error;
  }
}

async function enviarPorSmtp(input: EnviarCorreoInput): Promise<void> {
  if (!env.SMTP_HOST) {
    throw new Error('EMAIL_TRANSPORT=smtp requiere configurar SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
  }
  // Integracion real con nodemailer queda fuera del alcance de esta fase;
  // se documenta como pendiente en docs/PROGRESS.md. El contrato (enviarCorreo)
  // ya permite conectar un transportador real sin tocar los llamadores.
  throw new Error('Transportador SMTP no implementado todavia. Use EMAIL_TRANSPORT=console en desarrollo.');
}
