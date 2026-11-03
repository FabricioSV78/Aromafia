# Referencias olfativas y tercera fotografía

**Revisión: 3 de noviembre de 2026.** El propietario pidió recuperar la zona de referencia y usar
tres imágenes por producto: general, detalle y perfume de comparación. Para Mandarin proporcionó
el archivo `public/images/perfumes/Mandarin Sky/3.png`, que muestra Scandal Pour Homme de Jean Paul
Gaultier. Esa fotografía se integra por separado de las dos fotografías del perfume vendido.

## Alcance de la comparación

Las parejas siguientes están explícitamente descritas en dos comercios independientes. Son
comparaciones editoriales de perfil olfativo: usar `relation: 'similar_to'`, con un rótulo como
«Alternativa olfativa a». No se encontró una declaración de colaboración o inspiración oficial de
los fabricantes. No publicar porcentajes de equivalencia, rendimiento idéntico, afiliación entre
marcas ni precios de otros comercios como precios de AROMAFIA.

| Perfume vendido              | Referencia                              | Evidencias comerciales                                                                                                                                                                                                                                                                                  |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9 pm — Afnan                 | Ultra Male — Jean Paul Gaultier         | [Multimarcas](https://multimarcasperfumes.cl/products/9-pm-edp-100-ml-afnan) identifica expresamente Ultra Male; [Silk Perfumes](https://silkperfumes.cl/products/afnan-9pm-hombre-edp-100ml) recoge la misma comparación.                                                                              |
| Hawas Ice — Rasasi           | Invictus Aqua — Rabanne                 | [Fordgate Pharmacy](https://fordgatepharmacy.com.au/shop/hawas-ice-edp-100ml-rasasi/) y [Perfume Cartel](https://www.perfumecartel.com.au/products/rasasi-hawas-ice) identifican Invictus Aqua. No especificar año como si existiera consenso sobre la edición.                                         |
| Odyssey Mandarin Sky — Armaf | Scandal Pour Homme — Jean Paul Gaultier | Imagen de referencia aportada por el propietario y [Silk Perfumes](https://silkperfumes.cl/collections/perfumes-arabes), que identifica Scandal Pour Homme para Mandarin Sky.                                                                                                                           |
| Khamrah Qahwa — Lattafa      | Angels’ Share — Kilian Paris            | [Multimarcas](https://multimarcasperfumes.cl/products/khamrah-qahwa-edp-100-ml-unisex-lattafa) y [Silk Perfumes](https://silkperfumes.cl/collections/perfumes-lattafa-khamrah) comparan expresamente Qahwa con Angels’ Share. Conservar la distinción: Qahwa tiene su propio perfil de café y especias. |
| Hawas Malibu — Rasasi        | Le Beau Le Parfum — Jean Paul Gaultier  | [Frag+Bar](https://fragbar.com/products/hawas-malibu-le-beau-le-parfum) describe similitud de estilo; [Multimarcas](https://multimarcasperfumes.cl/products/hawas-malibu-edp-100-ml-unisex-rasasi) identifica esa misma referencia. No confundir con Paradise Garden, que se asocia a Hawas Tropical.   |
| Zakat Royale Opal            | Angels’ Share — Kilian Paris            | [Kingdom](https://kingdomfragrances.com/products/zakat-royale-opal-2-7oz-edp) lo recomienda a aficionados de Angels’ Share; [Dubai Perfume Shop](https://dubaiperfumeshop.us/en/products/zakat-royale-opal-unisex-2-7-oz-edp-sp) describe explícitamente la comparación.                                |

Algunos buscadores devolvieron páginas de agregación con porcentajes incompatibles o afirmaciones
de inspiración oficial sin sustento. No se usan como evidencia. Algunas rutas históricas de
Perfumisimo devolvieron404 y Midas Touch respondió402; las fuentes finales de la tabla se eligieron
para no depender de esos resultados.

## Identidad y versiones de las fotografías

- **Ultra Male:** PNG transparente del sitio oficial de Jean Paul Gaultier. La ficha identifica
  Ultra Male Eau de Toilette Intense y el envase azul con franjas negras. [Ficha del fabricante](https://www.jeanpaulgaultier.com/fr/fr/p/gamme-le-male/ultra-male-eau-de-toilette-intense-000000000065119981).
- **Le Beau Le Parfum:** PNG transparente del sitio oficial de Jean Paul Gaultier. Corresponde a
  Eau de Parfum Intense, frasco oscuro con degradado y hoja dorada. [Ficha del fabricante](https://www.jeanpaulgaultier.com/eu/fr/p/gamme-le-beau/le-beau-le-parfum-eau-de-parfum-intense-000000000065180318).
- **Invictus Aqua:** fotografía de producto sobre fondo gris claro del sitio oficial de Rabanne.
  Es la presentación de la reedición vigente en su página, no una certificación visual de la
  edición2016 o2018. El propio fabricante documenta el lanzamiento2016, reformulación2018 y
  regreso2024. Se identifica únicamente «Invictus Aqua» en la comparación. [Ficha del fabricante](https://www.rabanne.com/uk/en_GB/fragrance/p/invictus-aqua--000000000065107891).
- **Angels’ Share:** fotografía de50ml de Harrods sobre fondo blanco, corroborada con la identidad
  de la [ficha oficial de Kilian](https://www.bykilian.com/product/19797/82905/perfume/angels-share/the-liquors).
  Se eligió este encuadre limpio frente a las imágenes de campaña y fondo negro del fabricante.
  [Ficha de Harrods](https://www.harrods.com/en-gb/p/kilian-angels-share-eau-de-parfum-50ml-000000000006720504).

Las fotos se inspeccionaron visualmente antes de derivarlas. No contienen carteles, dupe, precios,
notas ni controles añadidos; conservan las etiquetas originales del envase. Las referencias se
muestran más pequeñas que la fotografía principal y no están incluidas en la compra.

## Derivados y procedencia

Fuentes intactas en `src/assets/perfumes/inspirations/`. Diez WebP de referencia, dos por producto
distinto de Mandarin, se generaron con sharp0.35.5: calidad96, alfa100, esfuerzo6, metadata conservada,
redimensionado sin ampliación. No hubo recorte, recoloración, máscara raster, reconstrucción o
generación de frascos. Ultra Male y Le Beau conservan su alfa; Angels’ Share conserva su ICC de524bytes.
Los demás originales no contienen perfil ICC.

| Producto          | Archivo público                                    | Dimensiones       |
| ----------------- | -------------------------------------------------- | ----------------- |
| 9 pm              | `9pm-reference-v1-320.webp` / `640.webp`           | 320×400 / 640×800 |
| Hawas Ice         | `hawas-ice-reference-v1-320.webp` / `640.webp`     | 320×400 / 640×800 |
| Hawas Malibu      | `hawas-malibu-reference-v1-320.webp` / `640.webp`  | 320×400 / 640×800 |
| Khamrah Qahwa     | `khamrah-qahwa-reference-v1-320.webp` / `640.webp` | 320×364 / 640×727 |
| Zakat Royale Opal | `royale-opal-reference-v1-320.webp` / `640.webp`   | 320×364 / 640×727 |

Las rutas públicas comienzan en `/images/perfumes/`. Qahwa y Opal comparten la fuente real de
Angels’ Share, pero tienen rutas independientes para editar su tercer rol. Dimensiones, perfiles,
tamaños, URLs y SHA256 se conservan en [el manifiesto](inspiration-image-derivatives.json).

La consulta pública no acredita por sí sola una licencia comercial independiente ni autenticidad
del inventario local. Esta investigación no altera datos técnicos, capacidades, precios o stock de
AROMAFIA y no implica afiliación con las marcas citadas.
