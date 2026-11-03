# Papel del detalle y extensión del fondo fotográfico

**Registro histórico de la extensión.** Los archivos públicos y el generador citados debajo fueron
sustituidos durante la [organización final de imágenes](perfume-asset-structure.md). El maestro
aprobado sigue intacto en `src/assets/perfumes/originals/mandarine/detail-master.png`; los nuevos
recursos se generan con `scripts/build-perfume-images.mjs` en su carpeta de perfume.

**3 de noviembre de 2026.** El propietario pidió que el detalle tenga el mismo fondo del libro
y que la fotografía de Mandarin Sky complete el marco sin franjas de otro tono, conservando
la proporción y el tamaño actuales del producto.

## Papel compartido

`catalog-reference.css` define `--book-page-surface` con el gradiente crema dorado ya aprobado.
Las caras del catálogo y `book-reading.css` consumen esa misma superficie, tanto al leer como al
regresar. Se retiraron `--editorial-paper` y el gradiente exclusivo de `editorial-reading.css`.
No se cambian columnas, márgenes, fuentes, cámara ni animaciones.

## Fotografía completa sin cambiar el producto

La foto original `public/images/perfumes/Mandarin Sky/2.png` mide 1086×1448. Su adaptación anterior
con `object-fit: contain` dejaba franjas CSS a ambos lados del marco cuadrado. El nuevo lienzo
mide 1448×1448: añade 181px de fondo por lado y conserva el original centrado, sin escalarlo.
Por ello el frasco y la caja mantienen exactamente la proporción y escala visual anteriores.

Se usó la herramienta integrada `image_gen` para extender el fondo. Su centro generado **no se
publica**: `scripts/extend-mandarin-background.mjs` vuelve a colocar encima la fotografía original.
Solo los márgenes vacíos laterales incorporan fondo generado; se igualan a la luz y sombra reales
del borde y se unen en una franja de 32px de fondo vacío. No se generan frascos, cajas, etiquetas
ni textos del producto. La sombra se difunde progresivamente hacia el extremo del fondo añadido
para evitar una línea horizontal rígida; el centro original queda intacto. El script verifica igualdad de todos los píxeles de la región central
que contiene ambos objetos antes de generar los WebP.

Recursos:

- Fuente intacta: `public/images/perfumes/Mandarin Sky/2.png`.
- Fondo de trabajo: `src/assets/perfumes/background-extensions/mandarine-ai-square-background-v1.png`.
- Composición maestra: `src/assets/perfumes/background-extensions/mandarine-detail-square-v2.png`.
- Derivados públicos: `public/images/perfumes/mandarine-supplied-detail-square-v2-{640,960,1448}.webp`.
- Formato: WebP calidad96, sin ampliación del original; perfiles conservados cuando existen.
- Fuente, hashes, tamaños y tratamiento: [manifiesto](mandarin-background-extension.json).

La vista general y la foto de referencia conservan sus archivos. El mismo nodo `img` del producto
continúa cambiando de source después de decodificar la foto y su máscara.

## Prompt de edición utilizado

Modo integrado, con `2.png` como imagen objetivo y fondo opaco:

> Edit target: the attached portrait photograph of Odyssey Mandarin Sky bottle and its orange/turquoise box. Extend ONLY the photographic studio background horizontally to make a SQUARE image, 1536x1536 if possible. The existing portrait should occupy exactly the central 75% of the square width, full height, without scaling its height, cropping, moving or distorting the perfume or box. Add 12.5% new background to each side. Continue the existing soft peach cream seamless studio backdrop, table, subtle grain, light and natural shadows across the added left and right areas with no visible vertical seam, no solid-color side bands, no repeated objects. Preserve original bottle, box, labels, colors and camera framing exactly. No new products, no text, no additional objects. Output a square photographic image, not a webpage/mockup/border. Critical: changes confined to extending the empty background at left/right; preserve original photo center.

El resultado integrado de 1254×1254 se usa únicamente como material de fondo; la composición
final de 1448×1448 recupera los píxeles originales del producto. No se afirma que una instrucción
de generación por sí sola garantice su identidad: la garantiza la recomposición y comparación.

## Comprobaciones

- Capturas e interacción de los seis perfumes a1440×900,1366×768,390×844 y320×568:24 vistas.
- Igualdad del fondo CSS calculado del papel y el detalle en las24 vistas.
- Comparación con las métricas de la auditoría anterior: dimensiones de marco fotográfico y
  título conservadas dentro de1px en todos los perfumes.
- Compra y regreso comprobados en las24 vistas, sin ampliar el libro ni crear otra imagen visible.
- Maestro: región central original idéntica píxel por píxel; originales de marca conservan hashes.
- Tipos:101 archivos sin errores, advertencias ni hints; ESLint y111 unitarios correctos.
- Suite completa:183 pruebas de navegador correctas y tres omisiones intencionales, en3.9minutos.
- Tras la última suavización del fondo añadido: reconstrucción,24 capturas y cuatro pruebas de
  transiciones fotográficas correctas en25.3segundos.
- Build: JS gzip122352 bytes, CSS gzip11413 bytes y HTML máximo53136 bytes; dentro de presupuestos.

Evidencia: `reports/detail-surface-fix/after/`, `geometry-comparison.json` y logs de comprobaciones.
Las capturas de antes se recuperan del recorrido final de la auditoría anterior; no se presentan
como nuevas capturas de un build antiguo. Las comparativas son
`comparison-1440.png` y `comparison-390.png` en ese mismo directorio.
La ejecución completa de navegador se registra en `e2e.log`; el pase posterior de fotografías,
en `final-photo-e2e.log`.
No se repiten métricas de Lighthouse/RAF anteriores como mediciones de este cambio de recursos.
