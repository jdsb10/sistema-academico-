/** Registra el último elemento enfocado que no pertenece a un diálogo. */
let ultimoFocoExterno: HTMLElement | null = null;

if (typeof document !== 'undefined') {
  document.addEventListener('focusin', (evento) => {
    const objetivo = evento.target;
    if (!(objetivo instanceof HTMLElement)) return;
    if (objetivo.closest('[role="dialog"], [data-feedback-overlay]')) return;
    ultimoFocoExterno = objetivo;
  });
}

export function focoExternoReciente(): HTMLElement | null {
  return ultimoFocoExterno?.isConnected ? ultimoFocoExterno : null;
}

export function enfocar(elemento: HTMLElement | null): boolean {
  if (!elemento?.isConnected) return false;
  if (elemento.hasAttribute('disabled') || elemento.getAttribute('aria-hidden') === 'true') return false;
  elemento.focus();
  return document.activeElement === elemento;
}
