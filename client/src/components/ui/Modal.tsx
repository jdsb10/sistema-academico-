import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { bloquearScroll } from '../../lib/scrollLock';
import { Button } from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ titulo, onClose, children, ancho = 'max-w-lg', bloquearCierre = false }: { titulo: string; onClose: () => void; children: ReactNode; ancho?: string; bloquearCierre?: boolean }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const liberarScroll = bloquearScroll();

    const visibles = () =>
      dialogRef.current
        ? [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((e) => e.getBoundingClientRect().width > 0)
        : [];
    const campo = dialogRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');
    (campo ?? visibles()[0])?.focus();

    function onKeyDown(e: KeyboardEvent) {
      // Una operación global (respaldo, reporte, etc.) tiene prioridad: no la
      // interferimos con el trap de este modal ni permitimos cerrarlo.
      if (document.body.dataset.feedbackActivo === 'true') return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const elements = visibles();
      if (elements.length === 0) return;
      const primero = elements[0];
      const ultimo = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      liberarScroll();
      anterior?.focus?.();
    };
  }, []);

  // Portal a document.body: el contenido de <main> tiene una animación con transform
  // que, sin portal, convierte al overlay `fixed` en un elemento posicionado respecto
  // a ese contenedor y deja el botón de cierre tapado por el header en tablet/desktop.
  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,46,42,0.6)] p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className={`animate-enter flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-surface shadow-popover sm:rounded-2xl ${ancho}`}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold tracking-tight text-text">{titulo}</h2>
          <button onClick={bloquearCierre ? () => undefined : onClose} disabled={bloquearCierre} aria-label="Cerrar" className="icon-button disabled:cursor-not-allowed disabled:opacity-40">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  titulo,
  mensaje,
  confirmarTexto = 'Confirmar',
  peligroso,
  onConfirm,
  onClose,
  cargando = false,
}: {
  titulo: string;
  mensaje: string;
  confirmarTexto?: string;
  peligroso?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  cargando?: boolean;
}) {
  return (
    <Modal titulo={titulo} onClose={onClose} ancho="max-w-md" bloquearCierre={cargando}>
      <p className="text-sm leading-relaxed text-text-muted">{mensaje}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button variante="secondary" disabled={cargando} onClick={onClose}>Cancelar</Button>
        <Button variante={peligroso ? 'danger' : 'primary'} cargando={cargando} onClick={onConfirm}>
          {confirmarTexto}
        </Button>
      </div>
    </Modal>
  );
}
