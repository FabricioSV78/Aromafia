# Investigación de producto: Lattafa, Armaf y Zakat

Consulta: **2 de noviembre de 2026**, zona America/Lima. Este documento registra fuentes y
propuestas; no confirma inventario, SKU ni disponibilidad. Durante esta tarea el propietario
confirmó Khamrah Qahwa100ml, Armaf Odyssey Mandarin Sky100ml y Zakat Royale Opal80ml. Esa
confirmación del usuario, y no una ficha ajena, respalda las capacidades de las ofertas locales.
La investigación no modifica el dataset ni los precios.

## Khamrah Qahwa — identidad verificada

La [ficha del fabricante Lattafa](https://lattafa.com/product/khamrah-qahwa/) identifica Khamrah
Qahwa como unisex y presenta una referencia de100ml. Su contenido indexado publica estas notas:

- Entrada: jengibre, canela y cardamomo.
- Corazón: praliné, frutas confitadas y flores blancas.
- Fondo: café arábica, haba tonka, almizcle, benjuí y vainilla.

La ficha directa devuelve403 al navegador de investigación; la pirámide se contrastó con la
[tienda regional Lattafa USA](https://www.lattafa-usa.com/products/khamrah-qahwa), cuyo título
identifica100ml EDP y cuyo contenido coincide en las notas. No se trasladan los precios ni el
estado de existencias de esa tienda al catálogo local.

El [distribuidor autorizado europeo](https://lattafaparfum.eu/products/khamrah-qahwa) publica un
perfil gourmand con café y vainilla y declara en el pie su condición de distribuidor autorizado
de Lattafa, operado por Rney Holdings B.V. Es una fuente comercial regional, no el fabricante.

Campos propuestos, con redacción propia:

```ts
brand: { id: 'lattafa', name: 'Lattafa' },
classification: 'unisex',
shortDescription: 'Especias cálidas, praliné y café arábica.',
description: 'Jengibre, canela y cardamomo abren una composición de praliné, frutas confitadas y flores blancas, con un fondo de café arábica y vainilla.',
notes: {
  top: ['Jengibre', 'Canela', 'Cardamomo'],
  heart: ['Praliné', 'Frutas confitadas', 'Flores blancas'],
  base: ['Café arábica', 'Haba tonka', 'Almizcle', 'Benjuí', 'Vainilla'],
},
```

La familia Gourmand y concentración Eau de Parfum están respaldadas por las fuentes regionales;
la capacidad100ml publicada coincide con la presentación confirmada posteriormente por el
propietario. No se afirma equivalencia o inspiración con otra fragancia.

### Fotografía descargada

- Archivo: `src/assets/perfumes/khamrah-qahwa-source.png`.
- [URL exacta de procedencia](https://lattafaparfum.eu/cdn/shop/files/LattafaKhamrahQahwa_1.webp?v=1777206373&width=1600).
- Descargada el2de noviembre de2026.1100×1100px;777225bytes; PNG RGBA con transparencia.
- El servidor devuelve PNG aunque la URL termine en`.webp`; el archivo se nombró según su formato
  real. Se conservaron los bytes originales, sin recortar, deformar ni quitar fondos.
- Se inspeccionó visualmente: botella frontal con etiqueta Khamrah Qahwa / Lattafa. Adecuada para
  una imagen de producto con `object-fit:contain`; cualquier derivado responsive debe registrar
  su formato/calidad y no exceder los1100px de la fuente. La consulta no acredita una licencia
  comercial independiente de reutilización.

## Mandarin Sky — Armaf Odyssey, confirmado por el propietario

El propietario aclaró que «Mandarine» corresponde a **Armaf Odyssey Mandarin Sky100ml**. El
nombre inicial por sí solo era ambiguo: también existe Mandarine de Widian. No se dedujo la
identidad del precio de S/149.

La [tienda oficial de Armaf en Emiratos](https://www.armaf.ae/products/odyssey-mandarin-sky-man)
se identifica como operada por Sterling Perfumes Industries. Publica masculino, Eau de Parfum,
100ml y perfil ámbar-amaderado. Campos propuestos, con redacción propia:

```ts
brand: { id: 'armaf', name: 'Armaf' },
classification: 'men',
olfactoryFamilies: ['Ambarada', 'Amaderada'],
shortDescription: 'Mandarina, caramelo y un fondo amaderado.',
description: 'Mandarina y naranja se unen a salvia y azafrán; el corazón combina caramelo, haba tonka y tagetes, sobre vetiver, cedro y ambroxan.',
notes: {
  top: ['Salvia', 'Mandarina', 'Naranja', 'Azafrán'],
  heart: ['Caramelo', 'Haba tonka', 'Tagetes'],
  base: ['Vetiver', 'Cedro', 'Ambroxan'],
},
```

### Fotografía descargada

- Archivo: `src/assets/perfumes/mandarin-sky-source.jpg`.
- [URL de la tienda oficial](https://www.armaf.ae/cdn/shop/products/odysseymandarinsky-bottle.jpg?v=1639051332&width=1400).
- JPEG1200×1200px,71287bytes, sin canal alpha; descargado el2de noviembre de2026.
- Inspección: botella azul con tapa naranja y etiqueta Odyssey Mandarin Sky / Eau de Parfum.
  Conserva fondo blanco y composición de la fuente. Sin edición, recorte o deformación.
- No ampliar derivados por encima de1200px; usar `object-fit:contain`. La consulta no acredita
  una licencia comercial independiente de reutilización.

## Royale Opal — Zakat80ml, confirmado por el propietario

El propietario confirmó **Zakat Royale Opal80ml**. La capacidad local queda resuelta por esa
confirmación aunque algunos comerciantes publiquen100ml. No se traslada su precio o stock.

Dos fichas comerciales independientes publican la misma pirámide detallada:
[Blomster USA](https://www.blomsterusa.com/en/products/royale-opal-by-zakat) y
[Kingdom Fragrances](https://kingdomfragrances.com/products/zakat-royale-opal-2-7oz-edp).
Ambas identifican Zakat/Eau de Parfum. [Eastern Perfume](https://easternperfume.com/products/zakat-royale-opal-edp-2-7-u)
y [su listado en Faire](https://www.faire.com/product/p_52kwux4g4m) corroboran unisex y80ml.
Son fuentes de comerciantes, no una publicación del fabricante localizada con certeza. La familia
ámbar-vainilla está descrita por Kingdom; no se presenta como una taxonomía oficial del fabricante.

```ts
brand: { id: 'zakat', name: 'Zakat' },
classification: 'unisex',
olfactoryFamilies: ['Ambarada', 'Avainillada'],
shortDescription: 'Especias, dátiles y vainilla con fondo ambarado.',
description: 'Canela, nuez moscada y bergamota abren una composición de dátiles, praliné y flores, con un fondo de vainilla, haba tonka y acordes amaderados.',
notes: {
  top: ['Canela', 'Nuez moscada', 'Bergamota'],
  heart: ['Dátiles', 'Praliné', 'Nardos', 'Mahonial'],
  base: ['Vainilla', 'Haba tonka', 'Mirra', 'Benjuí', 'Amberwood', 'Akigalawood'],
},
```

No se adopta la comparación con Kilian de algunas tiendas: no prueba una inspiración declarada.
`zakatfragrances.net` vende otra gama de aceites y no acredita ser la casa de la colección Royale.

### Fotografías descargadas y vistas

| Archivo                                              | Fuente                                                                                             | Formato real | Dimensiones | Bytes | Composición                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------ | ----------- | ----- | -------------------------------------------------- |
| `src/assets/perfumes/royale-opal-source.jpg`         | [Blomster](https://www.blomsterusa.com/cdn/shop/files/Royale_opal_wht.jpg?v=1705501154&width=1946) | JPEG         | 432×400     | 15906 | Botella y caja sobre blanco                        |
| `src/assets/perfumes/royale-opal-kingdom-source.jpg` | [Kingdom](https://kingdomfragrances.com/cdn/shop/files/OPAL.webp?v=1688193323)                     | JPEG         | 600×424     | 57728 | Botella y caja; fondo publicitario con marca Zakat |

Descargadas el2de noviembre de2026 y conservadas sin edición. En ambas se reconoce la botella
blanca, tapa de águila y caja Royale Opal; en la de Kingdom se ve la marca Zakat y el envase80ml.
La fuente Kingdom devuelve JPEG aunque su URL termine en`.webp`. No sobreescalar por encima de
su resolución nativa. La fuente blanca es más neutra para el libro; la segunda permite verificar
mejor la identificación. La consulta no acredita una licencia comercial independiente.
