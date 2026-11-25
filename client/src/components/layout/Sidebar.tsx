import { useEffect, useRef, type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, X, LogOut, ChevronsLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_POR_ROL } from './nav';

const ROL_LABEL: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  COORDINADOR: 'Coordinador',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
};

export function Sidebar({
  abierto,
  onClose,
  menuButtonRef,
}: {
  abierto: boolean;
  onClose: () => void;
  menuButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const { usuario, cerrarSesion } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const abiertoAnterior = useRef(false);
  if (!usuario) return null;
  const items = NAV_POR_ROL[usuario.rol];
  const iniciales = usuario.email.split('@')[0].split(/[._-]/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  let grupoActual = '';

  // Al abrir el drawer el foco entra al primer enlace; al cerrar vuelve al botón que lo abrió.
  useEffect(() => {
    if (abierto && !abiertoAnterior.current) {
      navRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    } else if (!abierto && abiertoAnterior.current) {
      menuButtonRef?.current?.focus();
    }
    abiertoAnterior.current = abierto;
  }, [abierto, menuButtonRef]);

  return (
    <>
      {abierto && (
        <button
          aria-label="Cerrar menú (fondo)"
          aria-hidden="true"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-[rgba(15,46,42,0.7)] backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        id="menu-lateral"
        aria-label="Menú lateral"
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[268px] flex-shrink-0 flex-col bg-primary text-text-inverse transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Marca */}
        <div className="flex h-[72px] flex-shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-[0_8px_18px_-10px_rgba(185,75,39,1)]">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">Sistema Académico</span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-white/65">Universidad</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-white/65 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación agrupada */}
        <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navegación principal">
          {items.map((item) => {
            const mostrarGrupo = item.group !== grupoActual;
            grupoActual = item.group;
            return (
              <div key={item.to}>
                {mostrarGrupo && (
                  <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 ${
                    item.group === items[0].group ? 'mt-0' : 'mt-5'
                  }`}>
                    {item.group}
                  </p>
                )}
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-accent before:opacity-0 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] before:opacity-100'
                        : 'text-white/65 hover:bg-white/[0.07] hover:text-white hover:translate-x-0.5'
                    }`
                  }
                >
                  <item.icon className="h-[17px] w-[17px] flex-shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                  <ChevronsLeft className="ml-auto h-3.5 w-3.5 -rotate-90 text-white/0 transition-colors group-hover:text-white/55" aria-hidden />
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* Perfil */}
        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
              {iniciales}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-white">{ROL_LABEL[usuario.rol]}</span>
              <span className="block truncate text-[11px] text-white/65">{usuario.email}</span>
            </span>
            <button
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.14em] text-white/55">Sesión institucional</p>
        </div>
      </aside>
    </>
  );
}
