# Rendimiento y accesibilidad

La aceptación integral del catálogo implementado se registra en
[subfase F](book-navigation-subphase-f.md) y [validación](validation.md).

Objetivos de Core Web Vitals: LCP≤2.5s, INP≤200ms y CLS≤0.1 en percentil75, separados por móvil
y escritorio. Son objetivos de usuarios reales; el laboratorio local no demuestra su cumplimiento
en visitantes reales.
[Definiciones y umbrales oficiales](https://web.dev/articles/vitals).

## Presupuestos y estrategia

- HTML renderizado en build y contenido básico sin JavaScript. React se hidrata solo por necesidad.
- GSAP se importa de forma diferida por escena visible; ScrollTrigger no se solicita para el libro.
- `check:budget` controla HTML≤56KiB, JavaScript total emitido gzip≤120KiB y CSS separado gzip≤20KiB.
  El límite HTML anterior de50KiB se revisó tras añadir seis referencias fotográficas con fuentes y
  cinco comparaciones de precio verificables. Antes se extrajeron encuadres como CSS estático y se
  eliminaron atributos duplicados:59386bytes iniciales pasan a52864bytes. Los límites JS/CSS no cambian.
  Son presupuestos propios, no umbrales oficiales. CSS inline cuenta dentro del HTML.
- Astro/React emite un runtime React reutilizable incluso sin islas; comprobar peticiones reales:
  un archivo en `dist/` no implica que el visitante lo descargue.
- Revisar presupuesto por ruta y transferencia total con fotografías; no elevar
  límites para ocultar regresiones. Cargar por ruta/escena y evitar dependencias duplicadas.
- `astro:assets` para imágenes importadas, dimensiones reservadas, srcset/sizes correctos y
  compresión visualmente revisada. Originales de marca fuera de public. No preload masivo.
- Evitar animaciones de top/left/width/height por frame; agrupar lecturas/escrituras de layout.
  No `will-change` permanente sobre toda la página. Suspender trabajo invisible.
- Capturar tareas largas/INP al introducir filtros y navegación; no confundir TBT de laboratorio
  con INP de visitantes. El perfil móvil ligero es heurístico, debe medirse en equipos reales.

## Verificación disponible

`npm run test:browser:install` instala el Chromium completo compatible con la versión fijada de
Playwright mediante `playwright install chromium --no-shell`. Las pruebas y los scripts de
auditoría usan `channel: 'chromium'` con `headless: true`, seleccionando su modo headless moderno
en lugar de Chrome Headless Shell. La suite conserva todos los casos, con un solo worker y sin
paralelismo entre ellos. Ejecutar capturas, E2E y perfiles de rendimiento por turnos; un worker
no limita los navegadores que pueda abrir otro script ejecutado simultáneamente.

`npm run audit:performance` usa Lighthouse móvil con ese mismo Chromium instalado por Playwright.
Cada ejecución utiliza un perfil temporal propio y un puerto CDP local libre; `finally` cierra el
navegador y libera el perfil. No reutiliza `.cache/lighthouse-profile` ni depende del puerto9333.
Requiere `npm run preview -- --port 4321`. Produce HTML/JSON en reports y falla si rendimiento<90,
LCP>2500ms, CLS>0.1 o TBT>200ms. No comparte resultados con un servicio externo.
La puntuación SEO es deliberadamente menor mientras `noindex` esté activo.

Chrome DevTools permite complementar con trace en frío, peticiones y árbol accesible.
Solo añadir monitorización/RUM cuando haya publicación, política de datos y necesidad real.
Las pruebas actuales de móvil son emulación Chromium, no una certificación en hardware de gama media.

## Accesibilidad

Objetivo WCAG2.2AA: semántica, navegación por teclado, foco visible, reflow/zoom, textos alternativos,
contrastes, nombres de controles y estados claros. [Referencia W3C](https://www.w3.org/WAI/WCAG22/quickref/).

- `BaseLayout` aporta idioma es-PE, documento semántico y enlace de salto al main.
- Button usa elemento nativo y `type=button`; navegación usa anclas. No gestos exclusivos.
- Tokens prueban contraste con los fondos permitidos. Los nuevos estados/combinaciones requieren revisión.
- Reduced motion se observa al montar y al cambiar. La escena se revierte y el contenido queda visible.
- Cambio de vista limpia recursos; futura navegación cliente deberá gestionar foco/anuncios explícitos.
- Los medios decorativos se ocultan al árbol accesible; los informativos reciben descripciones útiles.
- Movimiento automático prolongado requiere pausa/omisión cuando corresponda; nunca flashes rápidos.

Playwright + axe cubren escritorio/móvil, teclado, ausencia de overflow, página404 y contenido sin JS.
Las pruebas automáticas no reemplazan revisión manual, lector de pantalla ni validación de los flujos
comerciales futuros. Aún no se ha probado Safari/Firefox ni lectores de pantalla.
