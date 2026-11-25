import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <CompassIcon className="h-10 w-10 text-text-muted" />
      <div>
        <h1 className="text-lg font-semibold text-text">Pagina no encontrada</h1>
        <p className="mt-1 text-sm text-text-muted">La ruta que buscas no existe o no tienes acceso a ella.</p>
      </div>
      <Link to="/" className="text-sm font-medium text-accent hover:text-accent-hover">
        Volver al inicio
      </Link>
    </div>
  );
}
