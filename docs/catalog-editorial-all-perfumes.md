# Catálogo — detalle editorial en los seis perfumes

Registro de la ampliación editorial. La aceptación posterior del recorrido completo y sus ajustes
de acceso están en [subfase F](book-navigation-subphase-f.md).

**3 de noviembre de 2026.** La petición posterior del propietario autoriza extender el detalle de
Mandarin Sky a los seis perfumes, igualar las fotografías de la vista general al tamaño de 9PM y
mejorar claridad y color. Esta revisión sustituye el alcance exclusivo del
[piloto Mandarin](mandarin-editorial-pilot.md); conserva la dirección de papel crema dorado y
entorno oscuro cálido de [la vista general](catalog-reference-style.md).

## Alcance y composición

9PM, Hawas Ice, Odyssey Mandarin Sky, Khamrah Qahwa, Hawas Malibu y Zakat Royale Opal comparten
`data-editorial-detail` y la misma composición. En escritorio, el papel muestra la fotografía
grande a la izquierda, nombre/descripción/precio/notas en el centro y referencia/presentación/compra
a la derecha. Los servicios se integran en la base. El ajuste compacto de escritorio conserva
espacio para las notas largas de Qahwa y Opal, sin solapar servicios, fuentes o consulta.

Las superficies fotográficas de la vista general tienen el mismo ancho y alto que 9PM, sin
deformar los frascos ni sus etiquetas. La división del título de Mandarin en dos partes continúa
específica de ese nombre; los otros cinco conservan sus nombres completos. El título visible del
catálogo sigue retirado y se mantiene el h 1 semántico no visible.

En móvil y tablet estrecha, los seis detalles permiten lectura vertical natural: nombre,
fotografía, precio, descripción, presentación, notas, referencia, fuentes, servicios y compra.
El retorno permanece accesible y recupera el scroll y el foco del contexto de entrada. El catálogo
general conserva su navegación por caras y su presentación en una vista.

## Fotografías y color

Los cinco perfumes distintos de Opal usan derivados `clarity-v2` WebP calidad 96, incluyendo el
ancho nativo de cada fuente. Se conservan perfiles ICC y transparencia cuando existen. El
[manifest de claridad](perfume-clarity-derivatives.json) documenta fuentes, tamaños y hashes; las
versiones anteriores se conservan. La presentación CSS usa mezcla normal y un ajuste moderado de
contraste 1.04/saturación 1.06; los archivos derivados no reciben retoque editorial ni detalle inventado.

Royale Opal sustituye su anterior referencia de 432 × 400 px por una fotografía real de Redbag de
2992 × 2992 px. La imagen muestra el frasco con la corona y sus letras originales; la fotografía
complementaria del proveedor permite contrastar 80 ml en la caja. La nueva presentación muestra el
frasco sin incorporar la caja de la fuente anterior. La máscara v 3 recorta solamente el campo
exterior y el punto de apoyo conserva la corona completa.

Los derivados Opal `clarity-v3` ofrecen 320/640/960/1440/1920/2992 px, calidad 96 y metadatos ICC de la
fuente, sin ampliación ni reconstrucción de letras. El
[manifest de alta resolución](royale-opal-hires-derivatives.json) registra la procedencia Redbag,
la corroboración de capacidad y los hashes. Este manifest sustituye para Opal el límite de 432 px
descrito en la iteración `clarity-v2`.

Las máscaras son SVG alfa externos reutilizables por las hojas y sus clones. Qahwa mantiene su
transparencia nativa. No se generan frascos, etiquetas, cajas ni comparaciones. Los originales de
marca y las fotografías fuente se conservan.

## Navegación, datos y accesibilidad

`book-layout.ts` y `book-scene.ts` siguen reorganizando la zona real del perfume. Imagen, título y
precio conservan identidad DOM; el estado final queda a escala 1:1 y el marco de escritorio no
crece al abrir el detalle. Las mediciones se agrupan por acción y la altura móvil se restaura al
volver. Se mantienen enlaces profundos, historial, Escape, foco, interrupciones y reduced motion.

El detalle sigue dentro del libro. La compra conserva el único diálogo compacto autorizado,
de hasta 480 px, con alternativa nativa de WhatsApp sin JavaScript. Sin JS o al fallar el módulo,
los seis detalles quedan legibles en el catálogo. Los enlaces de fuentes tienen al menos 44 px
de área clicable y separación vertical; axe WCAG 2.2 AA pasa también con las dos fuentes de Opal.

Marcas, notas, precios y capacidades no cambian: cinco perfumes de 100 ml y Royale Opal de 80 ml.
Mandarin conserva el slug `mandarine`. Los precios anteriores y referencias olfativas siguen sin
confirmar; se muestra el pendiente de referencia y no aparecen equivalencias ni cifras tachadas.
La disponibilidad no se expone y los SKU continúan pendientes. La investigación de proveedores
no representa stock local ni una transacción.

## Archivos principales

| Archivo o recurso                                                                                               | Responsabilidad                                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/features/catalog/components/PerfumeZone.astro` y `PerfumeReading.astro`                                    | Activación editorial común en los seis productos y contenido dentro del papel                                    |
| `src/features/catalog/styles/editorial-reading.css`                                                             | Composición compartida; sustituye el nombre anterior `mandarin-editorial.css`, con ajuste compacto y flujo móvil |
| `src/features/catalog/styles/catalog-reference.css`                                                             | Tamaño común de fotografía en la vista general, sin el borde de layout que alteraba una de las celdas            |
| `src/features/catalog/components/ProductHero.astro` y `styles/product-hero.css`                                 | Superficie cuadrada, encuadre, máscaras externas y tratamiento de color                                          |
| `src/features/catalog/domain/product.ts` y `data/product-images.ts`                                             | Contrato público `maskSrc`, rutas responsive, dimensiones y puntos de apoyo                                      |
| `public/images/perfumes/masks-v2/` y `masks-v3/royale-opal.svg`                                                 | Recortes externos; sustituyen los trazados globales incrustados de `PhotoOutlines`                               |
| `FragranceNotes.astro`, `src/components/shared/TrustStrip.astro` y `public/images/icons/catalog-symbols-v1.svg` | Iconos reutilizados mediante un sprite externo para contener el HTML                                             |
| `src/features/catalog/components/ProductSources.astro`                                                          | Enlaces de fuentes con áreas clicables de 44 px y separación suficiente                                          |
| `src/motion/book-scene.ts`                                                                                      | Indicador `data-editorial-detail`, lectura móvil, entrada y limpieza comunes                                     |
| `public/images/perfumes/*-clarity-v2-*.webp` y `royale-opal-clarity-v3-*.webp`                                  | Derivados fotográficos responsive de calidad 96                                                                  |
| `src/assets/perfumes/royale-opal-redbag-original-2992.jpg`                                                      | Nueva fuente Opal preservada sin modificar                                                                       |
| `tests/e2e/editorial-reading.spec.ts`                                                                           | Renombre de la prueba del piloto y cobertura parametrizada de los seis detalles                                  |
| `tests/e2e/book-reading.spec.ts` y `catalog-reading.spec.ts`                                                    | Lectura, marco, retorno y alternativa sin JS compartidos                                                         |

La externalización de máscaras y símbolos evita repetir trazados por cada perfume. Se retiró la
dependencia de `PhotoOutlines` en la composición pública y no se añadieron motores, paquetes ni
servicios. Los límites de `config/performance-budgets.json` permanecen sin elevarse.

## Verificación final

Tipos: 87 archivos sin errores; ESLint correcto;106 pruebas unitarias en 14 archivos. La suite de
navegador pasa 146/146 casos en 2.9 min, con Chromium de escritorio y emulación móvil. Comprueba los
seis detalles a 1440 × 900, 1280 × 720, 390 × 844 y 320 × 640, superficies fotográficas iguales dentro de 1 px,
misma identidad DOM, escala final nativa, marco de escritorio, retorno, scroll móvil, compra y
alternativas sin JS. Se conservan las pruebas adicionales de tablet y geometría del catálogo.

Las pruebas fotográficas conservan sus límites y registran 241 muestras: 120 de enfoque/regreso en
escritorio, 85 en móvil, 24 de portada/hojas en escritorio y 12 en móvil. Incluyen 12 muestras de clones
visibles; todos los giros terminan sin clones residuales y no se detectan fondos blancos. Los
reflejos reales se distinguen del fondo mediante varios parches, sin exigir borrar sus píxeles.

Build: JS gzip 121908 bytes, CSS gzip 9920 bytes y HTML máximo 50496 bytes, dentro de los límites
existentes. Lighthouse móvil: rendimiento 100, accesibilidad 100, buenas prácticas 100 y SEO 66 por
noindex intencional; LCP 1504 ms, CLS 0 y TBT 0 ms. Evidencia visual en `reports/all-editorial/`,
Lighthouse en `reports/all-editorial/performance/` y capturas/muestras en los artefactos Playwright.
El registro vigente está en [validación](validation.md).

## Límites y siguiente revisión

Las pruebas locales cubren Chromium y sus emulaciones; no acreditan Safari/Firefox, FPS en móviles
físicos ni INP de campo. WebP 96 conserva compresión con pérdida y no inventa resolución por encima
de las fuentes. La procedencia pública de las fotos no acredita por sí sola una licencia comercial
independiente. Las fuentes y sus manifests permanecen disponibles para revisar esos límites.

El sitio conserva noindex y no se ha desplegado. No hubo pagos, conexión de servicios ni mensajes
reales de WhatsApp. Esta entrega se detiene para revisión visual del propietario; no incorpora
una subfase F adicional.
