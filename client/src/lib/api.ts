const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const STORAGE_KEY = 'sistema-academico:tokens';

/**
 * Evento que AuthContext escucha para cerrar la sesion en React cuando el
 * refresh token tambien expiro o fue revocado. Sin esto, limpiar solo
 * localStorage dejaba la UI mostrando al usuario como autenticado mientras
 * todas las peticiones fallaban en silencio con 401 (bug real encontrado en
 * verificacion manual).
 */
export const EVENTO_SESION_EXPIRADA = 'sistema-academico:sesion-expirada';

export function getTokens(): Tokens | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

export function setTokens(tokens: Tokens | null): void {
  if (tokens) localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(STORAGE_KEY);
}

let refrescando: Promise<Tokens | null> | null = null;

async function refrescarTokens(): Promise<Tokens | null> {
  const actuales = getTokens();
  if (!actuales) return null;

  const respuesta = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: actuales.refreshToken }),
  });

  if (!respuesta.ok) {
    setTokens(null);
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    return null;
  }

  const datos = await respuesta.json();
  const nuevos = { accessToken: datos.accessToken, refreshToken: datos.refreshToken };
  setTokens(nuevos);
  return nuevos;
}

interface PeticionOpciones extends RequestInit {
  json?: unknown;
  omitirAuth?: boolean;
}

export async function apiFetch<T>(path: string, opciones: PeticionOpciones = {}): Promise<T> {
  const { json, omitirAuth, headers, ...resto } = opciones;
  const tokens = getTokens();

  const construirHeaders = (): HeadersInit => ({
    ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(tokens && !omitirAuth ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    ...headers,
  });

  let respuesta = await fetch(`${API_BASE}${path}`, {
    ...resto,
    headers: construirHeaders(),
    body: json !== undefined ? JSON.stringify(json) : resto.body,
  });

  if (respuesta.status === 401 && tokens && !omitirAuth) {
    refrescando ??= refrescarTokens().finally(() => {
      refrescando = null;
    });
    const nuevosTokens = await refrescando;

    if (nuevosTokens) {
      respuesta = await fetch(`${API_BASE}${path}`, {
        ...resto,
        headers: {
          ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${nuevosTokens.accessToken}`,
          ...headers,
        },
        body: json !== undefined ? JSON.stringify(json) : resto.body,
      });
    }
  }

  if (respuesta.status === 204) return undefined as T;

  const contentType = respuesta.headers.get('content-type') ?? '';
  const esJson = contentType.includes('application/json');
  const cuerpo = esJson ? await respuesta.json().catch(() => null) : await respuesta.blob();

  if (!respuesta.ok) {
    const error = (cuerpo as { error?: { code: string; message: string; details?: unknown } })?.error;
    throw new ApiError(respuesta.status, error?.code ?? 'ERROR', error?.message ?? 'Ocurrio un error inesperado', error?.details);
  }

  return cuerpo as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: 'POST', json }),
  put: <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: 'PUT', json }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
