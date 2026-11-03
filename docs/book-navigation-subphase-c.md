# Cámara del libro — entrega de subfase C

**2 de noviembre de 2026.** Se corrigió la apertura/cierre y se amplió el libro según la revisión
del usuario. Después se implementó únicamente la siguiente subfase, C: acercamiento y regreso
espacial sobre el perfume real. D integrará el contenido ampliado dentro de esa zona; E añadirá
el formulario de WhatsApp. No se adelantaron esas subfases.

## Corrección de portada y tamaño

La nota del libro cerrado y los controles abiertos reservaban alturas diferentes; incluso las
flechas añadían 2.55px mediante line-height. Ahora ambos estados reservan48px y la geometría de
la escena permanece idéntica al abrir/cerrar en escritorio y móvil. El nuevo test compara sus
coordenadas y dimensiones con tolerancia1px.

La portada, el canto y las páginas tienen una única secuencia coordinada de1.08s. Se retiró el
reverso decorativo que atravesaba visualmente nombres/precios; no se desvanece el padre preserve-3d.
Las páginas conservan papel opaco, y su contenido se revela cuando la escala ya está asentada,
evitando texto aplastado o el canto visible a través de texto semitransparente. Los estados CSS
finales coinciden con la animación y permiten revertir su contexto sin saltar a otra geometría.

El libro admite hasta1180×680 en lugar de1040×590, con más superficie útil gracias a menores
espacios de cabecera/escena. El máximo no obliga a desbordar pantallas pequeñas: se adapta a la
altura disponible y mantiene los controles visibles. Continúan dos perfumes por cara y cuatro
por apertura de escritorio, con una cara y dos perfumes en móvil.

## Acercamiento y regreso

«Explorar» transforma el contenedor `data-book-camera`, que rodea la escena real del libro.
El producto conserva su nodo, imagen, texto, posición de origen y página. No hay clon de producto,
modal, popup, fragmento solicitado ni pantalla sustituta. Solo existen clones decorativos durante
el giro de una hoja, como antes.

La cámara aplica escala uniforme y traslación desde el rectángulo de la zona seleccionada. La
medición neutral agrupa las lecturas una vez, sin consultar layout por frame. El encuadre respeta
los límites de la superficie visible y mantiene nombre/precio dentro de ella. En móvil el zoom
es más suave porque la zona ya ocupa casi todo el ancho: se prioriza legibilidad y continuidad.

Ida y regreso usan el mismo modelo geométrico, duración1.05s y curva simétrica `power3.inOut`.
«Volver al libro», Escape y Atrás regresan al mismo spread y al enlace seleccionado. El giro queda
deshabilitado durante el enfoque. Un clic repetido no crea otra cámara. La inclinación por puntero
se retiró para conservar rectángulos fiables y evitar deformación adicional del texto.

El estado único incorpora `focusing`, `focused` y `returning`. Los recursos de GSAP tienen contexto
por acción y token de cancelación. Cambios de ancho o movimiento reducido asientan/reencuadran el
estado seleccionado. El desmontaje limpia listeners, callbacks, estilos y recursos propios.
No se mata ninguna animación global.

`#libro/N/perfume/slug` restaura el enfoque al recargar y corrige una cara incompatible. Las fichas
estáticas retornan a esa URL. «Ver ficha completa» y clic modificado conservan la alternativa nativa
durante C; D incorporará sus detalles al propio libro. SinJS se conserva el catálogo en flujo y
sus enlaces. Reduced motion mantiene enfoque y regreso sin interpolar ni descargar GSAP.

## Archivos principales

| Archivo                                               | Responsabilidad                                          |
| ----------------------------------------------------- | -------------------------------------------------------- |
| `src/motion/book-cover.ts`                            | Secuencia coordinada de apertura y cierre                |
| `src/motion/book-camera.ts`                           | Geometría pura y límites de escala/traslación            |
| `src/motion/book-state.ts`                            | Fases de enfoque dentro del estado existente             |
| `src/motion/book-scene.ts`                            | Cámara, retorno, historial, foco, cancelaciones y resize |
| `src/features/catalog/components/CatalogBook.astro`   | Contenedor real de cámara y controles de regreso         |
| `src/features/catalog/components/PerfumeZone.astro`   | Acción Explorar con enlace nativo conservado             |
| `src/features/catalog/styles/catalog.css`             | Portada corregida, reserva estable y libro mayor         |
| `src/features/catalog/styles/book-camera.css`         | Encuadre, estados seleccionados y controles legibles     |
| `src/pages/index.astro`                               | Composición y CSS de cámara                              |
| `src/pages/perfumes/[slug].astro`                     | Retorno al perfume enfocado                              |
| `tests/unit/book-camera.test.ts`                      | Cuatro posiciones, móvil, límites y entradas inválidas   |
| `tests/e2e/book-camera.spec.ts`                       | Continuidad DOM, ida/regreso, historial y acceso         |
| `tests/e2e/catalog.spec.ts`, `product-detail.spec.ts` | Regresiones de portada/tamaño y rutas de C               |

AGENTS, README, guía de catálogo/contenido/motion y validación reflejan el estado actual. Dominio,
dataset, precios, contactos y originales siguen intactos. No se añadieron dependencias ni servicios.

## Verificación

| Comprobación         | Resultado                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| Astro/TypeScript     | 65 archivos, 0 errores/advertencias                                                                      |
| ESLint y Prettier    | Correctos                                                                                                |
| Unitarios            | 78 pruebas correctas, 9 archivos                                                                         |
| Chromium             | 56 pruebas correctas, escritorio y móvil; ejecución final33.3s                                           |
| Accesibilidad        | axe sin violaciones en portada, libro, enfoque y fichas directas probadas                                |
| Cámara               | Mismo nodo real, cuatro posiciones de escritorio, regreso al bbox original≤2px, resize y clics repetidos |
| Navegación           | Recarga, Atrás/Adelante, Escape, foco, inert, gesto táctil y enlaces modificados                         |
| Responsive           | 320×640,390×844,768×900 y1440×900, sin overflow horizontal ni scroll de documento en el libro            |
| Alternativas         | SinJS, reduced motion inicial y activado durante el giro/enfoque                                         |
| Build                | 8 páginas estáticas y robots                                                                             |
| Presupuesto          | JS emitido gzip119274bytes; CSS gzip6837bytes; HTML máximo20284bytes                                     |
| Originales           | Ambos SHA256 conservados                                                                                 |
| Lighthouse móvil     | Rendimiento100, accesibilidad100, buenas prácticas100, SEO66 por noindex intencional                     |
| Laboratorio de carga | LCP1357ms, CLS0, TBT0ms; presupuestos cumplidos                                                          |

La medición Lighthouse se hizo sobre el build integrado; el último ajuste de line-height de las
flechas añade1byte al CSS comprimido y no cambia la portada inicial. Se verificaron después el
build, tamaño, geometría y navegador. La cifra de carga corresponde a los placeholders actuales.
No prueba FPS de animación, INP real ni compatibilidad con Safari/Firefox o hardware móvil físico.

Artefactos locales ignorados: `reports/book-subphase-c/aromafia-camera.webm`, capturas de portada,
apertura, enfoque de escritorio/móvil y `reports/book-cover-fix/` con cuadros intermedios revisados.
Informes automatizados: `playwright-report/` y `reports/lighthouse.html`/`.json`.

C queda lista para revisión. El siguiente paso es **D: detalle inmersivo dentro de la zona ampliada**.
Fotografías, marcas, notas, referencias y precios anteriores desconocidos conservan sus pendientes;
no se completaron por inferencia ni se enviaron mensajes a WhatsApp.
