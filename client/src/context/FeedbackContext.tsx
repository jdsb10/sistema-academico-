import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { bloquearScroll } from '../lib/scrollLock';
import { enfocar, focoExternoReciente } from '../lib/foco';

type TipoToast = 'exito' | 'error';
type FaseOperacion = 'procesando' | 'exito' | 'error';

interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

interface Operacion {
  titulo: string;
  descripcion: string;
  fase: FaseOperacion;
}

interface EjecutarOpciones<T> {
  titulo: string;
  descripcion?: string;
  tituloExito?: string;
  mensajeExito: string | ((datos: T) => string);
  accion: () => Promise<T>;
}

interface FeedbackContextValue {
  notificar: (mensaje: string, tipo?: TipoToast) => void;
  ejecutar: <T>(opciones: EjecutarOpciones<T>) => Promise<T>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback(): FeedbackContextValue {
  const contexto = useContext(FeedbackContext);
  if (!contexto) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return contexto;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [operacion, setOperacion] = useState<Operacion | null>(null);
  const consecutivo = useRef(0);
  const temporizadorExito = useRef<number | null>(null);
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const faseRef = useRef<FaseOperacion | undefined>(undefined);
  const focoDisparador = useRef<HTMLElement | null>(null);
  faseRef.current = operacion?.fase;

  const notificar = useCallback((mensaje: string, tipo: TipoToast = 'exito') => {
    const id = ++consecutivo.current;
    setToasts((actuales) => [...actuales.slice(-2), { id, tipo, mensaje }]);
    window.setTimeout(() => setToasts((actuales) => actuales.filter((t) => t.id !== id)), 4200);
  }, []);

  const cerrarOperacion = useCallback(() => {
    if (temporizadorExito.current !== null) window.clearTimeout(temporizadorExito.current);
    temporizadorExito.current = null;
    setOperacion(null);
  }, []);

  const ejecutar = useCallback(async <T,>({ titulo, descripcion, tituloExito = 'Listo', mensajeExito, accion }: EjecutarOpciones<T>): Promise<T> => {
    if (temporizadorExito.current !== null) window.clearTimeout(temporizadorExito.current);
    const inicio = Date.now();
    focoDisparador.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOperacion({ titulo, descripcion: descripcion ?? 'Estamos trabajando en ello…', fase: 'procesando' });

    // Las operaciones pueden terminar en milisegundos. Mantenemos el estado
    // "procesando" un mínimo para que el aviso sea perceptible y no parezca que
    // la interfaz no hizo nada.
    const esperarVisible = async () => {
      const restante = 700 - (Date.now() - inicio);
      if (restante > 0) await new Promise<void>((resolver) => window.setTimeout(resolver, restante));
    };

    try {
      const datos = await accion();
      await esperarVisible();
      const mensaje = typeof mensajeExito === 'function' ? mensajeExito(datos) : mensajeExito;
      setOperacion({ titulo: tituloExito, descripcion: mensaje, fase: 'exito' });
      temporizadorExito.current = window.setTimeout(() => setOperacion(null), 3600);
      return datos;
    } catch (error) {
      await esperarVisible();
      setOperacion({
        titulo: 'No se pudo completar',
        descripcion: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
        fase: 'error',
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (operacion && operacion.fase !== 'procesando') tarjetaRef.current?.focus();
  }, [operacion]);

  // Mientras hay una operación en curso, el modal subyacente no debe atrapar
  // el teclado ni permitir Escape: esta capa tiene prioridad y bloquea la UI.
  const hayOperacion = operacion !== null;
  useEffect(() => {
    if (!hayOperacion) return;
    const liberarScroll = bloquearScroll();
    document.body.dataset.feedbackActivo = 'true';

    function onKeyDown(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        evento.stopPropagation();
        if (faseRef.current !== 'procesando') cerrarOperacion();
        return;
      }
      if (evento.key === 'Tab') {
        evento.preventDefault();
        if (faseRef.current !== 'procesando') tarjetaRef.current?.querySelector<HTMLElement>('button')?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      delete document.body.dataset.feedbackActivo;
      liberarScroll();
      // El modal subyacente puede desmontarse al terminar la operación. Dejamos
      // que React termine de retirar los portales antes de devolver el foco.
      window.requestAnimationFrame(() => {
        const disparador = focoDisparador.current;
        const objetivo = disparador?.isConnected ? disparador : focoExternoReciente();
        if (!enfocar(objetivo)) {
          const titulo = document.querySelector<HTMLElement>('main h1');
          if (titulo) {
            titulo.tabIndex = -1;
            enfocar(titulo);
          }
        }
        focoDisparador.current = null;
      });
    };
  }, [hayOperacion, cerrarOperacion]);

  useEffect(() => () => {
    if (temporizadorExito.current !== null) window.clearTimeout(temporizadorExito.current);
  }, []);

  const valor: FeedbackContextValue = { notificar, ejecutar };

  return (
    <FeedbackContext.Provider value={valor}>
      {children}

      {toasts.length > 0 &&
        createPortal(
          <div
            className="pointer-events-none fixed right-4 top-[84px] z-[120] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
            aria-live="polite"
            data-feedback-overlay
          >
            {toasts.map((toast) => (
              <div
                key={toast.id}
                role={toast.tipo === 'error' ? 'alert' : 'status'}
                className={`animate-enter pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-popover ${
                  toast.tipo === 'error' ? 'border-[rgba(179,55,47,0.4)]' : 'border-[rgba(38,112,79,0.4)]'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                    toast.tipo === 'error' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'
                  }`}
                >
                  {toast.tipo === 'error' ? <AlertTriangle className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
                </span>
                <p className="flex-1 pt-1 text-[13px] font-medium leading-snug text-text">{toast.mensaje}</p>
                <button
                  type="button"
                  aria-label="Cerrar notificación"
                  onClick={() => setToasts((actuales) => actuales.filter((t) => t.id !== toast.id))}
                  className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}

      {operacion &&
        createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(15,46,42,0.72)] p-4 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-live="assertive"
            aria-label={operacion.titulo}
            data-feedback-overlay
          >
            <div
              ref={tarjetaRef}
              tabIndex={-1}
              className="animate-enter w-full max-w-[420px] rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center shadow-popover outline-none sm:p-8"
            >
              {operacion.fase === 'procesando' ? (
                <>
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-light" aria-hidden />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold tracking-tight text-text">{operacion.titulo}</h2>
                  <p className="mx-auto mt-2 max-w-[34ch] text-[13px] leading-relaxed text-text-muted">{operacion.descripcion}</p>
                  <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                    <span className="animate-indeterminate block h-full w-1/3 rounded-full bg-accent" aria-hidden />
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    No cierres esta ventana
                  </p>
                </>
              ) : (
                <>
                  <span
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                      operacion.fase === 'exito' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                    }`}
                  >
                    {operacion.fase === 'exito' ? <CheckCircle2 className="h-6 w-6" aria-hidden /> : <AlertTriangle className="h-6 w-6" aria-hidden />}
                  </span>
                  <h2 className="mt-5 text-lg font-semibold tracking-tight text-text">{operacion.titulo}</h2>
                  <p className="mx-auto mt-2 max-w-[36ch] text-[13px] leading-relaxed text-text-muted">{operacion.descripcion}</p>
                  {operacion.fase === 'exito' && (
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-success">Operación finalizada</p>
                  )}
                  <button
                    type="button"
                    onClick={cerrarOperacion}
                    className="mt-6 min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:translate-y-px"
                  >
                    Entendido
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </FeedbackContext.Provider>
  );
}

/**
 * Convierte cualquier mutación de TanStack Query en una notificación visible.
 * Las operaciones largas usan `ejecutar` y marcan meta.silenciarToast para no
 * duplicar mensajes.
 */
export function MutationFeedbackBridge() {
  const queryClient = useQueryClient();
  const { notificar } = useFeedback();

  useEffect(() => {
    const estados = new WeakMap<object, string>();
    const unsubscribe = queryClient.getMutationCache().subscribe((evento) => {
      if (evento.type !== 'updated') return;
      const mutacion = evento.mutation;
      const estado = mutacion.state.status;
      if (estados.get(mutacion) === estado) return;
      estados.set(mutacion, estado);

      const meta = mutacion.options.meta as
        | { mensajeExito?: string; mensajeError?: string; silenciarToast?: boolean }
        | undefined;
      if (meta?.silenciarToast) return;

      if (estado === 'success') {
        notificar(meta?.mensajeExito ?? 'Cambios guardados correctamente');
      } else if (estado === 'error') {
        notificar(meta?.mensajeError ?? 'No se pudo guardar. Revisa los datos e inténtalo de nuevo.', 'error');
      }
    });
    return unsubscribe;
  }, [queryClient, notificar]);

  return null;
}
