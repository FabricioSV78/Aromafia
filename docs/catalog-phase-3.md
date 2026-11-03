# Catálogo editorial — cierre de fase 3

Fecha: **2 de noviembre de 2026**. Estado: **estructura visual del catálogo implementada**.
La fase 4 añadirá el detalle con zoom y URL propia; la fase 5 incorporará el formulario y mensaje
precargado. No se adelantaron esos flujos ni se añadieron enlaces a páginas inexistentes.

## Experiencia construida

- Portada como apertura editorial: eslogan protagonista y logo oficial completo, sin recortarlo,
  deformarlo o separar al personaje. No se usa la animación histórica como introducción obligatoria.
- Seis perfumes agrupados en tres dobles páginas a partir de1024px, con lomo, folios funcionales,
  índice de páginas y jerarquía de precio. Móvil/tablet usan hojas verticales y scroll nativo.
- Mensajes de100% originales, contraentrega en Trujillo/Chiclayo y envíos a todo el Perú desde commerce.ts.
- Contacto y redes visibles desde contact.ts. Cada hoja permite consultar en el WhatsApp configurado.
  El enlace es directo y genérico: no transmite todavía selección, nombre o teléfono del cliente.
- Fotografías y presentaciones faltantes aparecen como «por confirmar»; stock desconocido como
  «Disponibilidad a consultar». Las notas/inspiraciones no recibidas no se inventan.
- Los seis registros pasan de draft a published para el renderizado local, conservando revisión pending.
  Los borradores adicionales siguen protegidos; no se saltó el repositorio ni se publicó en Internet.
- Los precios anteriores no confirmados siguen excluidos. ProductPrice admite referencia confirmada
  y precio tachado cuando exista, usando el helper de precios preparado en fase2.

## Decisiones de diseño y arquitectura

Se conserva el vocabulario crema/tinta/oro del sistema existente. El lomo y las separaciones sugieren
el libro sin simulación3D ni librería de paso de páginas. La tipografía de sistema evita descargas
de fuentes; la serif editorial se acompaña de texto sans legible para información comercial.
El placeholder es una composición tipográfica identificada, no una ilustración inventada del frasco.

Todo se renderiza en Astro. No hay islas hidratadas, router cliente, dependencia nueva, WebGL ni
escena GSAP activa. La portada tiene una entrada CSS de520ms y los enlaces/hojas estados hover/focus;
reduced motion los desactiva. Las animaciones usan transform/opacity y no bloquean navegación.

El logo se transforma con astro:assets en WebP responsive de320/480/640px, conservando proporción1:1
y todo su contenido. Los derivados pesan aproximadamente11/20/31KB, frente al original de2.4MB.
El PNG y HTML aprobados siguen fuera del bundle. El control de build ahora detecta los originales
por hash, para permitir derivados optimizados aunque conserven parte del nombre de origen.

## Archivos principales

| Nuevos                                                                    | Responsabilidad                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------- |
| src/components/brand/BrandMark.astro                                      | Logo completo y optimización responsive         |
| src/components/layout/SiteHeader.astro, SiteFooter.astro, site-chrome.css | Navegación, contacto y pie con redes            |
| src/components/shared/TrustStrip.astro, SocialLinks.astro                 | Condiciones comerciales y canales configurados  |
| src/features/catalog/components/CatalogBook.astro                         | Encabezado, índice y agrupación de páginas      |
| src/features/catalog/components/CatalogSpread.astro                       | Doble página adaptable                          |
| src/features/catalog/components/PerfumePage.astro                         | Hoja individual, contenido pendiente y consulta |
| src/features/catalog/components/ProductPrice.astro                        | Precio confirmado y referencia opcional         |
| src/features/catalog/styles/catalog.css                                   | Estética editorial y adaptación responsive      |
| tests/e2e/catalog.spec.ts                                                 | Contratos visuales/funcionales del catálogo     |
| docs/catalog-phase-3.md                                                   | Este cierre                                     |

Modificados: index.astro compone la experiencia desde catalog.server; products.ts habilita los seis
registros para renderizado; check-build-budget.mjs distingue originales de derivados; unitarios de
catálogo/dataset y pruebas foundation se adaptan al nuevo estado. El paquete de identidad original
AROMAFIA_IDENTIDAD_VISUAL_DEFINITIVA se excluye de Prettier para conservar sus archivos sin reformatear.
También se excluye del watcher de desarrollo, evitando errores por archivos originales bloqueados
durante la copia del paquete; no afecta al logo importado desde pantalla_inicial/.
AGENTS.md, README y guías de datos,
arquitectura/motion se actualizaron. La nota del script de Lighthouse ahora describe el build actual,
sin afirmar que la pantalla sigue vacía. package.json y lockfile no cambiaron.

## Validación

| Comprobación                    | Resultado                                                                   |
| ------------------------------- | --------------------------------------------------------------------------- |
| Typecheck                       | 0 errores y advertencias                                                    |
| ESLint / Prettier               | Correctos                                                                   |
| Unitarios                       | 62 pruebas aprobadas en7 archivos                                           |
| Navegador Chromium              | 20 pruebas aprobadas en escritorio y móvil                                  |
| axe                             | Sin violaciones en los perfiles probados                                    |
| Responsive                      | 320/768/1440px; hojas verticales o dobles páginas según ancho               |
| Teclado                         | Enlace de salto, foco, anclas reales y recuperación de404 correctos         |
| Sin JavaScript / reduced motion | Contenido/precios/consulta disponibles; sin animaciones activas en reduced  |
| Imágenes                        | Logo cuadrado completo, medidas reservadas y derivados WebP responsive      |
| Presupuestos                    | HTML máximo21613bytes; CSS externo gzip3093bytes; JS emitido gzip68213bytes |
| Integridad                      | Hashes originales del PNG/HTML conservados                                  |

Se corrigió un defecto real de320px: el mínimo transferido por aspect-ratio de los placeholders
forzaba371px de ancho. El grid usa ahora minmax(0,1fr) y el elemento min-width:0/max-width:100%;
la comprobación posterior devuelve scrollWidth320 y ningún elemento fuera del ancho visible.
No se ocultó el desbordamiento global para disimularlo.

El runtime React emitido no implica descarga: no hay script de aplicación referenciado en la página.
No se repitió Lighthouse en esta fase; la auditoría de rendimiento/refinamiento corresponde a fase6.
Los presupuestos pasaron sin elevar umbrales. No se afirma validación Safari/Firefox, lector de pantalla
o hardware móvil real. Los enlaces externos se inspeccionaron sin abrir conversaciones ni enviar mensajes.

Capturas locales: reports/catalog-desktop.png, catalog-mobile-320.png y catalog-mobile-320-product.png.
Los informes/capturas no se incluyen en Git. Para revisar: npm run dev; en este PowerShell npm.cmd run dev.

## Qué falta

La fase3 está lista. Faltan imágenes y especificaciones reales para completar el contenido visual,
no para validar la estructura. El detalle, la inspiración secundaria y el zoom se implementarán en
fase4; el formulario y el mensaje de WhatsApp con datos del cliente, en fase5.
No se conectó infraestructura, no se contrataron servicios y no se desplegó el proyecto.
