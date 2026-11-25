import { useEffect, useRef, useState, type RefObject } from 'react';
import { LogOut, ChevronDown, Menu, CircleUserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from './Breadcrumbs';

const ROL_LABEL: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  COORDINADOR: 'Coordinador',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
};

export function Topbar({
  onAbrirMenu,
  menuButtonRef,
  menuAbierto,
}: {
  onAbrirMenu: () => void;
  menuButtonRef?: RefObject<HTMLButtonElement | null>;
  menuAbierto?: boolean;
}) {
  const { usuario, cerrarSesion } = useAuth();
  const [menuUsuario, setMenuUsuario] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const iniciales = usuario?.email.split('@')[0].split(/[._-]/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuUsuario(false);
    }
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuUsuario(false);
    }
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      document.removeEventListener('keydown', alTeclear);
    };
  }, []);

  return (
    <header className="relative z-30 flex h-[72px] flex-shrink-0 items-center justify-between gap-3 border-b border-border bg-[rgba(255,255,255,0.95)] px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          ref={menuButtonRef}
          onClick={onAbrirMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto ?? false}
          aria-controls="menu-lateral"
          className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-border text-text transition-colors hover:bg-surface-alt lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <div className="min-w-0 overflow-hidden">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-light md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          {usuario ? ROL_LABEL[usuario.rol] : ''}
        </span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuUsuario((v) => !v)}
            className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2 transition-colors hover:border-primary-light hover:bg-surface-alt"
            aria-haspopup="menu"
            aria-expanded={menuUsuario}
            aria-label="Menú de usuario"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{iniciales}</span>
            <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${menuUsuario ? 'rotate-180' : ''}`} />
          </button>
          {menuUsuario && (
            <div className="animate-enter absolute right-0 top-full z-20 mt-2 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-popover" role="menu">
              <div className="border-b border-border px-3 py-2.5">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-text">
                  <CircleUserRound className="h-4 w-4 text-text-muted" aria-hidden /> Mi cuenta
                </p>
                <p className="mt-1 truncate text-xs text-text-muted">{usuario?.email}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">{usuario ? ROL_LABEL[usuario.rol] : ''}</p>
              </div>
              <button
                onClick={cerrarSesion}
                role="menuitem"
                className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-danger transition-colors hover:bg-danger-soft"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
