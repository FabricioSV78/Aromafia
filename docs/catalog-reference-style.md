# Vista general — color, luz y composición de la referencia

Registro de la dirección visual aprobada. La revisión posterior iguala los seis cuadros de imagen,
extiende el detalle editorial y sustituye las máscaras inline por SVG externos. También reemplaza
la antigua fuente de 432 px de Royale Opal por una fotografía real de 2992 px:
[estado vigente y validación](catalog-editorial-all-perfumes.md). Los resultados y detalles técnicos
de esta página corresponden a la iteración anterior.

**3 de noviembre de 2026.** El propietario pidió acercar la vista general al nuevo ejemplo:
papel luminoso cálido, entorno oscuro marrón/negro, fotografías protagonistas, nombres fuertes
y precios con tipografía editorial. La petición conserva el catálogo dinámico y sus controles.

## Decisiones visuales

- Papel `#ffebcd`, variaciones `#f9e1bf`/`#ffedcf`/`#fae5c5`, tinta `#19130d`, oro `#e2b665`.
- Entorno `#12100c` con iluminación ambiental sutil. Navegación y servicios siguen ese tono.
- Times New Roman del sistema para títulos y precios, con peso700 en la vista general. Cuerpo
  sans serif existente. No se descargan fuentes ni se añaden dependencias.
- Apertura de82.5vw, máximo1360px y700px de altura disponible en escritorio; dos perfumes por
  cara, cuatro por apertura. A1650×954, las fotos miden aproximadamente283–289px y los títulos40.8px.
- Campo fotográfico plano con luz crema y sombra de contacto. Reemplaza la base circular de la
  iteración anterior y permite encuadrar los frascos mucho más grandes, cerca del borde inferior.
- Se conserva la retirada anterior del título visible. No se copian nombres, precios, disponibilidad
  ni notas desde el anuncio: permanecen los datos editables confirmados del catálogo.

La nueva dirección se encuentra en `catalog-reference.css`, acotada a la experiencia del libro,
y `product-hero.css`. La adaptación compacta conserva la lectura a1280×720 y a320px. La barra de
apertura, navegación y retorno reserva48px en todos los estados para impedir que el libro cambie
de tamaño al abrir o enfocar. Se ajustó el espacio del encabezado de Mandarin en escritorio bajo;
sus notas conservan tamaño y quedan dentro del papel.

## Recuperación del color de los frascos

La mezcla multiplicada de la iteración anterior teñía también el frasco y sus reflejos. Ahora
`product-silhouettes.ts` contiene trazados de recorte normalizados de las fotografías reales.
`PhotoOutlines.astro` genera definiciones SVG permanentes fuera de las hojas y del árbol3D.
`ProductHero` aplica el recorte al `<img>` original con mezcla normal y sin corrección de exposición.
Se conservan los píxeles, letras, reflejos, tapones y colores del producto fotografiado.

Estos SVG son máscaras de visibilidad de la fotografía; no reemplazan los frascos por ilustraciones.
Se trazaron desde las fuentes existentes, verificando bordes con inspección visual y lecturas de
píxeles, sin reescribir archivos raster. Mandarin conserva el hueco del asa mediante una trayectoria
compuesta `evenodd`. Royale Opal une dos trayectorias independientes para frasco/corona y caja;
su superposición permanece visible. Qahwa conserva el alfa de su PNG original.
Los comandos se redondean a cuatro decimales, con error menor de0.06px en la fuente de1080px,
para contener el HTML. La definición global permite usar las mismas máscaras en clones de giro
sin duplicar IDs. Las fuentes del logo y los perfumes se mantienen intactas.

La escena generada anterior queda conservada con su procedencia en `photographic-studio.md` y
`perfume-studio-derivatives.json`, pero esta revisión utiliza iluminación y superficie realizadas
en CSS. No se generan nuevos frascos, cajas, etiquetas ni fotografías comerciales.

## Verificación

Se añadió una prueba geométrica en `tests/e2e/catalog.spec.ts`: recorre los seis perfumes a
1650×954,1440×900,1280×720,390×844 y320×640 y comprueba fotos, nombres, precios y «Explorar» dentro
de sus filas, sin solapamientos u overflow. Se mantienen las comprobaciones originales de marco,
lectura, accesibilidad, foco, historial, compra, fallos del módulo y catálogo sin JS.

La suite completa pasa98/98 casos. La prueba fotográfica existente permanece intacta:
124 capturas,244 muestras fotográficas y12 de clones visibles, sin rectángulos blancos detectados.
El aspecto de la fotografía en entrada/regreso fue0.99999978–1.00000024. Los reflejos y tapones
blancos reales se mantienen; la comprobación examina el fondo visible y las caras3D pertinentes.
Capturas, métricas y ejecución final en `reports/reference-book/`.

Resultados de tipos, build, presupuesto y Lighthouse en `validation.md`. La imagen de Royale Opal
sigue limitada por su fuente432×400. Estas pruebas locales no acreditan Safari/Firefox ni FPS en
hardware móvil físico. El sitio conserva noindex y no se ha desplegado.
