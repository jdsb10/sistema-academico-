import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_POR_ROL, TABS_POR_ROL } from './nav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { usuario } = useAuth();
  const tabs = usuario
    ? TABS_POR_ROL[usuario.rol].map((ruta) => NAV_POR_ROL[usuario.rol].find((item) => item.to === ruta)).filter(Boolean)
    : [];

  // Escape cierra el drawer desde cualquier punto de la app.
  useEffect(() => {
    if (!menuAbierto) return;
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuAbierto(false);
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [menuAbierto]);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar
        abierto={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        menuButtonRef={menuButtonRef}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onAbrirMenu={() => setMenuAbierto(true)}
          menuButtonRef={menuButtonRef}
          menuAbierto={menuAbierto}
        />
        <main className="app-main flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-[1320px] animate-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {tabs.length > 0 && (
        <div
          role="navigation"
          aria-label="Accesos rápidos"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-1/2 z-20 flex w-[calc(100%-24px)] max-w-[380px] -translate-x-1/2 items-stretch justify-around gap-1 rounded-2xl bg-[rgba(255,255,255,0.96)] px-2 py-2 shadow-[0_12px_32px_-14px_rgba(15,46,42,0.55)] backdrop-blur-xl lg:hidden"
        >
          {tabs.map((tab) => tab && (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `group flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive ? 'text-accent-strong' : 'text-text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-11 items-center justify-center rounded-full transition-colors duration-200 ${isActive ? 'bg-accent-soft' : 'group-hover:bg-surface-alt'}`}>
                    <tab.icon className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:-translate-y-px ${isActive ? 'scale-110' : ''}`} aria-hidden />
                  </span>
                  <span className="w-full truncate text-center">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
