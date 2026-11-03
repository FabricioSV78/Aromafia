# Catálogo editorial — cierre de fase 2

Fecha: **2 de noviembre de 2026**. Estado: **modelo, datos y contactos preparados**.
La interfaz sigue siendo la pantalla mínima. No se implementaron aún catálogo visual, detalle,
formulario, transiciones nuevas ni redirección con datos del cliente.

## Qué se hizo

- Se incorporaron los seis nombres y precios de oferta suministrados, en céntimos PEN y en el orden
  del brief:9PM15000, Hawas Ice18500, Mandarine14900, Khamrah Qahwa16000, Hawas Malibu18900,
  Royale Opal11500. No se dedujeron marcas, capacidades, notas ni inspiraciones.
- Se ampliaron los modelos con nombre editorial, referencia olfativa, orden, badges, SEO y nombre
  para WhatsApp, manteniendo el dinero y las variantes existentes.
- Los datos desconocidos usan null/arrays vacíos y reviewStatus pending. Los seis productos se
  guardaron como draft y no salen por list/getBySlug públicos. La revisión del contenido no altera
  la publicación y la publicación no convierte automáticamente el contenido en completo.
- priceKind offer identifica la oferta recibida sin fechas ficticias. regularPrice queda null hasta
  confirmar un anterior. Se conservan las promociones temporales existentes y sus límites de fecha.
- Las seis propuestas editables de anterior viven en un archivo de autoría separado, con estado
  proposed. No se importan a la composición pública ni se mezclan con precios confirmados.
- WhatsApp51955565209, Instagram y las URLs exactas de Facebook/TikTok están en contact.ts;
  originalidad y condiciones generales de entrega están en commerce.ts, sin tarifas/plazos inventados.
- Se reconciliaron instrucciones/documentación con la fase actual y con los recursos originales
  ubicados en pantalla_inicial/.

## Archivos nuevos

| Ruta                                         | Responsabilidad                                           |
| -------------------------------------------- | --------------------------------------------------------- |
| src/config/contact.ts                        | Contactos públicos centralizados y tipados                |
| src/config/commerce.ts                       | Mensajes comerciales autorizados                          |
| src/features/catalog/data/price-proposals.ts | Propuestas privadas y validación de referencias           |
| tests/unit/contact.test.ts                   | Número internacional y destinos exactos                   |
| tests/unit/catalog-data.test.ts              | Contrato del dataset, pendientes, borradores y propuestas |
| docs/catalog-content.md                      | Guía de edición y confirmación de contenido               |
| docs/catalog-phase-2.md                      | Este cierre de fase                                       |

## Archivos modificados

| Ruta                                                          | Cambio                                                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| src/features/catalog/domain/product.ts                        | Campos editoriales, revisión, referencias y valores desconocidos explícitos       |
| src/features/catalog/domain/catalog-validation.ts             | Validar datos presentes y contenido confirmado, conservando pendientes            |
| src/features/catalog/domain/variant-price.ts                  | Preparación de precio público y ofertas sin fechas                                |
| src/features/catalog/domain/catalog-repository.ts             | Orden editorial y significado de filtro de ofertas                                |
| src/features/catalog/repositories/local-catalog-repository.ts | Búsqueda con null, orden editorial y filtro de ofertas                            |
| src/features/catalog/data/products.ts                         | Dataset inicial de seis borradores                                                |
| tests/unit/catalog.test.ts                                    | Casos nuevos y fixtures adaptados, conservando pruebas de variantes y promociones |
| AGENTS.md                                                     | Estado de fase, recursos y reglas de datos/precios/contactos                      |
| README.md                                                     | Organización y documentación de la etapa actual                                   |
| docs/catalog.md                                               | Contratos actualizados                                                            |
| docs/architecture.md                                          | Actualización de estado sin cambiar arquitectura                                  |
| src/assets/README.md                                          | Ubicación actual de recursos originales                                           |

No se cambió package.json ni package-lock.json y no se añadieron dependencias.
No se modificaron páginas, estilos, motion ni el contenido de los recursos aprobados.

## Decisiones importantes

1. **Borradores primero:** cargar datos no autoriza exponer campos no confirmados como hechos.
   La fase3 podrá publicar fichas con los placeholders explícitos previstos, sin saltarse el repositorio.
2. **Precio vigente separado de comparación:** oferta no exige precio anterior. Las propuestas
   preparan edición y diseño, no prueban ventas anteriores. Solo referencias confirmadas van a la UI.
3. **Modelo existente ampliado:** no se creó un catálogo paralelo ni se acopló la fuente a componentes.
   La primera imagen es la principal y el resto la galería, sin duplicación de campos.
4. **Sin inventar identificación comercial:** los IDs técnicos no son SKU ni certifican presentación.
5. **Contacto sin envío:** se prepararon enlaces públicos; no se enviaron mensajes ni se verificó
   recepción/titularidad. La construcción del mensaje de pedido corresponde a fase5.

## Validaciones

- Unitarios: **61 pruebas aprobadas en7 archivos**, con casos de nombres/precios exactos, borradores
  protegidos, contenido nullable, orden editorial, precios de la misma variante, ofertas sin fecha,
  promociones temporales, comparación confirmada, propuestas separadas y contactos exactos.
- Typecheck Astro + TypeScript: sin errores ni advertencias.
- ESLint y Prettier: correctos.
- Build estático: correcto, sin cambios de rutas ni UI.
- Presupuestos: HTML máximo4863bytes; JavaScript total emitido gzip68213bytes; CSS externo0.
- Integridad: PNG y HTML aprobados conservan sus hashes en pantalla_inicial/.

Los tests de navegador y Lighthouse no se repitieron porque no cambió la interfaz ni su arranque.
Los resultados de la base en validation.md permanecen como informe histórico, no se presentan como
una auditoría del futuro catálogo. No se desplegó ni conectó infraestructura.

## Pendientes y siguiente fase

Faltan fotografías, fabricante/presentación/SKU, notas, referencias olfativas y precios anteriores
confirmados. También siguen desconocidos stock y condiciones detalladas de envío. La estructura
ya admite editarlos; estos pendientes no exigen rehacer el modelo.

Fase2 lista. La **fase3** construirá el catálogo tipo libro, responsive, branding, mensajes de confianza
y redes, usando los modelos/configuración preparados y los placeholders explícitos donde falten datos.
La vista de detalle/zoom y el formulario se mantienen en sus fases4 y5 respectivas.
