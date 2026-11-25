# Sistema visual — Campus Editorial

Rediseño aplicado al frontend completo el 2026-11-24. La interfaz dejó de ser un panel azul genérico: ahora es un sistema editorial institucional con una jerarquía clara, una paleta con intención y un comportamiento responsive distinto en escritorio, tableta y teléfono.

## 1. Principio

Una aplicación de operación académica debe leerse rápido y sentirse seria. Se eliminaron las tarjetas idénticas sin jerarquía, los degradados decorativos y los colores sueltos. Cada pantalla tiene: una línea de acento, un título con escala editorial, una descripción corta y superficies que agrupan contenido relacionado.

## 2. Paleta 60-30-10

| Rol | Token | Valor | Uso |
|---|---|---|---|
| 60 % superficie | `--color-bg` | `#f5f4ef` | Lienzo marfil cálido |
| 60 % superficie | `--color-surface` | `#ffffff` | Tarjetas, tablas, formularios |
| 60 % texto | `--color-text` | `#152622` | Tinta verde profunda |
| 30 % estructura | `--color-primary` | `#0f2e2a` | Barra lateral, encabezados, botones secundarios |
| 10 % acento | `--color-accent` | `#b94b27` | CTA, activos, líneas de énfasis |

El acento terracota cumple WCAG AA para texto blanco (≈5.4:1). Para texto terracota sobre fondo `-soft` se usa `--color-accent-strong: #a9421f` (≈5.1:1); el terracota normal queda reservado para rellenos de CTA y activos. Los estados semánticos (éxito, peligro, advertencia) usan tokens propios con sufijo `-soft` para fondo y color sólido para texto.

## 3. Tipografía y escala

- **Inter** para toda la interfaz; **JetBrains Mono** solo para códigos, horas y valores numéricos.
- Escala con proporción ≈1.25: 11 / 12 / 13 / 14 / 16 / 20 / 26 / 32 / 48 px.
- Títulos de página: `clamp(1.5rem, 1.2rem + 1.1vw, 2rem)`, peso 650, tracking `-0.035em`, preceded by una regla de acento de 34 × 3 px.
- Cifras de indicadores: 28 px, peso semibold, `tabular-nums`.

## 4. Geometría y movimiento

- Radio de tarjeta: 14 px; botones y campos: 8–10 px; pills: 999 px.
- Espaciado en múltiplos de 8 px (4 px solo para micro-ajustes).
- Elevación: una sombra suave por superficie; ninguna sombra duplicada sobre tarjetas anidadas.
- Micro-interacciones: los enlaces de acceso rápido se elevan 2 px y su icono se desplaza; los botones "pisan" al hacer clic; las filas de tabla cambian de fondo; las entradas aparecen con `translateY(8px) → 0` en 450 ms.
- `prefers-reduced-motion: reduce` desactiva animaciones y transiciones.
- Nota de implementación: Tailwind 3 no genera utilidades con opacidad (`bg-primary/60`) cuando el color es una variable CSS; esos casos usan valores arbitrarios (`bg-[rgba(15,46,42,0.6)]`) y se verificaron en el CSS compilado.

## 5. Componentes compartidos

| Componente | Cambio |
|---|---|
| `Card` / `CardBody` / `CardHeader` | Superficie con radio 14, borde suave, padding 20/24, encabezado con descripción de 13 px |
| `StatCard` | Etiqueta en mayúsculas espaciadas, icono en pastilla verde, valor grande monoespaciado, franja inferior de acento |
| `Button` | Variantes con sombra y hover/active reales, estados disabled sin transform; con `cargando` muestra spinner y «Procesando…»; altura mínima de 44 px en todos los anchos |
| `Input` / `Select` / `Textarea` | Bordes más firmes, foco con acento, etiquetas de 13 px, mensajes de error en rojo semántico; generan `id` con `useId()` cuando no hay `name`, para que la etiqueta siempre quede asociada |
| `FeedbackProvider` / `MutationFeedbackBridge` | Overlay de operaciones largas con spinner, barra indeterminada, pantalla de «Operación finalizada» y botón «Entendido»; toasts de confirmación/error para todas las mutaciones |
| `Table` | Encabezados en mayúsculas sobre fondo alterno; **en móvil cada fila se convierte en una tarjeta** con `data-label` |
| `Badge` | Punto de estado + fondo semántico |
| `Modal` | Fondo con desenfoque, hoja que sube desde abajo en móvil y se centra en escritorio; se renderiza en un portal sobre `document.body` para que el overlay cubra todo el viewport aunque el contenido esté animado; foco inicial en el primer campo, trap de Tab, cierre con Escape/X y restauración del foco |
| `States` | Cargando, vacío y error con iconografía coherente y acciones visibles |

## 6. Layout por dispositivo

- **1440 px**: barra lateral fija de 268 px con navegación agrupada y tarjeta de perfil; contenido centrado hasta 1320 px; gráficos en dos columnas.
- **768 px**: barra lateral se transforma en drawer; contenido a una columna; KPIs en dos columnas.
- **390 px**: drawer + **barra inferior de 4 accesos por rol**; tablas apiladas; horario semanal sustituido por agenda diaria; modales como hoja inferior; sin scroll horizontal en ninguna de las 17 rutas de administrador.

La barra inferior usa rutas distintas por rol y no duplica el `<nav>` principal, para no romper la navegación por teclado ni los selectores de prueba. Es un **dock flotante redondeado** (radio 16 px, centrado, 16 px separado del borde, ancho máximo 380 px, sombra suave y sin borde pegado), con enlaces de 56 px, elevación al hover y foco visible; a 1440 px se oculta y deja paso a la sidebar.

## 7. Accesibilidad

- Foco visible obligatorio con `outline: 2px` de acento y offset de 2 px.
- `aria-label` en menú de usuario, drawer, accesos rápidos y acciones iconográficas.
- El drawer se cierra con Escape o el fondo, expone `aria-expanded`/`aria-controls` en el botón que lo abre, mueve el foco al primer enlace al abrirse y lo devuelve al disparador al cerrarse. El fondo es `aria-hidden` y no es tabulable, para no duplicar el botón de cierre.
- Objetivos táctiles de al menos 44 × 44 px para botones, enlaces y campos (también en tablet y escritorio).
- En login móvil el único H1 es el del formulario; el bloque verde pasa a copia de apoyo y el CTA queda dentro de la primera pantalla.
- Mensajes de error con `role="alert"`, estados de carga con `role="status"`.
- El overlay de operaciones es `aria-modal` y `aria-live="assertive"`: atrapa Tab, ignora Escape mientras procesa, fija el foco en «Entendido» al terminar y pausa el trap del modal subyacente mediante `body.dataset.feedbackActivo`. Modal y overlay comparten un bloqueo de scroll con contador (`lib/scrollLock.ts`), así que cerrar uno sobre el otro nunca deja `overflow: hidden` huérfano. Al cerrar se devuelve el foco al disparador; si el modal inferior ya se desmontó, al botón que lo abrió (registro en `lib/foco.ts`).
- Contraste AA verificado para texto sobre superficies claras y sobre el verde tinta.

## 8. Verificación

- `npm run typecheck` y `npm run build` del cliente: correctos.
- Recorrido Playwright en 390/768/1440 sobre login, dashboard, CRUD, horarios y 17 rutas de administrador: sin desbordamiento horizontal ni peticiones fallidas.
- Estados temporales verificados en vivo a 390/768/1440: respaldos, restauración, reportes y sincronización muestran overlay `procesando → éxito`; CRUD muestra «Procesando…» y toast de confirmación; notas y asistencia muestran guardado inline.
- Auditoría de arte final: **`IMPECCABLE: PASS`**.
- Capturas en `docs/auditorias/rediseno/` (incluye `feedback-*.png` de procesando/listo) y auditoría global final en `C:\Users\JDsal\.config\opencode\audits\2026-11-24-21-54-20\` (HTTP 200 en 1440 y 390, sin errores de consola ni peticiones fallidas).
