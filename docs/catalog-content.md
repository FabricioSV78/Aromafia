# Edición del catálogo y contactos

La revisión vigente del **3 de noviembre de 2026** conserva la composición de **Khamrah Qahwa** como
plantilla única y organiza las tres imágenes de cada perfume en su propia carpeta pública:
[estructura, fuentes y preparación](perfume-asset-structure.md).
La fotografía va a la izquierda, la información y las notas al centro, los datos complementarios y
la compra a la derecha y los beneficios en la base. El encabezado admite nombres de una o dos líneas
con una distribución común y altura natural, sin reservar una segunda línea vacía; en móvil se
permite lectura vertical natural. La referencia mide210px de alto en escritorio,165px en escritorio
compacto y200px en móvil. Los enlaces de investigación bajo la foto, la concentración y el aviso
de similitud se retiraron de la interfaz. Las fuentes siguen en los datos; los precios externos
conservan su enlace verificable en el importe tachado. El prefijo visible «Ref.» fue retirado
por la petición posterior del propietario. [Revisión del detalle](detail-reference-refinement.md).

Cada perfume tiene tres roles fotográficos explícitos: `generalImage`, `detailImage` e
`inspiredBy.image`. La vista general agrupa nombre, descripción y precio sin reservar huecos
artificiales; el detalle muestra una fotografía independiente del frasco con su caja y una referencia
menor en la columna derecha. Mandarin utiliza los tres archivos aportados por el propietario.
No se aplica un filtro de color al frasco ni se reintroduce «Precio de oferta».
Los fondos de los demás perfumes siguen las escenas aprobadas de `mandarine/`, conservando
sus fotografías auténticas y sus encuadres. La imagen terminada se muestra completa, sin un
fondo CSS adicional ni escalado independiente de este.
[Plantilla fotográfica vigente](mandarin-background-template.md).
Los precios tachados externos se identifican como referencias de otro comercio y se distinguen
del historial propio; las comparaciones olfativas documentadas no afirman identidad ni afiliación.

Datos investigados desde el **2 de noviembre de 2026**, tras revisar los seis perfumes y recibir confirmación
de sus capacidades. No existe panel administrativo: los datos se editan en archivos TypeScript.
El libro muestra dos perfumes por cara. «Explorar» conserva el detalle en su zona real, sin ampliar
el libro ni usar un modal de producto. El título visible anterior fue retirado.
La última petición autoriza **solo para la compra** un modal compacto: «Comprar» abre el formulario
de hasta480px. El cliente revisa y envía el mensaje en WhatsApp después de continuar; el sitio no
lo envía solo. Esta autorización sustituye la antigua prohibición de modal únicamente para compra.

## Archivos de edición

| Archivo                                              | Contenido                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| src/features/catalog/data/products.ts                | Composición de productos, variantes, capacidades y precios confirmados            |
| src/features/catalog/data/product-research.ts        | Marcas, notas, clasificación, descripciones y fuentes investigadas                |
| src/features/catalog/data/product-images.ts          | Rutas y variantes de general/detail ya preparados                                 |
| src/features/catalog/data/product-inspirations.ts    | Tercera imagen, relación olfativa y fuentes de comparación                        |
| src/assets/perfumes/image-recipes.json               | Fuentes privadas, contornos y composición de los tres roles                       |
| scripts/build-perfume-images.mjs                     | Generación de las 18 composiciones y sus 42 archivos WebP                         |
| docs/perfume-assets.json                             | Manifiesto vigente: fuentes, hashes, encuadres incorporados y salidas             |
| src/features/catalog/data/market-reference-prices.ts | Precios externos observados, comercio y fecha, separados del historial propio     |
| src/features/catalog/data/price-proposals.ts         | Propuestas de precio anterior, privadas y no confirmadas                          |
| docs/sources-research-*.md                           | Procedencia, discrepancias y alcance de fuentes técnicas/comerciales              |
| docs/mandarin-supplied-images.json                   | Procedencia histórica de los tres originales aportados, ahora en fuentes privadas |
| docs/perfume-box-photos.json                         | Procedencia de fotografías reales del perfume con su caja                         |
| docs/inspiration-image-derivatives.json              | Procedencia de fotografías reales de las referencias                              |
| docs/catalog-photo-variants.json                     | Procedencia de derivados generales y de la iteración anterior                     |
| docs/perfume-clarity-derivatives.json                | Procedencia histórica de las fotografías reales anteriores                        |
| docs/royale-opal-hires-derivatives.json              | Procedencia de la fuente real de 2992 px de Royale Opal                           |
| src/config/contact.ts                                | WhatsApp e Instagram/Facebook/TikTok                                              |
| src/config/commerce.ts                               | Mensajes comerciales confirmados de originalidad y entregas                       |

No editar precios, marcas, notas o números en componentes. No importar `data/` o `*.server.ts`
en React hidratado o scripts cliente. Las propuestas de edición no son props públicas.

## Información recibida

| Perfume              | Marca   | Capacidad confirmada | Precio vigente | Céntimos | Slug          | Estado              |
| -------------------- | ------- | -------------------- | -------------- | -------- | ------------- | ------------------- |
| 9 pm                 | Afnan   | 100ml                | S/150          | 15000    | 9pm           | published / pending |
| Hawas Ice 100ml      | Rasasi  | 100ml                | S/185          | 18500    | hawas-ice     | published / pending |
| Odyssey Mandarin Sky | Armaf   | 100ml                | S/149          | 14900    | mandarine     | published / pending |
| Khamrah Qahwa        | Lattafa | 100ml                | S/160          | 16000    | khamrah-qahwa | published / pending |
| Hawas Malibu         | Rasasi  | 100ml                | S/189          | 18900    | hawas-malibu  | published / pending |
| Zakat Royale Opal    | Zakat   | 80ml                 | S/115          | 11500    | royale-opal   | published / pending |

Los nombres visibles y de consulta reproducen la lista final del propietario, incluida la capacidad
en «Hawas Ice 100ml» y la escritura «9 pm». Los precios y el orden editorial se conservan.
El propietario aclaró que «Mandarine» es Armaf
Odyssey Mandarin Sky; el nombre visible se actualizó y se conservó `mandarine` para no romper URLs.
También confirmó Royale Opal de Zakat80ml y100ml para los otros cinco. Los IDs de producto/
presentación son identificadores técnicos internos, no SKU comerciales.

Las marcas, notas, clasificación, concentración Eau de Parfum, descripciones y fotografías están
documentadas. Afnan, Rasasi, Armaf y Lattafa usan referencias de las marcas; Royale Opal utiliza
dos comercios concordantes, Blomster y Kingdom, identificados como comerciantes y no fabricantes.
El propietario confirmó el **3 de noviembre** que los seis perfumes están disponibles:
`availability` es `in_stock`, sin publicar el campo en la web ni pedir confirmación de stock en
el borrador de WhatsApp. SKU sigue null. No hay historial de precio anterior confirmado;
las seis comparaciones olfativas tienen investigación y fotografía independientes.
Destacados continúan desactivados y badges vacíos. Los mensajes generales de commerce.ts aparecen
una sola vez en el pie:100% originales, contraentrega en Trujillo/Chiclayo y envíos a todo el Perú.

## Nombres y contenido editorial

`occasionSuggestion` contiene la recomendación editorial de uso que aparece como **«Ideal para»**
en el antiguo espacio de disponibilidad. Es orientativa, basada en el perfil olfativo documentado;
no es una regla de uso exclusiva ni una certificación del fabricante. Se edita por producto en
`products.ts`, permanece separada de notas y de `availability`, y se omite si no se proporciona.

| Perfume              | Ideal para          |
| -------------------- | ------------------- |
| 9 pm                 | La noche            |
| Hawas Ice 100ml      | Días cálidos        |
| Odyssey Mandarin Sky | Salidas y reuniones |
| Khamrah Qahwa        | Noches frescas      |
| Hawas Malibu         | Días de sol         |
| Zakat Royale Opal    | Cenas especiales    |

- `name`: identificación del perfume. `displayName`: nombre visible; al inicio son iguales.
- `whatsappMessageName`: nombre inequívoco reservado para consultas. El formulario actual usa
  `displayName` de los productos públicos que recibe, sin consultar el dataset desde el navegador.
- `shortDescription`: resumen para la composición del libro. `description`: explicación más completa
  del mismo papel. Son redacciones propias basadas en las fuentes, sin copiar textos publicitarios.
- `brand`: null o `{ id, name }` del fabricante confirmado. No usar «pendiente» como si fuera una marca.
- `order`: entero positivo; para el catálogo editorial consultar `list({ sort: 'editorial' })`.
- `seoTitle` y `seoDescription`: null permite que las páginas futuras usen fallbacks con datos reales.
- `featured` y `badges`: solo cuando se aprueben esas decisiones; no deducir popularidad.
- `sources?: { label, url }[]`: referencias públicas de datos técnicos. `ProductSources` las muestra
  como enlaces y anuncia que abren otra pestaña. No usar precios o existencias ajenos como datos locales.

`pendingContent` conserva fallbacks comunes. `products.ts` aplica después `researchedContent` de
cada slug y compone sus variantes. Editar los hechos investigados en `product-research.ts`, con su
fuente y documentación; no rellenar un fallback compartido con las notas de un solo perfume.

## Presentación y fotografías

Los seis productos usan una sola plantilla y `ProductHero`, con superficie crema e iluminación
común. El conjunto visual contiene tres roles independientes:

- `generalImage`: fotografía compacta de la vista general.
- `detailImage`: fotografía de mayor resolución y protagonismo para el detalle.
- `inspiredBy.image`: fotografía secundaria del perfume de comparación, en un componente separado.

Los dos roles del producto vendido son `ProductImage | null`; un dato desconocido permanece
explícitamente en null. `inspiredBy` contiene la tercera imagen cuando existe una relación documentada.
El antiguo array `images[]` y su galería implícita se retiraron. Un registro `confirmed` necesita
los dos roles principales válidos, además de los demás datos requeridos. Los componentes reciben
propiedades públicas sin importar almacenamiento ni datos privados.

Cada rol tiene su propio `src`, `srcSet` y dimensiones. La raíz `public/images/perfumes/` contiene
solo las carpetas `9pm`, `hawas-ice`, `mandarine`, `khamrah-qahwa`, `hawas-malibu` y `royale-opal`.
Cada una contiene estos siete archivos:

| Archivo                | Tamaño  | Uso                    |
| ---------------------- | ------- | ---------------------- |
| `general.webp`         | 640×640 | Vista general          |
| `general-320.webp`     | 320×320 | Variante general móvil |
| `detail.webp`          | 960×960 | Detalle principal      |
| `detail-480.webp`      | 480×480 | Variante de detalle    |
| `detail-640.webp`      | 640×640 | Variante de detalle    |
| `inspiration.webp`     | 480×640 | Referencia olfativa    |
| `inspiration-240.webp` | 240×320 | Variante de referencia |

Son18 composiciones principales y42 archivos WebP opacos de calidad94. Fondo, sombra, encuadre
y proporción ya están incorporados al archivo. La interfaz reserva la geometría y selecciona
srcSet; no añade bordes, fondos de estudio, máscaras ni ajustes específicos por perfume.
`ProductHero` conserva un solo nodo img dentro de picture, que cambia de source al abrir y
regresar. La sustitución espera su decodificación y mantiene la fotografía general si falla la
carga. Las imágenes no incluyen precios, notas, comparaciones, dupe ni controles: esos datos
permanecen en HTML independiente y se conserva la etiqueta original del frasco.

Los encuadres se preparan en `src/assets/perfumes/image-recipes.json` y se generan con
`node scripts/build-perfume-images.mjs`. Las recetas fijan fuente, contorno exterior, posición
y escala; el generador comprueba que la silueta quede dentro del lienzo. El manifiesto vigente
`docs/perfume-assets.json` documenta fuentes, hashes, límites de objeto y cada salida. Las recetas
y los contornos son privados y no se importan en scripts cliente.

El estudio vacío `src/assets/perfumes/studio/cream-peach-source.png` se generó con la herramienta
integrada de imágenes. Los frascos, cajas y etiquetas proceden de fotografías auténticas; no se
generan ni se recolorean con filtros CSS. Los contornos privados recortan solo el exterior y
conservan los reflejos del vidrio y el metal dentro del producto. Los originales y sus perfiles
quedan conservados en las fuentes privadas. Los SVG públicos, el endpoint presentation.css y
su servicio de variables de encuadre ya no forman parte de la interfaz.

Cada producto tiene una presentación con id estable. `catalogVariant` recibe los céntimos y la
capacidad confirmada; concentración es Eau de Parfum, contrastada con la referencia. `sku` sigue
null y `availability` es `in_stock` por confirmación expresa del propietario. Para futuras referencias,
no convertir un null en0,100ml o un SKU ficticio. Cada presentación tiene precio y disponibilidad propios.

Mandarin conserva los tres originales aportados, trasladados intactos a
`src/assets/perfumes/originals/mandarine/{1,2,3}.png`, y el detalle cuadrado aprobado de
`detail-master.png`. El general recorta solo fondo vacío superior e inferior; detalle y referencia
conservan las escenas aprobadas. No se presume un origen fotográfico o generativo no documentado
para las imágenes aportadas. Su procedencia histórica está en `docs/mandarin-supplied-images.json`.

El detalle Qahwa compone el frasco real de `khamrah-qahwa-source.png` y la caja real de
`detail-boxes/khamrah-qahwa-official-03.png` para dar más protagonismo al frasco. El manifiesto
identifica ambas fuentes y sus hashes. Los otros detalles mantienen fotografías auténticas del
frasco y su presentación. Qahwa y Opal comparten la fuente de Angels’ Share, con archivos públicos
independientes en sus carpetas.

La referencia olfativa mide ahora135px de alto, o108px en escritorio compacto, frente a100/80px
anteriores. Sigue siendo menor que la imagen principal. `InspiredBySection` incluye srcset y sizes
para aprovechar sus variantes; la foto no forma parte de la compra ni acredita inventario local.

Se retiraron129 derivados públicos anteriores y dos imágenes antiguas de trabajo; los tres PNG
aportados se movieron sin modificar bytes y diez máscaras SVG se conservaron privadamente antes
de retirar sus copias públicas. Los scripts antiguos de máscaras y extensión del fondo fueron
sustituidos por el generador único. Las rutas `*-general-v1-*`, `*-detail-box-v1-*` y
`*-reference-v1-*` de manifiestos anteriores son históricas. Inventario y resultado de limpieza
en `reports/perfume-assets/`.

Fuentes, prompt y comprobaciones: [estructura fotográfica vigente](perfume-asset-structure.md).
`catalog-photo-variants.json`, `perfume-clarity-derivatives.json`, `royale-opal-hires-derivatives.json`,
`perfume-box-photos.json` e `inspiration-image-derivatives.json` conservan la procedencia de sus
fuentes y de las iteraciones anteriores.

Cada `ProductImage` usa `src`, `alt`, `width`, `height` y `srcSet` opcional; UI reserva el espacio
y selecciona tamaños responsive. Las fotos de referencia no son fotografías del inventario local
ni acreditan stock. Si un rol futuro carece de fotografía, dejar su campo en null para el fallback
neutral. Los originales del logo permanecen intactos en `pantalla_inicial/`.

## Notas e inspiración

`notes.top`, `notes.heart`, `notes.base` son listas de notas confirmadas. Los arrays vacíos junto
con `reviewStatus: 'pending'` indican que aún faltan datos. El detalle las etiqueta como Entrada,
Corazón y Fondo, mostrando «Por confirmar» en grupos vacíos; no se crea una cuarta familia.

`inspiredBy: null` significa que no hay referencia aprobada para mostrar. Para una referencia
confirmada, rellenar `{ name, brand, relation, image }`; relation es `inspired_by` o `similar_to`.
Su imagen puede seguir null si falta la fotografía. No inferir una equivalencia por el nombre
ni afirmar que un perfume y otro son el mismo. Con revisión completa, null también puede indicar
que no se mostrará ninguna relación; la revisión general distingue ese caso de un registro pendiente.
El propietario pidió recuperar la columna de referencia. Los seis registros actuales tienen
`inspiredBy` con `name`, `brand`, `relation: 'similar_to'`, `image` y `sources`, editables en
`data/product-inspirations.ts`. Son comparaciones documentadas, no inspiración oficial ni afiliación:

| Perfume vendido      | Referencia olfativa                         |
| -------------------- | ------------------------------------------- |
| 9 pm                 | Ultra Male — Jean Paul Gaultier             |
| Hawas Ice            | Invictus Aqua — Rabanne, sin año de edición |
| Odyssey Mandarin Sky | Scandal Pour Homme — Jean Paul Gaultier     |
| Khamrah Qahwa        | Angels’ Share — Kilian Paris                |
| Hawas Malibu         | Le Beau Le Parfum — Jean Paul Gaultier      |
| Zakat Royale Opal    | Angels’ Share — Kilian Paris                |

La investigación está en [referencias olfativas](inspiration-research.md). Mandarin utiliza además
las fuentes La Belle e Imperian y la tercera imagen aportada por el propietario. El componente
mantiene fotografía, marca, nombre y explicación como HTML independiente, con una fuente comercial
entre los enlaces del detalle. La imagen de referencia no se incrusta en `generalImage` o
`detailImage`. Para futuros datos desconocidos, null sigue siendo desconocido; no se deducen
equivalencias por nombre, notas, envase o una única reseña, ni se publican porcentajes de semejanza.

## Precios y propuestas anteriores

La moneda se mantiene en PEN; `pen(15_000)` representa S/150. Los valores usan enteros en céntimos.
`variant.price` es el precio vigente confirmado. `priceKind: 'offer'` conserva su significado en los
datos y no requiere fechas de caducidad inventadas. La UI muestra únicamente los importes, sin el
texto «Precio de oferta», tanto en la vista general como en el detalle.

`variant.regularPrice` empieza en null. Solo contiene un importe anterior/de referencia confirmado,
mayor que el vigente. El helper `getVariantPriceDisplay(variant, fechaDeConsulta)` devuelve los
valores públicos sin revelar propuestas. Un precio anterior propio confirmado usa `del`.

`variant.marketReference` es distinto del historial propio: contiene `price`, `source` y `checkedOn`
para un importe observado en otro comercio. Los cinco valores siguientes se investigaron el
**3 de noviembre de 2026** para la presentación exacta en Perú; no son promedios, mínimos del mercado
ni ventas anteriores de AROMAFIA. La UI utiliza `s`, el rótulo «Ref.» y un enlace visible
«Referencia: [comercio]» acompañado de su fecha. No debe rotularse como «antes» ni usarse para
inventar un porcentaje de ahorro. Si existe `regularPrice` confirmado, ese historial tiene prioridad.

| Perfume                    | Precio AROMAFIA | Referencia externa            | Fuente        |
| -------------------------- | --------------- | ----------------------------- | ------------- |
| 9 pm 100ml                 | S/150.00        | S/159.00                      | Passim Perú   |
| Hawas Ice 100ml            | S/185.00        | S/189.00                      | Passim Perú   |
| Odyssey Mandarin Sky 100ml | S/149.00        | S/155.90                      | Renace        |
| Khamrah Qahwa 100ml        | S/160.00        | S/169.00                      | Sin Filtro    |
| Hawas Malibu 100ml         | S/189.00        | S/219.00                      | Passim Perú   |
| Zakat Royale Opal 80ml     | S/115.00        | Sin referencia PEN verificada | Campo ausente |

Datos en `data/market-reference-prices.ts`; URLs, selección, discrepancias y límites en
[investigación de precios](catalog-reference-prices-2026-11-03.md). No se convierte un precio USD ni
se suman portes o impuestos desconocidos para inventar una referencia de Opal. Una actualización
requiere consultar de nuevo la ficha exacta, guardar fuente/fecha y reconstruir el sitio estático.
La validación rechaza referencias inválidas o inferiores al precio vigente y no importa propuestas
privadas para construir estos valores.

Se prepararon ejemplos editables, **no históricos reales**, en price-proposals.ts:

| Perfume       | Propuesta anterior privada | Oferta confirmada |
| ------------- | -------------------------- | ----------------- |
| 9PM           | S/180                      | S/150             |
| Hawas Ice     | S/220                      | S/185             |
| Mandarine     | S/179                      | S/149             |
| Khamrah Qahwa | S/190                      | S/160             |
| Hawas Malibu  | S/229                      | S/189             |
| Royale Opal   | S/139                      | S/115             |

Todas llevan `status: 'proposed'`. Son cifras configurables solicitadas para preparar el diseño;
no provienen de investigación de mercado ni de ventas anteriores. No se importan al servicio público.
`validatePriceProposals` comprueba referencias y comparación sin modificar los productos.

Para confirmar un anterior: verificar su importe, introducirlo en `regularPrice` de la variante y
retirar la propuesta pendiente. No cambiar un estado a «confirmado» sin revisar el valor.
Si existe una promoción temporal real, `promotion` mantiene precio, startsAt y endsAt con zona
horaria; inicio inclusivo y fin exclusivo. El precio temporal se calcula con una fecha común por
consulta. En páginas estáticas hay que reconstruir al cambiar precios y al vencer promociones.

## Revisión y publicación

- `status: 'draft'`: no aparece en `list()` ni `getBySlug()` públicos.
- `reviewStatus: 'pending'`: permite datos desconocidos explícitos sin inventarlos.
- `reviewStatus: 'confirmed'`: exige marca, descripción, imagen y SKU/capacidad de las presentaciones;
  no cambia por sí solo el estado de publicación. No exige inventar notas si el propietario decide no mostrarlas.
- En fase 3 se habilitaron registros pendientes con placeholders claros y datos conocidos,
  cambiando `status` expresamente. No modificar el repositorio para saltarse el filtro de borradores.

La composición pública devuelve los seis perfumes, conservando `reviewStatus: 'pending'` por los
SKU todavía incompletos; la disponibilidad de estos seis productos sí fue confirmada por el propietario.
Este estado solo habilita su renderizado local: no se ha desplegado el sitio. Los precios anteriores
propuestos siguen fuera de la UI. Una revisión completa exige resolver sus pendientes reales, no
cambiar el estado solo por haber investigado una descripción o descargado una fotografía.

## Libro y vistas de producto

El libro permanece en una sola vista cuando JavaScript está activo. Los controles muestran dos
caras en escritorio y una en móvil, con dos perfumes por cara. `#libro/N` representa la primera
cara de la vista; `#libro/N/perfume/slug` restaura la lectura de su zona real y el sufijo `/pedido`
restaura el modal compacto de compra con el perfume elegido.
Las páginas de ficha completa fueron retiradas por indicación del propietario. Los enlaces reales
«Explorar» usan el hash de la zona del libro y no abren otra página. El nombre del perfume aparece
a la derecha de los controles, en el lugar del antiguo enlace «Ver ficha completa».

La información se genera desde el repositorio público y se actualiza al reconstruir. Contiene
nombre, precio, presentación, notas y fuentes; no incluye el campo de disponibilidad ni datos privados de autoría.
La cámara conserva la zona real del libro; E sustituyó la columna de lectura de D por una
composición completa sobre el mismo papel. La revisión editorial vigente comparte las tres zonas
de Khamrah Qahwa con los seis perfumes en escritorio y permite lectura vertical natural en móvil.
Se conservan imagen, nombre y precio originales. En alturas extremas o con zoom de texto se prioriza
el reflow accesible.
No hay una segunda copia de productos dentro del controlador. Sin JavaScript, las hojas y su
información permanecen visibles en flujo, y «Comprar» lleva directamente al WhatsApp configurado.
El título visible del
libro fue eliminado y el documento usa «AROMAFIA · Perfumes originales», con h1 semántico no visible.
La animación no cambia los datos ni confirma precios/stock. El detalle del producto no usa modal.

## Contactos y entregas

WhatsApp: número nacional955565209 y prefijo51 en contact.ts. El número internacional y enlace
se derivan como51955565209 y https://wa.me/51955565209. El prefijo corresponde al contexto peruano;
no se comprobó recepción ni se envió mensaje. E genera un borrador con los datos que el cliente
introduce y lo abre en el destino configurado únicamente al pulsar «Continuar en WhatsApp».

Instagram: handle@aromafia.pe, enlace derivado https://www.instagram.com/aromafia.pe/.
Facebook conserva https://www.facebook.com/share/1BPHwsBwgb/.
TikTok conserva https://www.tiktok.com/@aromafia.pe?is_from_webapp=1&sender_device=pc.
No se verificó titularidad de perfiles ni se cambiaron las URLs suministradas.

commerce.ts no contiene precios/plazos de entrega; sus valores null no equivalen a envío gratuito
o inmediato. Modificar ciudades/copy únicamente cuando cambien las condiciones del emprendimiento.

## Compra por WhatsApp desde el libro

«Comprar» abre únicamente el formulario en un `dialog` nativo de hasta480px, con margen en móvil
y altura limitada al viewport; permite scroll interno si la altura/teclado o errores lo requieren.
Escape, clic en el fondo, cierre e historial vuelven al contexto anterior y restauran el foco.
El libro que queda detrás conserva su geometría. Esta excepción de modal fue solicitada expresamente;
no autoriza volver a un modal de detalle de producto. La petición posterior de continuar autoriza
la aceptación integral de [subfase F](book-navigation-subphase-f.md), sin publicar el sitio.

`features/orders/domain/order-request.ts` valida nombre (2–80 caracteres), teléfono (9–15 dígitos,
con prefijo opcional), ciudad (2–100 caracteres), un perfume de la lista pública y comentario
opcional de hasta 500 caracteres. Los errores se asocian a sus campos y el foco va al primero.
Cambiar el perfume en el formulario cambia la selección del libro, sin perder los campos al
volver a la lectura dentro de la misma página. Una recarga restaura el perfume desde la URL,
no los datos personales del formulario.

`features/orders/services/whatsapp.ts` prepara el mensaje y codifica su parámetro `text`. El destino
procede de `contact.whatsapp.href`; no repetirlo en la UI ni aceptar un destino arbitrario del cliente.
El mensaje pide confirmar presentación y precio. No incluye precios anteriores
propuestos ni promete reservar existencias. Los datos se mantienen en el formulario, sin base de
datos, cookies ni almacenamiento persistente; al continuar se incluyen en el enlace a WhatsApp.

## Comprobar una edición

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run check:assets
```

En PowerShell usar npm.cmd si hace falta. Las pruebas verifican los seis importes iniciales como
contrato del brief; si se aprueba cambiar un precio, actualizar también esa expectativa. Las pruebas
de propuestas validan invariantes, no fijan sus cifras arbitrarias, para permitir su edición.
No se necesita conectar servicios, instalar paquetes ni acceder a redes sociales para estos checks.
