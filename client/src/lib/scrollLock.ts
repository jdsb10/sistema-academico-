/**
 * Bloqueo de scroll con contador: varias capas (modal + overlay de feedback)
 * pueden pedirlo a la vez sin pisar el valor de la capa anterior.
 */
let activos = 0;
let overflowBase: string | null = null;

export function bloquearScroll(): () => void {
  if (activos === 0) {
    overflowBase = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activos += 1;

  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    activos -= 1;
    if (activos === 0) {
      document.body.style.overflow = overflowBase ?? '';
      overflowBase = null;
    }
  };
}
