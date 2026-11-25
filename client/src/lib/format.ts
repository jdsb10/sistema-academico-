/**
 * Las columnas @db.Date de Postgres llegan como medianoche UTC. Formatearlas
 * con toLocaleDateString() las corre un dia en zonas horarias negativas
 * (ej. America/Bogota, UTC-5). Se formatea leyendo los componentes UTC.
 */
export function formatFecha(iso: string): string {
  const fecha = new Date(iso);
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getUTCFullYear()}`;
}
