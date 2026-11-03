# Detalle dentro del libro — entrega de subfase D

**2 de noviembre de 2026.** Se implementó la siguiente subfase solicitada y se revisó visualmente
el movimiento de hojas, apertura y cierre. La subfase E, formulario y mensaje personalizado de
WhatsApp, queda para el siguiente paso. No se añadieron pagos, servicios ni dependencias.

## Lectura en la misma página

«Explorar» acerca el perfume como en C. Al llegar, la fase `revealing` habilita el detalle dentro
de esa zona y revela su cuerpo de forma breve. «Notas y detalles» desplaza la columna de lectura
del papel hasta las notas. La imagen principal permanece fija y dominante; nombre y precio usan
los mismos nodos del resumen. La referencia olfativa es secundaria y considerablemente menor.

El contenido incluye descripción, presentación, disponibilidad, notas de entrada/corazón/fondo,
referencia, consulta por WhatsApp y señales de originalidad/entregas. Todo procede del producto
público y la configuración existentes. Las fotografías, marcas, notas y referencias desconocidas
siguen identificadas; no se publican precios anteriores propuestos como confirmados.

No hay modal, pantalla superpuesta, copia de producto ni fetch de otra ficha. `PerfumeReading`
se renderiza durante build junto a la zona, oculto e inert hasta seleccionar. Un enlace nativo
conserva el detalle estático como alternativa, incluido sin JavaScript.

La columna tiene semántica de región y foco de teclado; en móvil el cuerpo usa texto de 14px y
requiere desplazamiento interno por su ancho disponible. Esto conserva la imagen y la continuidad
de la página, aunque implica varios deslizamientos para leer todo en pantallas pequeñas. El botón
de notas tiene un área mínima de 44px. El documento completo permanece sin desplazamiento durante
la lectura del libro en los tamaños probados.

Al volver, se cancela el scroll suave pendiente, se repliega el cuerpo, se restablece la columna
y la cámara regresa a su posición original. Se conserva página y foco del perfume. El scroll
de lectura también se limpia en salidas, cambios de selección y desmontaje. El motor diferido,
reduced motion, historial y URLs de C permanecen operativos.

## Giro y pruebas visuales

El giro anterior reemplazaba las caras de fondo al pasar por el canto y desvanecía el contenedor
3D. Eso podía provocar un salto de contenido y aplanar las caras. `book-turn.ts` ahora coordina
una hoja opaca de dos caras durante 1.04s con aceleración/desaceleración natural. El fondo permanece
estable durante todo el recorrido y las caras reales se actualizan al terminar. El sombreado y
la profundidad son discretos, sin cambiar dimensiones por frame.

Se revisaron **48 cuadros de las timelines integradas**, ocho hojas de contacto y dos vídeos:
avance, retroceso, apertura y cierre en escritorio y móvil. Los progresos 49/51% permiten observar
el punto donde ocurría el salto. Las últimas caras y la contraportada quedan coherentes al finalizar.
La secuencia de portada corregida en C mantiene su geometría y no vuelve a atravesar los productos.

En tres pares continuos por perfil, el muestreo rAF dio mediana 16.7ms y p95≤16.8ms. Hubo intervalos
aislados de 33ms en escritorio; se conserva también el primer muestreo menos favorable. Son datos
de Chromium headless en este equipo, no una promesa de 60 FPS en teléfonos reales.
Proceso, rutas y límites: [revisión visual de movimiento](motion-visual-subphase-d.md).

La auditoría de carga encontró además un CLS de 0.703 causado por el halo decorativo antes de
activarse el libro. Se retiró ese elemento innecesario y la repetición volvió a CLS 0 sin cambiar
las animaciones del libro. No se elevaron presupuestos para aprobar la comprobación.

## Archivos y decisiones

| Archivo                                                | Cambio                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `src/features/catalog/components/PerfumeZone.astro`    | Imagen/nombre/precio estables, enlace nativo de resumen y región de lectura |
| `src/features/catalog/components/PerfumeReading.astro` | Contenido de detalle desde props públicas                                   |
| `src/features/catalog/styles/book-reading.css`         | Lectura interna responsive, notas, referencia menor y CTA                   |
| `src/motion/book-state.ts`                             | Fase `revealing` dentro del estado existente                                |
| `src/motion/book-scene.ts`                             | Revelado/repliegue, scroll interno cancelable, foco y nuevo giro            |
| `src/motion/book-turn.ts`                              | Secuencia de hoja opaca de dos caras                                        |
| `src/features/catalog/styles/catalog.css`              | Caras de giro, sombra, backface y retirada del halo                         |
| `src/features/catalog/components/CatalogBook.astro`    | Retirada del halo decorativo                                                |
| `src/pages/index.astro`                                | CSS de lectura acotado al libro                                             |
| `tests/e2e/book-reading.spec.ts`                       | Seis lecturas, mismo DOM, consulta, regreso, scroll interrumpido y acceso   |

AGENTS, README, contratos/guía de contenido, guía de motion y validación se actualizaron. El
dominio, dataset, precios y contactos no cambiaron. Los originales aprobados conservan sus hashes.

## Verificación de la entrega

| Comprobación         | Resultado                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Astro/TypeScript     | 68 archivos, 0 errores/advertencias                                                      |
| ESLint y Prettier    | Correctos                                                                                |
| Unitarios            | 78 pruebas correctas, 9 archivos                                                         |
| Chromium             | 66 pruebas correctas en escritorio y móvil; ejecución final 42.0s                        |
| Datos y DOM          | Seis detalles sin otra solicitud; mismos nodos de imagen, título y precio                |
| Acceso               | axe, teclado, foco, región de lectura, Escape, historial y recarga correctos             |
| Responsive           | Lectura revisada a 1440×900, 390×844 y 320×640; libro también probado a 768×900          |
| Movimiento           | 48 cuadros, ocho contactos, dos vídeos y muestreo rAF separado de la grabación           |
| Build                | 8 páginas estáticas y robots                                                             |
| Tamaños              | JS emitido gzip 119736bytes; CSS gzip 7475bytes; HTML máximo 33607bytes                  |
| Integridad           | SHA256 del logo y HTML v3 aprobados conservados                                          |
| Lighthouse móvil     | Rendimiento 100, accesibilidad 100, buenas prácticas 100; SEO 66 por noindex intencional |
| Laboratorio de carga | LCP 1355ms, CLS 0 y TBT 0ms; presupuestos cumplidos                                      |

Lighthouse mide carga con placeholders, no INP real ni FPS de animación. No se probaron Safari,
Firefox, lector de pantalla ni hardware móvil físico. No hubo publicación ni mensajes enviados.

Artefactos locales ignorados: `reports/book-subphase-d/aromafia-book-detail.webm`, capturas de
detalle en `detail-ui/`, secuencias en `motion/`, `playwright-report/` y `reports/lighthouse.*`.
La siguiente subfase es **E: formulario de datos y enlace de WhatsApp con mensaje personalizado**.
