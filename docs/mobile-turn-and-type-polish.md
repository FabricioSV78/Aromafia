# Giro móvil, escala de precios y botón de portada

**3 de noviembre de 2026.** El propietario pidió un precio final algo menor en el catálogo,
un botón «Abrir libro» más estrecho en móvil y corregir la barra que aparecía en un borde al
pasar de página. La revisión conserva la navegación, el giro 3D, la composición editorial y
las fotografías preparadas por perfume.

## Barra exterior durante el giro

En escritorio, una hoja ocupa la mitad del libro y gira 180° hacia la otra mitad. En móvil
ocupa todo el ancho. Al superar 90°, el reverso del clon podía proyectarse fuera del papel,
dentro del margen del viewport. Ese fragmento quedaba visible como una barra hasta retirar
el clon al terminar. La misma geometría podía producirlo en el borde opuesto al regresar.

`catalog.css` aplica ahora `overflow: clip` a `.book-turn-layer` únicamente bajo el breakpoint
de escritorio. El recorte coincide con los límites del libro y conserva `preserve-3d`.
No se cambia la timeline ni se desvanecen los padres ni se sustituye el giro por una transición
plana. El canto fijo del libro sigue formando parte de la composición.

La comparación real de390px a832ms muestra la barra anterior en la franja izquierda x14–18,
y145–700: color medio RGB248/228/197 frente al entorno posterior RGB17/15/11. Las capturas
intermedias confirman que desaparece el fragmento exterior y permanece la hoja girando dentro
del marco.

## Precio del catálogo y portada

`catalog-reference.css` reduce solo `.perfume-zone:not(.is-reading) .product-price__current`:

| Perfil                    | Antes                            | Después                        |
| ------------------------- | -------------------------------- | ------------------------------ |
| Escritorio                | `clamp(1.8rem, 2.65vw, 2.65rem)` | `clamp(1.6rem, 2.3vw, 2.3rem)` |
| Escritorio de poca altura | 1.8rem                           | 1.6rem                         |
| Móvil habitual            | 1.65rem /26.4px                  | 1.45rem /23.2px                |
| Móvil corto               | 1.45rem /23.2px                  | 1.3rem /20.8px                 |

El precio del detalle mantiene su tamaño. Nombres, descripciones y controles conservan sus
límites de lectura; no se recortan textos para ganar espacio.

En el perfil móvil, `catalog.css` limita «Abrir libro» a11rem —176px— y lo centra. Antes ocupaba
aproximadamente246px a320px,316px a390px y584px en tablet768px. Mantiene una altura de48px y
el área táctil mínima; no se aplica la reducción horizontal al escritorio.

## Capturas y pruebas ejecutadas

- Antes y después: cinco tamaños,16 cuadros intermedios por tamaño —80 cuadros—, más portada
  y catálogo —10 capturas—:90 imágenes por recorrido.
- Recorrido posterior de los seis perfumes en1920×1080,1440×900,1366×768,768×1024,430×932,
  390×844,375×667 y320×568:48 detalles y156 capturas, sin errores de página ni overflow horizontal.
- Se observaron las composiciones de catálogo y detalle; las fotografías, notas, referencias y
  compra mantienen su orden y alineación. Las pantallas cortas conservan lectura vertical natural.
- Nueva regresión de píxeles `tests/e2e/mobile-turn-edge.spec.ts`: tres casos móviles correctos
  y tres omisiones intencionales del proyecto de escritorio, en15.3segundos.
- Cada caso recorre ida/vuelta y mide208,364,520,676,832,950 y1020ms:42 cuadros en total.
  Compara dos franjas de4px fuera del papel con una captura asentada de referencia. Se considera
  cambiado un píxel si algún canal difiere más de10; se admite como máximo un2% de píxeles
  cambiados. La referencia conserva el canto fijo, evitando confundirlo con una barra animada.
- La regresión comprueba además cámara estable, opacidad1, `preserve-3d`, variación real de la
  matriz de giro, fases ocupadas/asentadas, historial1→2→1, ausencia de clones residuales y el
  botón centrado de hasta177px con al menos44px de altura.
- Tipos:100 archivos sin errores, advertencias ni hints. ESLint,111 unitarios e integridad de
  originales correctos. Build: JS gzip122307 bytes, CSS gzip10006 bytes y HTML máximo53280 bytes.

La suite completa de192 casos terminó con **186 aprobados, seis omisiones intencionales, cero
resultados inesperados y cero flaky**, en428456.821ms —aproximadamente7.1minutos—. Usó un
worker, cero reintentos y parada tras el primer fallo. El runner terminó con código0 y los
procesos nativos de Chromium cerraron normalmente con código0.

No se repitió Lighthouse ni un perfil RAF para este ajuste de CSS. Sus métricas anteriores
corresponden a las revisiones identificadas en [validación](validation.md).

## Evidencias

Los artefactos están en `reports/mobile-polish/`:

- `before/` y `after/`: portada, catálogo y cuadros intermedios en los cinco tamaños.
- `visual/`: recorrido posterior de los seis perfumes y hojas de contacto de los ocho tamaños.
- [Avance a832ms](../reports/mobile-polish/comparison-390-next-832.png): barra izquierda,
  antes/después.
- [Regreso a676ms](../reports/mobile-polish/comparison-390-prev-676.png).
- [Portada a390px](../reports/mobile-polish/comparison-390-cover.png): botón más estrecho.
- [Catálogo a320px](../reports/mobile-polish/comparison-320-catalog.png): escala y alineación.
- [Revisión de los cuadros intermedios](../reports/mobile-polish/turn-review.html).
- `edge-e2e.log`, `final-e2e.log`, `final-e2e.json`, `final-e2e-exit.json`,
  `size-comparison.json` y logs de tipos, unitarios y presupuesto.

Las pruebas usan Chromium moderno por turnos y un worker. La inspección local emulada no
acredita Safari/iOS, Firefox, teléfonos físicos ni60FPS sostenidos. No se publica el sitio ni se
envían mensajes reales.
