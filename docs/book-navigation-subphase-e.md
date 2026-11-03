# Lectura de una sola vista y consulta — subfase E

**2 de noviembre de 2026.** El usuario aprobó continuar con E después de dos ajustes: ampliar e
integrar el logo de ambas tapas y mostrar la información del perfume en una sola vista al acercarse.
Esta entrega mantiene el libro, sus caras y el detalle sobre el DOM original. No se implementa F
ni se publica el sitio; corresponde revisión visual al terminar E.

## Marca integrada en el libro

`BrandMark.astro` deriva el PNG oficial mediante `astro:assets` en WebP de 320, 640, 960 y 1254px,
calidad 94. Las variantes mayores cubren el nuevo tamaño visible y pantallas con mayor densidad,
sin ampliar por encima de la fuente de 1254×1254px. La imagen conserva dimensiones reservadas y
proporción cuadrada; la portada usa carga prioritaria y la contraportada carga diferida.

El arte ocupa el espacio disponible dentro de las tapas. El papel usa tonos crema del fondo del
logo y una máscara CSS desvanece solo el margen vacío exterior, sin blur sobre la ilustración,
recorte del personaje ni separación de capas. No se modifica el PNG ni el HTML v3 aprobados.
Los hashes originales siguen sujetos a `npm run check:assets`.

## Entrar en la zona del perfume

E reemplaza la columna con scroll interno de D por una composición completa del mismo papel.
La zona original seleccionada se extiende al área del libro y distribuye imagen, nombre, precio,
descripción, presentación, disponibilidad, notas de entrada/corazón/fondo, referencia secundaria,
consulta y mensajes comerciales. Se mantienen los nodos reales de la imagen, título y precio;
no hay modal, réplica del producto ni solicitud de otra ficha.

`book-layout.ts` obtiene rectángulos antes y después del cambio de composición y calcula las
compensaciones de cámara y elementos reales. GSAP interpola transformaciones durante 1.05s;
`revealing` revela el cuerpo durante 0.28s. El regreso retira el cuerpo en `retracting` durante
0.16s y recorre la geometría inversa en 1.05s. Las lecturas geométricas ocurren en lotes por acción,
sin layout o mediciones por frame. El resultado final tiene texto a su tamaño de lectura, sin
una escala permanente que obligue a desplazar una columna.

Se conserva el comportamiento de giro de D: hoja opaca de dos caras, fondo estable durante el
recorrido y actualización final al terminar. Apertura y cierre mantienen sus responsables y no
desvanecen el padre 3D. Las [evidencias de D](motion-visual-subphase-d.md) permanecen como registro
histórico; las comprobaciones actuales se anotan debajo.

La revisión de cuadros intermedios detectó que GSAP añadía `startAt` a un objeto de destino
compartido. Cada tween de `book-layout.ts` recibe ahora sus propias variables: cámara, imagen,
título y precio conservan trayectorias distintas dentro de la vista. El papel permanece visible
durante el regreso y oculta las otras zonas hasta recogerse; descripción y «Explorar» reaparecen
al terminar. La cancelación por reduced motion asienta también la URL.

En tamaños habituales la composición busca mostrar todo el contenido actual en una sola vista.
Para alturas extremas o zoom de texto se priorizan acceso y reflow. Fotografías, marcas, capacidades,
notas e inspiraciones siguen pendientes y explícitas; esta fase no inventa contenido para llenar
espacios ni cambia precios o disponibilidad.

## Formulario y borrador de WhatsApp

«Pedir por WhatsApp» abre el formulario en el papel, con el perfume preseleccionado. Incluye nombre,
teléfono, ciudad, perfume y comentario opcional. El cliente puede cambiar la selección y volver
al perfume conservando los campos mientras siga en la misma página.

La validación comprueba nombre de 2–80 caracteres, teléfono de 9–15 dígitos con prefijo opcional,
ciudad de 2–100 caracteres, selección dentro del catálogo público y comentario de hasta 500
caracteres. Los errores tienen asociación accesible y se enfoca el primero. Los controles tienen
un objetivo mínimo de 44px y mantienen texto de 16px en campos, también con poca altura.

«Continuar en WhatsApp» crea una URL codificada hacia `contact.whatsapp.href` con los datos y una
consulta para confirmar presentación, precio y disponibilidad. WhatsApp permite revisar y enviar
el mensaje. El sitio no lo envía automáticamente, no reserva productos, no confirma stock ni
autoriza pagos. Los valores no se guardan en una base de datos, cookies o almacenamiento persistente.
Se incluyen en el enlace a WhatsApp únicamente al continuar.

`#libro/N/perfume/slug/pedido` restaura la fase `ordering` con ese perfume, incluso tras recarga.
La URL no contiene los campos personales. «Volver al perfume», Escape e historial recuperan la
lectura. Las rutas `/perfumes/[slug]/` y el contacto directo siguen siendo alternativas nativas;
sin JavaScript el catálogo permanece en flujo.

Un arranque inline reserva la geometría cerrada antes del primer pintado, evitando que el pie
salte al cargar el controlador. El controlador cancela su temporizador; si falla su módulo,
se recupera el catálogo nativo en flujo tras tres segundos. Esta alternativa y el caso sin JS
se prueban por separado. En móvil el formulario recibe foco en su título para no abrir el teclado
antes de elegir un campo. Por debajo de 520px de altura se permite reflow del documento para
conservar acceso al contenido, sin recortarlo dentro del libro.

## Archivos principales

| Archivo o módulo                                       | Responsabilidad                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `src/components/brand/BrandMark.astro`                 | Derivados responsive del logo oficial                                |
| `src/features/catalog/styles/catalog.css`              | Mayor tamaño del arte y fondo integrado de tapas                     |
| `src/features/catalog/components/PerfumeZone.astro`    | Misma zona, piezas compartidas y cuerpo de lectura                   |
| `src/features/catalog/components/PerfumeReading.astro` | Detalle y acción para consultar                                      |
| `src/features/catalog/styles/book-reading.css`         | Composición completa del papel y espacio del formulario              |
| `src/features/catalog/components/CatalogBook.astro`    | Formulario dentro del volumen del libro                              |
| `src/features/orders/`                                 | Formulario Astro, validación independiente y mensaje/URL de WhatsApp |
| `src/motion/book-layout.ts`                            | Geometría de transición sobre elementos reales                       |
| `src/motion/book-state.ts`                             | Ruta `/pedido` y fases de consulta/retorno                           |
| `src/motion/book-scene.ts`                             | Estado, composición, cámara, foco, historial y limpieza              |
| `tests/unit/`                                          | Geometría, validación, codificación, rutas y ciclo de vida           |
| `tests/e2e/`                                           | Una vista, regreso, formulario, historial y accesibilidad            |

No se añadieron dependencias ni servicios. El dominio y dataset del catálogo conservan sus reglas;
el formulario recibe únicamente selección pública mínima. La documentación actualiza D como
antecedente sin sustituir sus resultados históricos por cifras de esta fase.
La auditoría npm revalidada conserva cero avisos en producción y13 moderados de tooling derivados
del aviso conocido de minimatch; no se forzaron actualizaciones. Detalles en validación.

## Comprobaciones de cierre

`npm run verify` completó la cadena sobre el build de entrega. Los resultados también se registran
en [validación](validation.md).

| Comprobación                                      | Resultado de E                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Astro/TypeScript                                  | 78 archivos; cero errores, advertencias o hints                                                        |
| ESLint y Prettier                                 | Correctos                                                                                              |
| Unitarios                                         | 105 pruebas, 13 archivos                                                                               |
| Chromium escritorio y móvil                       | 84 pruebas; aproximadamente un minuto                                                                  |
| Lectura y formulario de una sola vista            | Seis perfumes y formulario, incluso errores, a 1440×900, 390×844 y 320×640                             |
| Foco, Escape, historial, recarga y reduced motion | Correctos, incluyendo regreso pedido → perfume → libro y cancelación del retorno                       |
| Giro, apertura, cierre y cámara                   | 40 cuadros deterministas, ocho contactos, 19 capturas integradas y regresiones de geometría intermedia |
| Build y presupuestos                              | 8 páginas; JS gzip121662bytes, CSS gzip8938bytes, HTML máximo36418bytes; límites conservados           |
| Integridad de originales                          | Ambos SHA256 conservados                                                                               |
| Lighthouse móvil                                  | Rendimiento100, accesibilidad100, buenas prácticas100, SEO66 por noindex; LCP1357ms, CLS0, TBT0        |

El muestreo local `motion/raf-e.json` recoge ocho recorridos sin capturas ni vídeo durante la
medición: mediana16.7ms; p95 de hasta16.8ms en móvil emulado y33.3ms en escritorio, con máximos
aislados33.4ms. No se presenta como garantía de 60FPS ni como medición de un teléfono real.

Artefactos locales de trabajo en `reports/book-subphase-e/`: pruebas del logo en `brand/`, prototipos
de lectura en `detail-prototype/`, revisión inicial en `integrated/` y capturas corregidas en `final/`.
Los 40 cuadros controlados de `motion/deterministic/` y sus ocho contactos muestran 0/25/50/75/100%
de las timelines propias en escritorio/móvil. `motion/` conserva además un muestreo temporal con
40 capturas y ocho contactos; ese muestreo no determina FPS. Los informes Lighthouse de esta
entrega se conservan en `performance/`. Los prototipos y las capturas iniciales no sustituyen
las pruebas finales. Las pruebas de URL de WhatsApp interceptan su destino, sin
mensajes ni conversaciones reales. No se afirma compatibilidad Safari/Firefox, INP de campo ni
fluidez en hardware móvil físico a partir de Chromium local.

## Revisión posterior: navbar y limpieza del marco

El usuario pidió mover las redes al navbar, sustituyendo «Colección» y «Contacto». `SiteHeader.astro`
usa Instagram, Facebook y TikTok desde `contact.ts`, con iconos SVG monocromos y sus nombres
visibles. El CSS de `site-chrome.css` mantiene áreas de al menos44px y texto móvil de13px;
no se añaden bibliotecas ni peticiones a proveedores de iconos. «Hablemos» conserva WhatsApp.

`CatalogBook.astro` retira el eyebrow «La colección de AROMAFIA», el contador/copy superior y los
eslóganes laterales. Permanece «El libro del buen gusto.». `index.astro` elimina la fila inferior
de redes y «Perfumes originales. Actitud peruana.»; el pie conserva los mensajes de originalidad
y entregas. `catalog.css` elimina los selectores que pertenecían a esos elementos.

El contrato de contactos en `tests/e2e/catalog.spec.ts` comprueba ahora sus destinos en el navbar
y que el pie no repita enlaces. La cadena `npm run verify` pasa con105 unitarios y84 pruebas de
navegador; después del ajuste final de CSS pasaron otras18 pruebas de layout y accesibilidad.
Capturas y métricas a320×640,390×844,768×900 y1440×900 en `reports/navbar-cleanup/`: sin overflow,
iconos/nombres legibles y enlaces de44px. El build final conserva JS gzip121662bytes, reduce CSS
a8776bytes y HTML máximo a36100bytes. Las cifras Lighthouse anteriores pertenecen al cierre E;
no se repitió esa auditoría para esta limpieza. No se implementa F en esta revisión.

## Revisión posterior: conservar el tamaño del libro

La petición siguiente mantiene el ancho, alto y posición del libro al entrar en el detalle. Las
reglas de lectura ocultaban encabezado/pie con `display:none` y ampliaban la cámara al100% de
la nueva altura; ahora reservan sus filas con `visibility:hidden` y conservan la altura normal.
El formulario reserva también la fila de controles. Por debajo de520px de altura, el reflow se
aplica a todos los estados para que tampoco crezca el libro al cambiar de vista.

`book-reading.css` compacta únicamente espacios en el detalle estrecho y en el formulario; se
conservan todos los campos, el contenido, inputs de16px y controles de44px. Los errores de nombre,
teléfono y ciudad en `order-request.ts` usan mensajes breves con sus límites explícitos. No cambian
las reglas de validación. `book-reading.spec.ts` compara cámara, volumen y páginas antes/durante/
después de la lectura, para seis perfumes y tres tamaños; el muestreo intermedio exige una
variación máxima de2px durante entrada y regreso.

Las26 pruebas focales de lectura y pedidos pasan; tipos, lint y105 unitarios también. El build
conserva JS gzip121636bytes, CSS gzip8801bytes y HTML máximo36100bytes, dentro de presupuesto.
La revisión visual se conserva en `reports/book-fixed-size/`: diferencia máxima0px en cámara,
volumen y páginas entre catálogo, detalle, regreso y pedido, sin overflow en los tres tamaños.
La suite general de84 pruebas también pasa. No se repiten Lighthouse ni los muestreos de rendimiento de E.
