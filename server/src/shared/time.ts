/**
 * Prisma mapea columnas @db.Time(0) a objetos Date; el componente de fecha se
 * descarta al guardar pero debe ser un ISO valido. Se fija siempre en la
 * epoca para que comparar horas por valor numerico sea correcto.
 */
export function horaATimestamp(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

export function timestampAHora(fecha: Date): string {
  return fecha.toISOString().slice(11, 16);
}
