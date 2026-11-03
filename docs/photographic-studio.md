# Fotografías — escena de estudio común

**Registro histórico.** El estudio y sus tres derivados de esta iteración fueron retirados en la
limpieza posterior. La preparación vigente está en [estructura de imágenes](perfume-asset-structure.md):
archivos completos por perfume, sin fondos CSS ni esta base circular. Las rutas citadas debajo
documentan los recursos de entonces, no archivos disponibles ni instrucciones actuales.

**Revisión posterior:** [color y luz de la nueva referencia](catalog-reference-style.md) sustituye
la base circular y la mezcla de color por una escena plana en CSS y contornos SVG de las fotografías
originales. Este documento conserva la procedencia y las decisiones de la iteración anterior.

**3 de noviembre de 2026.** El propietario pidió fotografías más trabajadas como las referencias
y pruebas para evitar fondos blancos durante las transiciones. Esta petición amplía el tratamiento
fotográfico a los seis perfumes; la composición editorial completa sigue siendo el piloto Mandarin Sky.

## Dirección visual y recursos

Los seis frascos se muestran sobre piedra clara, con iluminación suave lateral, fondo crema cálido
y encuadre uniforme. Nombre, marca, precio, notas y recomendaciones siguen siendo HTML editable.
El único recurso generado con la skill `imagegen` es una **escena vacía**: pared y base baja de piedra.
Los perfumes, sus etiquetas y las cajas existentes proceden de las fotografías reales documentadas;
no se generaron botellas, cajas, notas, precios ni comparaciones a partir del anuncio de referencia.

Fuente del fondo: `src/assets/photography/perfume-studio-v1.png`1254×1254px, conservada. Derivados WebP88
de320/640/960px, sin ampliar la fuente:7.8/31.9/66.9KB. `image-set()` adapta el recurso a la densidad
y el ancho de pantalla, y el mismo archivo se reutiliza entre productos. Hay un fondo crema opaco
disponible mientras se descarga. Dimensiones, bytes y SHA256: `perfume-studio-derivatives.json`.

La generación pidió una escena fotográfica cuadrada vacía, crema/piedra caliza, luz natural desde
arriba a la izquierda y una sola base circular baja en la parte inferior; sin productos, cajas,
frutas, logos, textos, bordes o marcas de agua. Una veladura crema en CSS suaviza su textura y luz.

## Composición y encuadre

`ProductHero.astro` conserva el `<img>` real y compone la escena dentro de un contenedor aislado
y opaco. La mezcla se aplica al grupo fotográfico recortado sobre su propio escenario; no depende
del color de una capa externa que cambie durante la animación. Qahwa ya tiene transparencia y usa
mezcla normal para conservar el vidrio y sus reflejos. El campo gris239/239/239 de9 pm requiere una
corrección de exposición CSS255/239 para integrarse sin placa gris. Las fuentes no se reescriben.

`ProductImage.framing` documenta el encuadre y el punto de apoyo del frasco. Se excluyen solo márgenes
vacíos, conservando frasco, caja cuando existe y sombra fotografiada. Estas coordenadas se aplican
en CSS sobre la imagen original, con proporción constante; no hay eliminación automática de capas.

| Perfume              | Fuente    | Rectángulo x/y/ancho/alto en la fuente |
| -------------------- | --------- | -------------------------------------- |
| 9 pm                 | 1080×1080 | 216/108/636/884                        |
| Hawas Ice            | 1000×1000 | 288/104/424/728                        |
| Odyssey Mandarin Sky | 900×900   | 246/90/464/750                         |
| Khamrah Qahwa        | 1100×1100 | 282/121/531/849                        |
| Hawas Malibu         | 1000×1000 | 264/60/484/832                         |
| Zakat Royale Opal    | 432×400   | 80/40/312/336                          |

La base común y los puntos de apoyo evitan que el frasco flote o cambie de encuadre al abrir.
Royale Opal conserva la caja de su fotografía existente. No se añade una caja a los otros productos
para suplir una fotografía desconocida. Su fuente más pequeña sigue limitando el detalle disponible;
no se afirma resolución adicional mediante ampliación artificial.

## Movimiento

El contenedor exterior ocupa la celda real del libro. Un contenedor de tamaño permite encajar una
superficie cuadrada con `min(100cqw,100cqh)` sin invadir otra fila en pantallas de menor altura.
Ese escenario es el nodo compartido `[data-product-visual]` que se anima en ambas direcciones.
La fotografía mantiene su mismo encuadre en catálogo, detalle y giros; se retiró el cambio de
`object-fit:contain` a `cover` al enfocar Mandarin Sky.

La cámara compensa solo su traslación en `book-layout.ts`. Los elementos reales y el papel tienen
sus propias compensaciones de tamaño. Así el crecimiento vertical de la lectura móvil no estira
la fotografía a mitad del movimiento. Las mediciones de rectángulos siguen siendo por acción;
durante el recorrido solo se animan transformaciones y opacidad, sin lecturas de layout por frame.
La fotografía termina a escala nativa y el retorno recupera su zona original.

## Pruebas visuales

El nuevo `tests/e2e/photo-transitions.spec.ts` captura píxeles reales en Chromium de escritorio
y móvil, con movimiento normal. Examina zonas de fondo dentro del recorte visible, excluyendo
tapones, etiquetas y reflejos blancos reales. En giros3D comprueba la cara decorativa visible,
sin atribuir a una fotografía tapada los píxeles de otra hoja.

La prueba detectó los rectángulos blancos/grises en la versión anterior. Sobre la versión final,
los4 casos específicos pasaron:124 capturas,249 muestras fotográficas y12 de clones decorativos,
sin rectángulos blancos detectados. El aspecto de la superficie durante enfoque/regreso estuvo
entre0.99999975 y1.00000024. Se examinan apertura, cierre, giro en ambos sentidos y entrada/regreso
de los seis perfumes. Las capturas y métricas están en `reports/photo-transitions/final-photographic-tests/`.
La revisión visual de catálogo/detalle se conserva en `reports/photo-studio/`.

Son pruebas locales y de muestras concretas; no acreditan FPS en hardware físico ni compatibilidad
Safari/Firefox. La verificación general y límites del build están en `validation.md`. No se publicaron
cambios externos ni se enviaron pedidos.
