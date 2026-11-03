# Catálogo investigado y modal compacto de compra

**Actualización posterior:** el propietario retiró la ficha completa y sus páginas. La lectura y
la compra quedan únicamente dentro del libro, y el nombre ocupa el extremo derecho de la barra.
Sin JS se leen las seis fichas dentro del catálogo y «Comprar» enlaza a WhatsApp. Los módulos
`ProductDetail`, `PurchaseDialog`, `order-purchase` y la ruta `/perfumes/[slug]/` descritos en este
registro de entrega fueron eliminados en esa revisión; no deben reintroducirse. Resultados actuales
en [validación](validation.md).

**2 de noviembre de 2026.** Revisión autorizada por el usuario: retirar el título visible y su
antiguo título de documento, completar los perfumes con información contrastada y sustituir
«Pedir por WhatsApp» por «Comprar», abriendo un modal pequeño. Esta petición autoriza únicamente
el modal de compra y sustituye la prohibición anterior para ese formulario. El detalle del perfume
permanece en el libro, sin modal de producto ni cambio de tamaño. No se implementa una subfase F adicional.

## Identidad y datos comerciales confirmados

| Referencia    | Marca   | Capacidad confirmada por el propietario | Precio vigente |
| ------------- | ------- | --------------------------------------- | -------------- |
| 9PM           | Afnan   | 100ml                                   | S/150          |
| Hawas Ice     | Rasasi  | 100ml                                   | S/185          |
| Mandarin Sky  | Armaf   | 100ml                                   | S/149          |
| Khamrah Qahwa | Lattafa | 100ml                                   | S/160          |
| Hawas Malibu  | Rasasi  | 100ml                                   | S/189          |
| Royale Opal   | Zakat   | 80ml                                    | S/115          |

«Mandarine» quedó identificado por el propietario como Armaf Odyssey Mandarin Sky. Se actualiza
el nombre y se conserva el slug `mandarine`. Los precios no se modifican. Las capacidades de las
ofertas se basan en la confirmación del propietario, no en el inventario de una tienda extranjera.
SKU permanece null, disponibilidad unknown y `reviewStatus:pending`. No se publican precios
anteriores propuestos, stock ajeno, equivalencias o inspiraciones no confirmadas.

## Investigación y atribución

`src/features/catalog/data/product-research.ts` reúne marca, descripciones propias, notas, clasificación,
familias y enlaces públicos. `products.ts` compone esos campos con las variantes comerciales.
Cinco referencias usan páginas de las marcas o su red oficial:

- [Afnan9PM](https://us.afnan.com/products/9-pm).
- [Rasasi Hawas Ice](https://store.rasasi.com.sa/en/aeezlxd/p330366857).
- [Armaf Odyssey Mandarin Sky](https://www.armaf.ae/products/odyssey-mandarin-sky-man).
- [Lattafa Khamrah Qahwa](https://lattafa.com/product/khamrah-qahwa/).
- [Rasasi Hawas Malibu](https://store.rasasi.com.sa/en/bpzlndr/p533992836).

Para Royale Opal se contrastan dos fichas comerciales concordantes:
[Blomster](https://www.blomsterusa.com/en/products/royale-opal-by-zakat) y
[Kingdom](https://kingdomfragrances.com/products/zakat-royale-opal-2-7oz-edp). Son comerciantes;
no se presentan como el fabricante. Las diferencias y límites de las fuentes se conservan en
[Afnan/Rasasi](sources-research-afnan-rasasi.md) y [Lattafa/Armaf/Zakat](sources-research-lattafa-other.md).
No se adoptan promesas de duración o rendimiento de reseñas ni comparaciones como inspiraciones.

El modelo admite `sources?: { label, url }[]`. `ProductSources.astro` muestra enlaces en la lectura
y la ficha nativa, indicando la apertura en otra pestaña. La descripción breve se usa dentro del
libro y la ampliada en `/perfumes/[slug]/`; ambas derivan de los mismos datos públicos.

## Fotografías y derivados

Las fotografías fuente se conservan en `src/assets/perfumes/`, con sus procedencias y dimensiones.
Los derivados se sirven localmente desde `public/images/perfumes/`, sin hotlinking durante la visita.
`product-images.ts` suministra rutas, texto alternativo, dimensiones y `srcSet` a los componentes.

Se usa WebP calidad90 y anchos320/640/960px cuando la fuente lo permite. Royale Opal queda limitado
a320/432px porque la foto neutra original mide432×400px. Se conserva el encuadre completo y alpha,
sin recortar, reemplazar fondos ni ampliar por encima de la fuente. Tratamientos, hashes y tamaños
están en [el manifiesto de derivados](perfume-image-derivatives.json). Las fotos identifican la
referencia; no son evidencia del inventario local. Los originales oficiales del logo y HTMLv3
permanecen protegidos por sus hashes y no se alteran.

## Compra compacta y detalle en el papel

El título visible «El libro del buen gusto.» se retira para dar protagonismo al libro. El documento
usa «AROMAFIA · Perfumes originales» y conserva un h1 semántico no visible. Navbar, apertura,
giro, cámara y regreso mantienen su funcionamiento. Los mensajes comerciales se muestran una
sola vez en el pie, evitando repetirlos en cada lectura del perfume.

«Comprar» abre un `dialog` nativo de ancho máximo30rem/480px, con margen respecto al viewport
y altura ajustada al formulario. La altura máxima permite scroll interno cuando lo requieren
errores, teclado o una pantalla corta, sin convertir el formulario en una ventana de pantalla completa.
La entrada usa transform/opacity durante180ms y respeta reduced motion.

`order-dialog.ts` controla el top layer, cierre, Escape, clic fuera y bloqueo/restauración del scroll
del documento. El libro conserva su geometría detrás del diálogo. Foco, historial y limpieza forman
parte del contrato. Se reutiliza `OrderForm`, con selección pública mínima, validación y asociación
accesible de errores. Los campos mantienen texto de16px y objetivos de44px.

En el libro, `#libro/N/perfume/slug/pedido` restaura el modal con ese perfume. La ruta nativa ofrece
el mismo flujo a través de `PurchaseDialog.astro` y `order-purchase.ts`; `#comprar` restaura su estado.
Sin JavaScript permanece un enlace «Comprar» al WhatsApp configurado y el catálogo vuelve al flujo.

«Continuar en WhatsApp» crea el borrador codificado para que el cliente revise y envíe allí. El sitio
no envía mensajes automáticamente, no guarda datos personales de forma persistente, no reserva
existencias ni autoriza pagos. El destino procede de `contact.ts`; no se introducen SDKs o servicios.

## Archivos principales

| Archivo o módulo                          | Cambio                                                          |
| ----------------------------------------- | --------------------------------------------------------------- |
| `data/products.ts`                        | Identidades, capacidades confirmadas y composición comercial    |
| `data/product-research.ts`                | Información contrastada y enlaces de fuentes                    |
| `data/product-images.ts`                  | Imágenes responsive públicas                                    |
| `ProductSources.astro`                    | Atribución visible de información técnica                       |
| `PerfumeReading.astro`                    | Lectura breve y acción «Comprar»                                |
| `ProductDetail.astro`                     | Explicación completa y compra desde ruta nativa                 |
| `CatalogBook.astro` / `pages/index.astro` | Título retirado y composición del diálogo                       |
| `features/orders/`                        | Modal compacto, formulario compartido y estado de compra nativa |
| `motion/book-scene.ts`                    | Coordinación de la fase ordering con el mismo libro             |

## Verificación y pendientes

La ejecución final confirmó tipos sin errores en86 archivos,110 unitarios en15 archivos y88
pruebas E2E en Chromium escritorio/móvil, aproximadamente1.1min. La revisión visual del modal y
del libro registra la misma geometría, con diferencia0px. El presupuesto pasó sin elevar límites:
JS gzip122873bytes, CSS gzip9197bytes y HTML máximo35373bytes. No se añadieron dependencias.

Lighthouse móvil de esta revisión: rendimiento99, accesibilidad100, buenas prácticas100 ySEO66
(noindex intencional); LCP1882ms, CLS0 yTBT0. Informe en `reports/catalog-research/performance/`.
La revisión visual conserva doce capturas de catálogo y lectura, y las capturas del modal en
`reports/purchase-modal/`. Resultados y límites finales en
[validación](validation.md). No se afirma Safari/Firefox, hardware móvil físico o INP de campo a
partir de Chromium local. Permanecen pendientes los SKU y disponibilidad locales y la revisión
visual de esta entrega; no hubo despliegue ni conversaciones reales de WhatsApp.
