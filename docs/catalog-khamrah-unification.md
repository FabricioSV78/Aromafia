# Catálogo — plantilla Khamrah y dos roles fotográficos

**3 de noviembre de 2026.** Corrección del catálogo existente según las tres capturas y el brief
del propietario. Khamrah Qahwa es la referencia de composición; esta entrega no añade funciones,
cambia la navegación ni publica el sitio.

## Análisis y composición compartida

La versión anterior compartía el componente, pero su distribución dependía de la altura natural
del título. Mandarin tenía además una división exclusiva del nombre; sus dos líneas desplazaban
descripción, precio y notas. La columna derecha se colocaba con posiciones absolutas y reservaba
un bloque para una comparación todavía no confirmada.

La nueva plantilla utiliza tres columnas Grid aproximadas de 38/40/22, con separaciones comunes.
La fotografía ocupa la izquierda; marca, nombre, descripción, precios y notas forman la columna
central. Presentación, concentración y ocasión van a la derecha, con Comprar al pie. Los beneficios
se distribuyen horizontalmente en la base y las fuentes quedan fuera de la fotografía.

El encabezado reserva dos líneas y un ancho editorial común de 16ch; los nombres de una o dos
líneas comparten los comienzos de descripción, precio y notas. No existen excepciones por slug,
tipografía específica de Mandarin ni posiciones absolutas por perfume. Grid/subgrid conserva
`PerfumeReading` como caja real para sus animaciones de opacidad y retracción.

En la vista general se mantienen dos perfumes por cara, contenedores fotográficos iguales y precios
alineados al pie. El encabezado admite dos líneas con una reserva común para alinear las
descripciones. La escala interior de cada silueta está en los datos, sin deformación ni recorte.
En móvil la lectura fluye verticalmente y conserva fuentes, beneficios, compra y retorno accesibles.
Se mantiene el reflow de F para ventanas bajas, con el mismo marco antes y después de enfocar.

## Dos fotografías independientes por producto

`CatalogProduct` declara exactamente `generalImage` y `detailImage`, ambos `ProductImage | null`.
El array `images[]` se retira del contrato, validadores, composición y pruebas. Un producto confirmado
necesita ambos roles; null sigue representando información desconocida.

Cada rol tiene rutas, srcSet, dimensiones, encuadre, máscara y escala `fill` propios. Los seis
productos reutilizan la fuente real del mismo perfume para crear familias independientes:

- General: derivados de 320/640px, presencia interior de 0.84–0.88.
- Detalle: 640/960px y resolución nativa cuando corresponde, presencia de 0.92–0.94.
- Mandarin conserva su límite real de 900px. Opal añade 1440/1920px antes del original de 2992px.

Los 31 WebP calidad 96 conservan perfiles ICC/EXIF y alfa cuando existen. Solo se redimensiona y
codifica; no se reconstruyen etiquetas, recolorean frascos ni generan fotografías. Fuentes, hashes,
dimensiones y tratamiento por rol están en [el manifiesto](catalog-photo-variants.json).

La fotografía contiene exclusivamente el perfume real y su etiqueta original. Comparaciones,
precios, notas, servicios y controles se renderizan en HTML. El entorno crema y la sombra discreta
son CSS; el producto usa mezcla normal y no recibe filtros de brillo, saturación o contraste.

`ProductHero` mantiene un solo `img` dentro de `picture`. `setReading` activa/desactiva el source de
detalle; las variables de encuadre cambian por rol. La selección, retorno, portada y giro conservan
sus estados y timelines existentes. No se copia el producto ni se escala permanentemente la ficha.

## Referencias y precios

`InspiredBySection` se renderiza únicamente cuando existe una referencia confirmada. Muestra
relación, marca, nombre e imagen secundaria de menor tamaño, con una explicación de similitud
orientativa y ausencia de afiliación. La referencia no forma parte de la compra ni de la foto
principal. Los seis productos actuales tienen `inspiredBy: null`: el apartado se omite completamente,
sin «Por validar», símbolo provisional ni hueco reservado.

«Precio de oferta» se retira del componente y sus estilos. El precio actual conserva una jerarquía
clara y, en detalle, contraste sobre dorado cálido. `regularPrice` solo produce un importe tachado
si existe un valor real validado; las seis referencias actuales permanecen null y no se publica
ninguna propuesta privada. Los precios vigentes, notas, capacidades y condiciones comerciales no cambian.

## Archivos principales

| Archivo                                                   | Responsabilidad                                                                         |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `PerfumeZone.astro`, `PerfumeReading.astro`               | Plantilla única, encabezado común, descripción sin duplicación y columna complementaria |
| `editorial-reading.css`                                   | Grid/subgrid, tipografía común, alineación y lectura móvil                              |
| `catalog-reference.css`                                   | Fotografías y filas generales uniformes, descripción junto al nombre y precios al pie   |
| `ProductHero.astro`, `product-hero.css`                   | Un img, dos roles, encuadres independientes y colores originales                        |
| `book-scene.ts`                                           | Selección del source por estado, conservando el controlador y sus limpiezas             |
| `product.ts`, `catalog-validation.ts`                     | Contrato de dos roles y validación de fill/fuentes                                      |
| `product-images.ts`, `product-research.ts`, `products.ts` | Datos editables y composición pública                                                   |
| `InspiredBySection.astro`, `ProductPrice.astro`           | Referencia confirmada condicional e importes sin etiqueta de oferta                     |
| `scripts/generate-photo-masks.mjs`                        | Máscaras reutilizadas sin duplicar rutas entre roles                                    |
| `public/images/perfumes/*-general-v1-*`, `*-detail-v1-*`  | Familias responsive independientes                                                      |
| `tests/unit/`, `tests/e2e/`                               | Contrato, encuadre, alineación, lectura, navegación y transiciones                      |

Las rutas de componentes/datos/estilos de la tabla pertenecen a `src/features/catalog/`; el
controlador pertenece a `src/motion/`. No se añadieron paquetes ni se elevaron presupuestos.

## Validación y límites

Tipos sin errores en 88 archivos, ESLint y Prettier correctos, 107 unitarios en 14 archivos y 154 E2E
correctas en 3.2 minutos. Las fotografías aportan 238 muestras, incluidas 12 de clones visibles, sin
fondos blancos detectados ni clones residuales. La vista general conserva marcos iguales dentro
de 1 px y descripciones alineadas dentro de 2 px. Las métricas finales de Mandarin/Qahwa coinciden
exactamente en descripción/precio/notas a 1440×900 y 1280×720.

Contraste calculado: precio actual 5.89:1, anterior 5.74:1 y Comprar 15.02:1. El anterior es una
comprobación del estilo para datos confirmados; no se muestra ningún importe anterior en los seis
productos actuales. Los casos de accesibilidad de navegador pasan con el contenido real.

Presupuestos: JS gzip 122104 bytes, CSS gzip 10219 bytes y HTML máximo 49081 bytes, sin elevar límites.
Lighthouse móvil obtiene rendimiento 100, accesibilidad 100 y buenas prácticas 100; LCP 1505.568 ms,
CLS 0 y TBT 0 ms. SEO 66 acompaña la preparación con noindex.

Los resultados se registran en [validación](validation.md). Las capturas finales a igual resolución
y sus métricas están en `reports/khamrah-unified/final/`, con log de la suite completa, resumen de
píxeles, cálculo de contraste y Lighthouse en el directorio superior. La revisión incluye escritorio,
móvil, fotografías durante los movimientos, apertura/cierre, regreso, historial, movimiento reducido
y alternativas sin JavaScript. Los originales de marca conservan sus hashes.

Las pruebas de Chromium emulado no acreditan Safari/Firefox, teléfonos físicos ni INP o FPS de
campo. WebP 96 sigue siendo compresión con pérdida y no inventa resolución por encima de la fuente.
El sitio conserva noindex y continúa local, sin transacciones ni mensajes reales enviados. Esta
corrección termina aquí para revisión visual.
