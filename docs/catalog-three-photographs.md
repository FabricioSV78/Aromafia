# Catálogo — tres fotografías, inspiración visible y precio de referencia

**3 de noviembre de 2026.** El propietario pidió recuperar la zona del perfume de inspiración,
usar tres imágenes distintas por producto siguiendo los archivos de la carpeta Mandarin Sky,
compactar los textos de la vista general y mostrar la comparación de precio tachada. Esta revisión
conserva la plantilla Khamrah Qahwa y la navegación inmersiva existente; no publica el sitio ni
incorpora otras funciones.

## Tres roles, tres imágenes

Cada uno de los seis perfumes tiene una fotografía general, otra independiente de detalle y una
tercera del perfume de referencia. Los roles del producto vendido continúan en `generalImage` y
`detailImage`; la referencia ocupa `inspiredBy.image`, junto a su marca, nombre, relación y fuentes.
No se crea una galería ambigua ni se incrusta el dupe en la fotografía del producto vendido.

Para **Odyssey Mandarin Sky**, el usuario aportó tres archivos de 1086 × 1448 px:

- `public/images/perfumes/Mandarin Sky/1.png`: frasco solo para vista general.
- `2.png`: frasco con caja para el detalle.
- `3.png`: Scandal Pour Homme para la columna de comparación.

Se conservan intactos y se generan WebP de calidad 96 sin recorte, recoloración, reconstrucción o
ampliación artificial. Las escenas conservan su fondo crema original. No se presume un origen
fotográfico o generativo no documentado para archivos aportados. Tratamiento, dimensiones y hashes
en [mandarin-supplied-images.json](mandarin-supplied-images.json).

Los otros cinco perfumes tienen nuevas fotografías reales de **frasco con su caja original** para
el detalle, distintas de la imagen general. Fuentes y derivados están documentados en
[perfume-box-photos.json](perfume-box-photos.json). Los originales viven en
`src/assets/perfumes/detail-boxes/`; las máscaras externas `masks-box-v1` recortan solamente el campo
exterior, mientras Qahwa conserva alfa nativo. El encuadre mantiene completos el envase y su caja.

Las cinco imágenes restantes de referencia proceden de fabricantes o un comercio identificado,
con originales intactos y variantes WebP responsive. Ultra Male y Le Beau Le Parfum conservan alfa;
Angels’ Share conserva su perfil de color. Fuentes, dimensiones y hashes están en
[inspiration-image-derivatives.json](inspiration-image-derivatives.json). Las imágenes no incluyen
precios, notas, envíos o controles añadidos. No se generan frascos ni etiquetas.

## Columna de referencia recuperada

`InspiredBySection` vuelve a ocupar la parte superior derecha del detalle. Muestra una imagen menor
que el producto principal, marca y nombre de referencia, con la expresión «Alternativa olfativa a».
Una nota explica que la similitud es orientativa y que el producto de referencia no está incluido
en la compra ni asociado a la marca. Presentación, concentración, ocasión y Comprar conservan su
columna complementaria.

| Perfume vendido              | Referencia visual y olfativa                            |
| ---------------------------- | ------------------------------------------------------- |
| 9 pm — Afnan                 | Ultra Male — Jean Paul Gaultier                         |
| Hawas Ice — Rasasi           | Invictus Aqua — Rabanne, sin atribuir un año de edición |
| Odyssey Mandarin Sky — Armaf | Scandal Pour Homme — Jean Paul Gaultier                 |
| Khamrah Qahwa — Lattafa      | Angels’ Share — Kilian Paris                            |
| Hawas Malibu — Rasasi        | Le Beau Le Parfum — Jean Paul Gaultier                  |
| Zakat Royale Opal            | Angels’ Share — Kilian Paris                            |

Los seis registros usan `relation: 'similar_to'`: las evidencias son comparaciones comerciales,
no declaraciones de inspiración oficial o colaboración del fabricante. La investigación y sus
límites están en [inspiration-research.md](inspiration-research.md); Mandarin añade las fuentes
La Belle e Imperian y la imagen del propietario. Un enlace de comparación permanece separado de
las fuentes técnicas y de precio. No se publican porcentajes de equivalencia ni una promesa de
que dos perfumes huelan exactamente igual.

## Vista general compacta

La reserva artificial de dos líneas en cada título y el margen automático del precio producían
huecos dentro de las filas. La composición ahora deja al nombre tomar su altura natural y reúne
marca, nombre, descripción, precio y Explorar en un bloque centrado junto a la imagen. El precio
sigue a la descripción con una separación pequeña, en lugar de caer al extremo inferior de la fila.

Se conservan dos perfumes por cara, marcos fotográficos uniformes y una escala interior editada
por silueta. El texto no se estira para igualar nombres de longitudes diferentes; el orden y la
separación son comunes. El encabezado compartido del detalle sigue admitiendo una o dos líneas.
En móvil se permite lectura vertical natural, con fuentes, compra y regreso accesibles.

## Precio tachado sin inventar un historial

Los precios propios de AROMAFIA mantienen sus importes confirmados. No se confirmó un historial
anterior, por lo que `regularPrice` permanece null y las propuestas privadas anteriores no se
convierten en hechos. La comparación documentada usa un campo distinto: `marketReference` contiene
importe, fuente y fecha de consulta de otro comercio para la presentación exacta.

La UI muestra «Ref.» y el importe tachado con `s`; un enlace visible «Referencia: [comercio]» y su
fecha identifican qué se está comparando. No se denomina «antes», no usa `del` como historial propio
ni afirma que AROMAFIA sea la opción más barata del mercado. Si se recibe un `regularPrice` propio
confirmado, ese valor tiene prioridad y se muestra mediante `del`.

| Perfume                     | Precio AROMAFIA | Referencia externa consultada el 3/11/2026          |
| --------------------------- | --------------- | --------------------------------------------------- |
| 9 pm 100 ml                 | S/150.00        | S/159.00 — Passim Perú                              |
| Hawas Ice 100 ml            | S/185.00        | S/189.00 — Passim Perú                              |
| Odyssey Mandarin Sky 100 ml | S/149.00        | S/155.90 — Renace                                   |
| Khamrah Qahwa 100 ml        | S/160.00        | S/169.00 — Sin Filtro                               |
| Hawas Malibu 100 ml         | S/189.00        | S/219.00 — Passim Perú                              |
| Zakat Royale Opal 80 ml     | S/115.00        | Sin referencia PEN verificable; se conserva ausente |

Fuentes y selección en [investigación de precios](catalog-reference-prices-2026-11-03.md). No se
convierte un precio USD ni se inventan portes/impuestos para completar Opal. Son observaciones de
comercios concretos, no un promedio ni un mínimo del mercado. El sitio estático requiere revisar
las referencias y reconstruirlo cuando cambien.

## Movimiento, arquitectura y peso del documento

`ProductHero` conserva un solo `img` dentro de `picture` para las dos vistas del perfume vendido.
El controlador prepara y decodifica la foto de detalle y su máscara antes de activar la nueva
fuente y su encuadre; mientras espera conserva la foto general. Cancela al regresar o desmontar,
mantiene el fallback si la descarga falla y permite reintentar al volver a abrir. La entrada de
opacidad de 100ms se omite bajo reduced motion. La tercera imagen es un elemento secundario
separado de la fotografía principal. Las cámaras, estados de página, portada, giro y retorno
continúan usando el libro real. No se reescriben las timelines ni se introduce otro motor.

La integración de las seis terceras imágenes, sus fuentes y cinco referencias comerciales elevó
el HTML inicial a 59 386 bytes. Antes de ajustar el presupuesto se extrajeron los encuadres repetidos
como CSS estático de build y se retiraron atributos de scope redundantes en componentes sin estilos
propios. El HTML de esa integración quedó en 52 864 bytes, con JS gzip 122 104 bytes y CSS gzip 11 343 bytes.
El presupuesto HTML pasa justificadamente de 50 a 56 KiB; los límites de JavaScript y CSS se
mantienen. La corrección posterior de carga fría y responsive deja el build final de las 13:45:44 en
53 115 bytes de HTML, 122 352 bytes de JS gzip y 11 449 bytes de CSS gzip, dentro de esos límites.

La composición del CSS se prepara en `services/photo-presentation.server.ts` y se sirve como recurso
estático; el navegador no importa `data/`, repositorios ni propuestas privadas. Se conservan la
validación de campos públicos, el formulario compacto y el borrador de WhatsApp sin persistencia
de datos personales o envío automático.

## Archivos principales

| Archivo o recurso                                                              | Responsabilidad                                                 |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `data/product-images.ts`                                                       | Fotografías general y detalle con encuadres independientes      |
| `data/product-inspirations.ts`                                                 | Tercera fotografía, relación olfativa y fuentes por perfume     |
| `data/market-reference-prices.ts`                                              | Importes externos documentados, fuente y fecha                  |
| `domain/product.ts`, `domain/catalog-validation.ts`                            | Contratos y validación de roles, imágenes y precio externo      |
| `components/ProductHero.astro`, `styles/product-hero.css`                      | Un único img para el producto y escenas completas o aisladas    |
| `components/InspiredBySection.astro`                                           | Referencia menor y explicación independiente                    |
| `components/ProductPrice.astro`, `components/PerfumeReading.astro`             | Tachado con semántica diferenciada y fuente/fecha visibles      |
| `styles/catalog-reference.css`, `styles/editorial-reading.css`                 | Textos compactos y columna de referencia dentro del mismo papel |
| `services/photo-presentation.server.ts`                                        | Encuadres generados en build como CSS estático                  |
| `config/performance-budgets.json`                                              | Presupuesto HTML revisado tras investigar el contenido añadido  |
| `docs/*images.json`, `docs/perfume-box-photos.json`, `docs/inspiration-*.json` | Procedencia, tratamiento, dimensiones y hashes de imágenes      |

Las rutas de implementación de componentes, estilos, servicios, datos y dominio pertenecen a
`src/features/catalog/`. `config/` y `docs/` parten de la raíz. No se añadieron dependencias, backend,
recursos de publicación ni servicios externos conectados.

## Verificación ejecutada

La [auditoría visual y móvil](mobile-visual-audit.md) amplía esta revisión a las ocho resoluciones
solicitadas y los seis perfumes. Se ejecutaron 48 detalles y 156 capturas antes de corregir y otras
48 vistas y 156 capturas después, sin errores de página ni desbordamiento horizontal. El ajuste
permite lectura vertical en móviles cortos, descripciones completas y mayor libro en tablet, sin
cambiar la plantilla de detalle ni la navegación. Evidencias anteriores de integración en
`reports/three-photos/`; comparación actual en `reports/visual-mobile-audit/comparison.html`.

| Comprobación                                     | Resultado de esta revisión                                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Tipos                                            | 100 archivos, cero errores/advertencias/hints; TypeScript correcto                                               |
| Lint                                             | ESLint correcto                                                                                                  |
| Unitarios                                        | 111/111 en 15 archivos                                                                                           |
| Navegador dirigido: catálogo y ocho resoluciones | 40/40 correctos                                                                                                  |
| Fotografía en frío                               | 10/10 correctos: espera de foto/máscara, error/reintento, retorno y desmontaje                                   |
| Gesto táctil CDP                                 | 1/1 correcto a 320, 390 y 768px; un caso de escritorio omitido intencionalmente                                  |
| Suite E2E completa                               | 183 correctos y tres omisiones intencionales de 186 casos, en 3.9 minutos                                        |
| Píxeles durante transiciones                     | 236 muestras, doce con clones visibles; cero fondos blancos detectados                                           |
| Build y presupuesto                              | HTML 53115 bytes; JS gzip 122352 bytes; CSS gzip 11449 bytes; dentro de límites                                  |
| Formato e integridad                             | Prettier global correcto; logo y HTML v3 conservan sus hashes aprobados                                          |
| Lighthouse móvil                                 | Rendimiento 100, accesibilidad 100, buenas prácticas 100 y SEO 66 con noindex; LCP 1504.329ms, CLS 0 y TBT 0ms   |
| Movimiento pareado                               | 17 acciones por perfil; p95 posterior 16.70ms en CPU 1×/4×; un intervalo >50ms en 4×; sin garantía de FPS físico |

Las pruebas a 320px verifican también el inicio legible del detalle después de desplazar el
catálogo y el regreso al scroll original, tanto con animación como bajo reduced motion. La
galería actual contiene 72 pares y cuatro comparativas PNG; su tratamiento de captura se explica
en la auditoría. [Validación](validation.md) conserva las ejecuciones anteriores como historia,
sin convertir sus cifras en resultados del nuevo build.

La auditoría de movimiento registra cero errores de página y cero clones residuales en las
acciones medidas, listeners constantes y un incremento de heap después de GC; no acredita
ausencia de fugas ni 60 FPS en un teléfono real. Las diferencias entre la entrada de ratón de
la línea base y los taps posteriores, y la comprobación táctil adicional, se distinguen en
[auditoría móvil](mobile-visual-audit.md). Los informes Lighthouse del build final están en
`reports/visual-mobile-audit/performance/`.

Las pruebas comprueban que los seis productos tienen tres imágenes diferentes, la referencia
es menor y no compite con el perfume vendido, el detalle usa el frasco con su caja, los importes
externos identifican fuente/fecha y Opal no recibe una cifra inventada. Se mantienen como requisitos
marco, foco, historial, compra, reduced motion, transiciones sin parches blancos y alternativas sin JS.

La emulación de Chromium no acredita Safari/Firefox, teléfonos físicos, lectores de pantalla ni
FPS/INP de campo. Se conserva noindex y el sitio permanece local. Esta revisión termina con la
corrección visual y sus comprobaciones, sin transacciones ni mensajes reales enviados.
