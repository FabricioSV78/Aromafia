# Contratos de catálogo

El catálogo contiene seis fichas con nombres/precios aportados por el usuario en
`src/features/catalog/data/products.ts`. En fase 3 se habilitaron expresamente con `published`
para renderizar el catálogo local; mantienen `reviewStatus: 'pending'` por datos como SKU pendientes.
Los productos sintéticos viven solo en tests. Guía de edición y pendientes:
`catalog-content.md`.

`CatalogProduct` incluye identidad, slug estable, nombre editorial, marca, descripciones, imágenes
con alt y medidas, clasificación comercial, familias olfativas, notas top/heart/base, inspiración
opcional, badges, destacado, orden, nombre para WhatsApp, SEO y estados de publicación/revisión.
Marca y descripciones pueden ser null; fotos null y notas vacías señalan contenido no proporcionado.
El perfume vendido usa `generalImage` y `detailImage`, ambos `ProductImage | null`, con src/srcSet,
dimensiones, framing, máscara y fill independientes. La tercera imagen es `inspiredBy.image`,
separada en la zona de comparación con marca/nombre/relación y fuentes. Los seis tienen los tres
roles documentados. La plantilla conserva un único img para general/detalle y selecciona su source
por estado; el perfume de referencia es una imagen secundaria independiente. Ver
`catalog-three-photographs.md`.

Cada `PerfumeVariant` contiene id técnico, SKU/capacidad/concentración nullable, precio PEN,
tipo de precio, referencia anterior confirmada nullable, disponibilidad y promoción opcional.
El dinero usa `amountInCents` entero seguro, no decimales de coma flotante.

`price: null` indica precio no confirmado; disponibilidad `unknown` no equivale a stock.
`priceKind: 'offer'` identifica el precio suministrado como oferta sin inventar fechas;
`regularPrice` solo contiene una referencia confirmada superior al precio vigente.
`marketReference` contiene una observación de otra tienda con precio, fuente y fecha; se representa
con «Ref.» y `s`, y nunca se transforma en historial propio ni alimenta promociones. Cinco variantes
tienen referencias investigadas; Opal no tiene una peruana verificable y mantiene ese campo ausente.
`getVariantPriceDisplay` devuelve precio actual, referencia confirmada e indicador de oferta.
Las promociones temporales conservan su precio menor y ventana ISO8601 con zona horaria;
durante esa ventana, la comparación pública es el precio previo a la promoción.
`promotionOnly` incluye ofertas vigentes sin fecha y promociones temporales activas.
Las propuestas de precios anteriores están separadas en `data/price-proposals.ts`; no se importan
en `catalog.server.ts` ni se mezclan en resultados públicos. No hay fechas, porcentajes o historial
inventados. La clasificación comercial no restringe quién puede usar un perfume.

`reviewStatus` y `status` son independientes: confirmar contenido no lo publica y publicar no lo
convierte en completo. La validación exige marca, descripción, fotografía y presentación real para
marcar contenido como confirmado. Un registro pendiente puede publicarse después con placeholders
explícitos en la UI; en fase 3 los seis iniciales están publicados para el renderizado local.
Los borradores adicionales siguen protegidos. Esto conserva la protección pública
sin forzar fotografías, SKU o capacidades ficticios para preparar los datos.

## Lecturas públicas

`CatalogRepository.list(query?)` devuelve `CatalogPage`; `getBySlug(slug)` devuelve producto o null.
El repositorio local excluye siempre `draft` y `archived`, clona entrada/resultados y valida identidad
única, variantes, precios e imágenes. Permite buscar, filtrar por marca/clasificación/familia/precio/
disponibilidad/destacado/oferta, ordenar por nombre/precio/orden editorial y paginar con límites explícitos.
Los filtros de precio y stock deben cumplirse en la misma variante: no mezclar el precio de30ml
con la disponibilidad de100ml. Los precios desconocidos no se convierten en cero para ordenar.

El punto de composición es `services/catalog.server.ts`. Una página Astro puede consultarlo en
frontmatter y pasar props públicas a componentes. Una isla nunca debe importar el archivo local
de datos ni el repositorio; así no se filtran borradores dentro de JavaScript descargable.

## Libro y detalle

La subfase D conserva este contrato y cambia únicamente la presentación a un libro en una sola vista,
con dos perfumes por cara y cuatro por apertura de escritorio. El controlador cliente recibe el
HTML público de las caras; no importa datos locales, repositorios o propuestas de precios anteriores.

Las rutas `/perfumes/[slug]/` y «Ver ficha completa» fueron retiradas por el propietario. La
información permanece en el libro y procede del mismo producto público, sin registros paralelos.

`#libro/N` representa caras físicas y se normaliza a dos por vista en escritorio o una en móvil.
Los hashes con `/perfume/slug` restauran la cámara sobre la zona real y corrigen caras incompatibles.
`PerfumeReading.astro` recibe props públicas y se renderiza durante build. La plantilla compartida
actual usa Khamrah como referencia. El detalle no utiliza modal; Comprar abre únicamente el diálogo
compacto aprobado y el sufijo `/pedido` restaura esa selección. Sin JS, el catálogo queda en flujo
y Comprar ofrece el contacto nativo de WhatsApp. Los campos personales no se persisten y ningún
mensaje se envía automáticamente. Las comparaciones actuales son `similar_to`, sin afiliación ni
equivalencia exacta; si una referencia futura es null no se inventa.

## Cambiar a un backend

Implementar otro `CatalogRepository` y seleccionarlo en la composición de servidor. Validar la
respuesta externa en una frontera explícita; la validación local actual no es un decoder para JSON
no confiable. Mantener pruebas de contrato sobre ambos adaptadores.
Agregar búsqueda remota/inventario cuando lo justifique la escala; no abrir una API genérica de
administración ni introducir un SDK de base de datos en componentes.

En páginas estáticas los datos y promociones se resuelven al construir. Programar reconstrucciones
o introducir renderizado dinámico cuando se necesite vigencia inmediata. Checkout futuro siempre
revalida precio, oferta y stock en servidor; esta base no implementa reservas, compras ni pagos.
