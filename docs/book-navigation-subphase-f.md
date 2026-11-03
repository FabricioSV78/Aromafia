# Aceptación integral del libro — subfase F

**3 de noviembre de 2026.** El propietario pidió continuar con el siguiente paso después de revisar
los seis detalles editoriales. Esta entrega aborda F del
[brief de navegación](book-navigation-subphase-a.md): recorridos completos, enlaces directos,
historial, compra, móvil, teclado, movimiento reducido, accesibilidad y rendimiento. La autorización
permite cerrar esta aceptación local; no incluye publicar el sitio ni conectar servicios.

## Correcciones de acceso y composición

La revisión detectó una franja de escritorio de poca altura que conservaba la composición de una
sola vista sin suficiente espacio para las notas. El reflow que antes comenzaba únicamente a
520 px de altura se amplía a escritorio desde 896 px de ancho y por debajo de 720 px de alto.
El libro reserva su papel legible antes de abrir el detalle, conservando el mismo marco al enfocarlo.
La zona editorial mantiene una altura finita para que notas, fuentes, servicios y compra sigan
distribuidos dentro del papel. En estas ventanas el documento permite desplazamiento vertical.

Al devolver el foco desde la compra o cambiar el tamaño de ventana, un control podía quedar fuera
del viewport o debajo de la barra móvil de retorno. El controlador comprueba el elemento enfocado
y lo revela únicamente si sale del viewport o queda completamente bajo la barra de retorno. El
comportamiento también se aplica al navegar con teclado por el detalle; no altera el foco ni
activa un scroll continuo. La tarea pendiente de foco usa un solo animation frame cancelable y
el listener se retira con la escena. El guard de `disposed` impide desplazamientos durante la limpieza.
La barra móvil respeta el área segura inferior del dispositivo. Cerrar una compra cuyo control ya
está visible conserva la posición de lectura.

El catálogo declara `theme-color="#12100c"`, coherente con su entorno oscuro cálido. La página de
error y el valor predeterminado del layout conservan el crema anterior. El color se transmite por
propiedades tipadas entre la composición, el layout y los metadatos; no depende de detectar rutas
en un componente global.

## Auditoría reproducible

`scripts/audit-performance.mjs` usa un navegador temporal controlado por Playwright y un puerto
local disponible para Lighthouse. El cierre en `finally` libera el navegador y su perfil; no se
reutiliza un perfil persistente ni se depende de un puerto de depuración fijo. Se mantienen el
perfil móvil y los umbrales de los presupuestos existentes.

## Cobertura y archivos

| Archivo                                                                                      | Responsabilidad                                                                                                                    |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/catalog/styles/book-reading.css`                                               | Reflow de escritorio con poca altura, reservado antes del enfoque                                                                  |
| `src/features/catalog/styles/editorial-reading.css`                                          | Altura estable de lectura y área segura de la barra móvil                                                                          |
| `src/motion/book-scene.ts`                                                                   | Control enfocado visible tras teclado, resize y retorno desde compra; limpieza de la tarea pendiente                               |
| `src/components/seo/PageHead.astro`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro` | Color de navegador propio del catálogo y valor predeterminado conservado                                                           |
| `scripts/audit-performance.mjs`                                                              | Auditoría local sin perfil persistente ni puerto fijo                                                                              |
| `tests/e2e/book-acceptance.spec.ts`                                                          | Lectura de los seis perfumes a 915×540 y 1024×600, marco estable y compra con teclado; rotación con campos y selección conservados |
| `tests/e2e/foundation.spec.ts`                                                               | Metadatos del catálogo oscuro y de la página de error crema                                                                        |

Las nuevas comprobaciones complementan las pruebas existentes de identidad DOM, enlaces directos,
recarga, Atrás/Adelante, regreso al libro, reduced motion, fotos durante transiciones, fallos del
módulo y catálogo sin JavaScript. El diseño aprobado, las fuentes fotográficas, las notas, los
precios, la compra compacta y la navegación mediante las hojas se conservan.

## Verificación de cierre

Todas las comprobaciones siguientes corresponden al build final de F. Se ejecutaron los comandos
individuales de calidad; no se presenta una ejecución del alias `verify` que no se haya realizado.

| Comprobación              | Resultado                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Astro y TypeScript        | 88 archivos; cero errores, advertencias o hints; `tsc` correcto                                                                          |
| ESLint y Prettier         | Correctos                                                                                                                                |
| Unitarios                 | 106/106 pruebas en 14 archivos                                                                                                           |
| Navegador                 | 150/150 en 3.0 minutos; Chromium de escritorio y emulación móvil                                                                         |
| Nuevos casos              | Los seis perfumes a 915×540 y 1024×600; orientación 390×844 → 915×412 → 390×844 con compra, campos, selección, Escape y foco conservados |
| Regresiones               | Enlaces directos, recarga, historial, reduced motion, teclado, marco, compra compacta y contenido sin JS correctos                       |
| Fotografías en movimiento | 239 muestras, incluidas 12 de clones visibles; cero fondos blancos detectados y sin clones residuales                                    |
| Build                     | Inicio, 404 y robots; sin rutas de ficha completa                                                                                        |
| Presupuestos              | JS gzip 122062 bytes, CSS gzip 9981 bytes y HTML máximo 50496 bytes; límites conservados                                                 |
| Originales                | SHA256 del logo oficial y HTML v3 conservados                                                                                            |
| Lighthouse móvil          | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 66 por noindex intencional                                                 |
| Laboratorio               | LCP 1504 ms, CLS 0, TBT 0 ms                                                                                                             |

Los cuatro casos nuevos de navegador complementan los 146 existentes, sin relajar sus umbrales.
La revisión detectó que una primera corrección desplazaba innecesariamente el documento al cerrar
una compra cuyo control ya era visible. El guard final conserva esa posición y repara el foco
cuando queda fuera del viewport o completamente cubierto por el retorno. Las 150 pruebas pasan
sobre esa corrección final.

Evidencia local en `reports/subphase-f/`: `final-e2e.log`, capturas `short-desktop-*.png`,
`photo-summary.json` y Lighthouse en `performance/`. Las capturas adicionales, los píxeles de las
transiciones y el reporte de navegador permanecen en `test-results/` y `playwright-report/`.

## Límites y revisión

Las emulaciones de Chromium no acreditan Safari/Firefox, un teclado móvil físico, el tratamiento
de notches en un dispositivo real ni FPS o INP de campo. El reflow accesible admite desplazamiento
vertical cuando una ventana baja no permite leer todo el papel en una sola vista.

El sitio continúa local y con noindex. Esta subfase no añade pagos, reservas, persistencia de datos
personales, SDK, infraestructura ni envío automático de mensajes. Al cerrar las verificaciones,
corresponde revisar visualmente estos recorridos con el propietario.
