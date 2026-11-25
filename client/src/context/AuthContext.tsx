import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, EVENTO_SESION_EXPIRADA, getTokens, setTokens } from '../lib/api';
import type { LoginResponse, UsuarioSesion } from '../types/api';

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USUARIO_KEY = 'sistema-academico:usuario';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokens = getTokens();
    const usuarioGuardado = localStorage.getItem(USUARIO_KEY);
    if (tokens && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);

    // El refresh token tambien expiro o fue revocado: cierra la sesion en la
    // UI en vez de dejarla mostrando un usuario "autenticado" cuyas
    // peticiones fallan todas en silencio con 401.
    function onSesionExpirada() {
      localStorage.removeItem(USUARIO_KEY);
      setUsuario(null);
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, onSesionExpirada);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, onSesionExpirada);
  }, []);

  async function iniciarSesion(email: string, password: string) {
    const respuesta = await api.post<LoginResponse>('/auth/login', { email, password });
    setTokens({ accessToken: respuesta.accessToken, refreshToken: respuesta.refreshToken });
    localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
    setUsuario(respuesta.usuario);
  }

  function cerrarSesion() {
    const tokens = getTokens();
    setTokens(null);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
    if (tokens) {
      api.post('/auth/logout', { refreshToken: tokens.refreshToken }).catch(() => undefined);
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
