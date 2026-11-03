# Mandarin como plantilla fotográfica del catálogo

**3 de noviembre de 2026.** El propietario fija `public/images/perfumes/mandarine/` como
referencia de fondo, luz y composición de los demás perfumes. La revisión anterior utilizaba
un estudio vacío más rosado; esta corrección prepara los fondos a partir de las fotografías
aprobadas de Mandarin y mantiene los encuadres y las fotografías auténticas.

## Preparación de los archivos

La skill `imagegen` se aplicó con la herramienta integrada, en modo edición. Se retiraron el
frasco, la caja y sus sombras de las referencias para obtener únicamente estudios vacíos:

| Archivo privado                                              | Referencia de entrada                                                     | Uso                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- | --------------------- |
| `src/assets/perfumes/studio/mandarin-general-background.png` | `mandarine/general.webp`                                                  | General e inspiración |
| `src/assets/perfumes/studio/mandarin-detail-background.png`  | `mandarine/detail.webp`, con `inspiration.webp` como referencia adicional | Detalle               |

Los prompts completos y las entradas quedan registrados en
[image-recipes.json](../src/assets/perfumes/image-recipes.json). La generación reconstruye
solo el espacio vacío del estudio; los frascos, cajas, etiquetas y reflejos internos proceden
de las fuentes fotográficas documentadas. No se recolorean los perfumes. Los estudios son
derivaciones visuales de las referencias, no copias de cada píxel del fondo original.

`scripts/build-perfume-images.mjs` compone las fotografías sobre el estudio correspondiente a
cada rol. Conserva los contornos privados, posiciones, proporciones y encuadres existentes.
La sombra de apoyo también queda horneada en el archivo; se corrigió la región de su filtro
SVG a `filterUnits="userSpaceOnUse"` con extensión del lienzo completo. La región implícita
anterior cortaba el desenfoque y podía producir una banda rectangular. Se modifica únicamente
la sombra exterior, sin alterar el producto.

Las salidas continúan siendo WebP opacos de calidad 94, con las mismas dimensiones y variantes
responsivas. Fondo y objeto forman una sola imagen terminada. Las referencias y sus SHA256
registran la procedencia de la generación; el proceso no necesita leer sus propias salidas
públicas como dependencias para reconstruir los archivos.

Se mantienen las seis carpetas públicas y sus tres roles: `general`, `detail` e `inspiration`.
Son 18 composiciones principales y 42 archivos, con **2076424 bytes** públicos. Se comprobaron
los siete archivos de Mandarin y conservaron exactamente sus SHA256. Se actualizaron las
35 variantes de los otros cinco perfumes. El manifiesto vigente de fuentes, fondos y salidas es
[perfume-assets.json](perfume-assets.json).

## Presentación en la web

El render existente utiliza la fotografía completa con su proporción nativa y `object-fit:
contain`. Los contenedores de imagen son transparentes: no añaden otro fondo, bordes, máscaras,
sombras o filtros. El zoom transforma el nodo real completo, con el fondo ya incorporado; no
estira una capa de fondo por separado. El cambio a detalle espera a que su fotografía esté
decodificada y conserva la general mientras carga.

La prueba `tests/e2e/editorial-reading.spec.ts` se refuerza para comprobar las proporciones
nativas y los estilos de la cadena de contenedores de las imágenes generales, de detalle y de
inspiración en los seis perfumes. La composición del libro y sus animaciones no requieren
cambios de CSS para esta corrección de archivos.

## Validación de esta revisión

Las evidencias de este cambio están en `reports/mandarin-background/`:

- `pipeline-result.json` confirma 42 archivos: 35 actualizados y los siete de Mandarin intactos.
- La [galería de las 18 imágenes](../reports/mandarin-background/gallery.html) y
  `asset-contact-sheet.png` permiten revisar el conjunto. Se observaron las 18 composiciones
  a resolución nativa, sin bandas rectangulares ni recortes del producto.
- `color-comparison.json` compara cuatro muestras exteriores de 5×5 píxeles de cada archivo
  con su plantilla de Mandarin. La diferencia media absoluta RGB bajó aproximadamente de
  12.7 a 4.3 en general, de 13.1 a 7.2 en detalle y de 8 a 5 en inspiración. Es una comprobación
  auxiliar de consistencia del estudio, no una medición absoluta de color o una recoloración.
- Tipos: 100 archivos sin errores, advertencias ni hints. ESLint, integridad de originales y
  111 unitarios en 15 archivos correctos. Build y presupuesto correctos: JS gzip122307 bytes,
  CSS gzip10006 bytes y HTML máximo53280 bytes.

La suite dirigida de 80 casos terminó con **77 aprobados, tres omisiones intencionales, cero
resultados inesperados y cero flaky**, en 204292.91ms —aproximadamente 3.4 minutos—. Incluye
`editorial-reading.spec.ts`, `cold-photo.spec.ts`, `photo-transitions.spec.ts` y
`mobile-turn-edge.spec.ts`: archivos completos, cambio de fotografía con carga retrasada,
fondos durante enfoque/regreso y giro sin barras exteriores. Se ejecutó con un worker, cero
reintentos y Chromium moderno. El runner y sus dos procesos nativos terminaron con código0.
Resultados en `e2e.json`, `e2e.log` y `e2e-exit.json` dentro de la carpeta de evidencias.

El recorrido visual posterior produjo **156 capturas y 48 detalles**, con interacción sobre
los seis perfumes en 1920×1080, 1440×900, 1366×768, 768×1024, 430×932, 390×844, 375×667 y
320×568. No hubo errores de página ni desbordamiento horizontal. Se observaron las hojas de
contacto de los ocho tamaños y las 18 fotografías nativas: sin fondos CSS añadidos, parches,
bandas rectangulares ni recortes del producto. El navegador aislado —PID29296— cerró con
código0; evidencia en `visual.log` y `visual-exit.json`.

`delivery.json` confirma que las 42 solicitudes HTTP devolvieron los WebP finales, con SHA256
idénticos al manifiesto. La validación corresponde a estos nuevos archivos, no a resultados
heredados de revisiones anteriores. Para comparar el resultado en la interfaz:

- [Vista general de escritorio, 1440px](../reports/mandarin-background/visual/1440-overview-1.png).
- [Vista general móvil, 390px](../reports/mandarin-background/visual/390-overview-1.png).
- [Hoja de contacto de escritorio](../reports/mandarin-background/visual/1440-contact-sheet.png).
- [Hoja de contacto móvil](../reports/mandarin-background/visual/390-contact-sheet.png).

No se repitieron Lighthouse ni perfiles de FPS para esta corrección de imágenes.

El alcance es local. No acredita teléfonos físicos, Safari/Firefox ni FPS de campo y no
autoriza publicación, servicios externos o envío de mensajes.
