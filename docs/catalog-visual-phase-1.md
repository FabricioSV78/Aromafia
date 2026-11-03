# Catálogo editorial — fase 1

Estado: **planificación terminada; implementación pendiente de continuar**.
Fecha: 2 de noviembre de 2026. Este documento recoge el nuevo brief visual y los contactos
facilitados por el usuario. Esta fase no crea el catálogo ni modifica la interfaz existente.

## 1. Integración con la base

Se conserva Astro estático + React por islas + TypeScript estricto, el repositorio público del
catálogo, CSS por capas, tokens y el motor GSAP diferido. No hacen falta dependencias nuevas.
El nuevo brief especifica la experiencia visual antes aplazada en AGENTS.md; su instrucción
final exige detenerse tras esta fase de planificación. Las fases 2–7 no se ejecutan todavía.

| Ya existe                                        | Reutilización / adaptación prevista                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| BaseLayout, PageHead, configuración SEO y robots | Documento semántico y metadatos por producto; conservar noindex hasta publicar contenido aprobado |
| Container y Button                               | Primitivas; enlaces nativos para navegación, botones para acciones                                |
| Tokens crema/tinta/oro/rojo y CSS por capas      | Base visual, escalas, foco, estados y contraste                                                   |
| CatalogProduct, variantes, dinero PEN y notas    | Ampliar campos editoriales y explicitar contenido desconocido                                     |
| CatalogRepository y adaptador local              | Consultas públicas en build/servidor; componentes reciben solo datos públicos                     |
| Catálogo local vacío                             | Incorporar los seis perfumes en fase 2 con estado de revisión explícito                           |
| mountScene / useMotionScene y carga GSAP         | Entrada sutil y zoom de apoyo; limpieza propia y reduced motion                                   |
| Vitest, Playwright, axe y presupuestos           | Ampliar pruebas sobre los nuevos comportamientos                                                  |
| PNG y animación aprobados                        | Referencias intactas, actualmente en pantalla_inicial/; no intro obligatorio                      |

Incidencia detectada: `docs/original-assets.json` apuntaba a archivos en la raíz que ahora están
en `pantalla_inicial/`. Se comprobaron los hashes SHA256 y tamaños contra el manifiesto previo:
ambos coinciden. Se corrigen únicamente sus rutas, sin mover archivos ni recalcular la referencia
para aceptar una imagen distinta. La documentación antigua que menciona la raíz se actualizará
al cerrar la siguiente fase; este documento registra la ubicación observada.

## 2. Concepto visual propuesto

**Un libro de perfumes de AROMAFIA**: tres dobles páginas para seis fragancias en escritorio,
con imágenes protagonistas, nombres con presencia editorial, precios claros, folios funcionales
y una separación central que sugiera el lomo. Los folios corresponden a páginas reales del catálogo,
no a numeración decorativa. El contenido permanece en el documento y se recorre con scroll nativo.

En móvil, cada hoja se convierte en una composición vertical de ancho completo. No habrá libro3D,
paso de página pesado, desplazamiento secuestrado ni controles que obliguen a arrastrar.
La lectura del precio y el acceso al pedido tendrán prioridad sobre los efectos.

```text
Escritorio                         Móvil
Marca / catálogo / contacto         Marca / acceso al catálogo
Eslogan y mensajes de confianza     Eslogan y mensajes de confianza
┌────────────────┬────────────────┐ ┌───────────────────────────┐
│ Perfume 01     │ Perfume 02     │ │ Perfume 01                │
│ imagen / nombre│ imagen / nombre│ │ imagen / nombre / precio  │
│ precio / enlace│ precio / enlace│ │ Ver perfume               │
└────────────────┴────────────────┘ └───────────────────────────┘
Dobles páginas 02 y 03              Perfumes 02–06 en secuencia
Pedido / redes / pie                Pedido / redes / pie
```

Se mantienen los colores `#f0e8d5` (crema), `#10100f` (tinta), `#b8893a` (oro decorativo),
`#775019` (oro oscuro legible), `#a81e24` (acento) y `#fffdf7` (papel).
Los títulos usarán la familia serif del sistema de diseño y el cuerpo su sans legible;
no se descargará una fuente ni se atribuirá una tipografía al logo sin verificarla.
No se fuerza el rojo como protagonista ni se añaden adornos genéricos de lujo.

La llama se incorpora mediante el recurso aprobado, respetando su proporción completa.
No se separan capas, reconstruyen ilustraciones ni generan nuevos personajes.
Los derivados responsive, si hacen falta, se crean conservando el original y revisando su calidad.

## 3. Navegación y detalle con zoom

- Inicio con catálogo en `/`; fichas estáticas con URL propia `/perfumes/[slug]/`.
- Cada hoja contiene un enlace real al detalle: funciona sin JavaScript, permite abrir otra pestaña
  y mantiene un destino compartible. No se convierte todo el sitio en una aplicación React.
- En navegadores compatibles, transición progresiva entre documentos del mismo origen con la imagen
  del perfume como elemento compartido. El zoom será breve, aproximadamente250–400ms, con transform
  y opacity; solo el elemento seleccionado participa, sin nombres de transición duplicados.
- La compatibilidad de View Transitions se verificará durante la implementación. Si no está disponible,
  se conserva la navegación nativa y puede usarse una entrada sutil de GSAP en el destino.
  Reduced motion elimina el desplazamiento/zoom. No se instala otro motor ni se espera a una animación
  para permitir navegar. No es necesario introducir ClientRouter para este planteamiento inicial.
- El detalle muestra imagen principal dominante, información del perfume y referencia/inspiración
  en un bloque menor. En móvil la referencia nunca desplaza el precio o CTA principal.
- Habrá regreso al catálogo y al perfume de origen mediante ancla estable; se comprobarán atrás/adelante,
  foco y posición de lectura. No se usa modal como único acceso al detalle.

Fuentes técnicas consultadas: [View Transitions entre documentos](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using),
[transiciones de Astro](https://docs.astro.build/en/guides/view-transitions/).
El mecanismo es una mejora progresiva; no se promete el mismo efecto en todos los navegadores.

## 4. Contenido confirmado

### Productos

Los importes suministrados son precios de oferta/vigentes, almacenados como céntimos enteros PEN.
Los nombres se conservan exactamente; no se deduce una variante o fabricante por coincidencia textual.

| Orden | Nombre recibido | Oferta | Céntimos PEN | Slug propuesto |
| ----- | --------------- | ------ | ------------ | -------------- |
| 1     | 9PM             | S/150  | 15000        | 9pm            |
| 2     | Hawas Ice       | S/185  | 18500        | hawas-ice      |
| 3     | Mandarine       | S/149  | 14900        | mandarine      |
| 4     | Khamrah Qahwa   | S/160  | 16000        | khamrah-qahwa  |
| 5     | Hawas Malibu    | S/189  | 18900        | hawas-malibu   |
| 6     | Royale Opal     | S/115  | 11500        | royale-opal    |

Mensajes comerciales indicados por el usuario: **100% originales**, **contraentrega en Trujillo
y Chiclayo**, **envíos a todo el Perú**. No se añaden plazos, tarifas, garantía, stock ni envío gratis.

### Contactos

| Canal     | Dato recibido / destino previsto                                                                 |
| --------- | ------------------------------------------------------------------------------------------------ |
| WhatsApp  | 955565209; normalización prevista51955565209, usando prefijo peruano+51 por el contexto de marca |
| Instagram | @aromafia.pe; enlace de perfil derivado: https://www.instagram.com/aromafia.pe/                  |
| Facebook  | https://www.facebook.com/share/1BPHwsBwgb/                                                       |
| TikTok    | https://www.tiktok.com/@aromafia.pe?is_from_webapp=1&sender_device=pc                            |

Se conservarán las URLs proporcionadas; no se sustituye Facebook por un usuario supuesto.
Los enlaces están registrados para implementación, no se ha comprobado titularidad, disponibilidad
o recepción del número ni se ha enviado ningún mensaje. Toda esta configuración vivirá en un único
módulo público editable en fase 2, sin literales repetidos en componentes.

## 5. Datos faltantes y política de placeholders

| Campo                                        | Estado y tratamiento previsto                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Marca/fabricante y variante exacta           | Pendiente; no inferir especialmente en nombres ambiguos como Mandarine o Royale Opal                                                   |
| Capacidad, concentración y SKU               | Pendientes; permitir estado desconocido, nunca inventar100ml ni un SKU comercial para pasar validación                                 |
| Fotografías principales/galería              | Pendientes; placeholder neutral explícito, sin hacer pasar una botella genérica por el producto real                                   |
| Notas top/heart/base                         | Pendientes; arrays vacíos y estado de revisión, sin descripciones olfativas improvisadas                                               |
| InspiredBy / dupeOf y foto de referencia     | Pendientes; relación opcional revisada, sin afirmar equivalencias no confirmadas ni confundir la marca real con la referencia olfativa |
| Precio anterior                              | Pendiente; preparar propuesta editable separada de un precio anterior confirmado                                                       |
| Disponibilidad                               | unknown; consulta por WhatsApp, sin prometer stock                                                                                     |
| Descripción y clasificación                  | Pendientes; solo copy de presentación aprobado o neutral sin atributos del perfume inventados                                          |
| Destacados, badges o promociones adicionales | No inferir; solo los mensajes comerciales confirmados y precios recibidos                                                              |
| Dominio y publicación                        | No facilitados; mantener noindex y no desplegar                                                                                        |

El brief permite generar precios anteriores editables. En fase 2 se podrán guardar propuestas
claramente marcadas `proposed` en la capa de edición; no se presentarán al comprador como historial
real ni se emitirán en schema antes de confirmación. La vista de precio tachado se preparará para
datos confirmados y se probará con fixtures identificados. No se impondrá un porcentaje de descuento
ni una fecha de promoción ficticios para adaptar el modelo.

El modelo existente exige marca, descripción, imágenes y variantes con capacidad/SKU. La fase 2
debe adaptar esas restricciones de forma explícita para datos incompletos y separar revisión de
contenido de publicación. No se usará una segunda lista improvisada para eludir el repositorio,
ni se enviarán borradores o propuestas privadas a props del cliente.

Se conservarán `top`, `heart`, `base` como tres capas de notas; las etiquetas editoriales propuestas
son Entrada, Corazón y Fondo. El brief también dice Salida: se registrará ese término como etiqueta
a revisar, sin inventar una cuarta familia o duplicar datos para aparentar notas completas.

## 6. Mapa de archivos para las siguientes fases

Las rutas de esta tabla son **previstas**, todavía no creadas/modificadas en la aplicación.

| Archivo o módulo                                                                            | Acción / responsabilidad                                                                   | Fase |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| src/features/catalog/domain/product.ts                                                      | Ampliar modelo: displayName, referencia, copy/SEO/orden y campos pendientes explícitos     | 2    |
| src/features/catalog/domain/catalog-validation.ts                                           | Ajustar validación sin inventar datos; seguir filtrando no publicados                      | 2    |
| src/features/catalog/domain/variant-price.ts                                                | Precio vigente y referencia anterior nullable; conservar reglas de promociones verificadas | 2    |
| src/features/catalog/data/products.ts                                                       | Dataset único de los seis perfumes                                                         | 2    |
| src/features/catalog/services/catalog.server.ts                                             | Mantener composición servidor; derivar información pública de presentación                 | 2    |
| src/config/contact.ts                                                                       | Número internacional y enlaces sociales centralizados                                      | 2    |
| docs/catalog-content.md                                                                     | Cómo editar campos y lista de pendientes por producto                                      | 2    |
| src/components/brand/BrandMark.astro                                                        | Recurso de marca proporcionado, sin alteración del personaje                               | 3    |
| src/components/layout/SiteHeader.astro, SiteFooter.astro                                    | Navegación y redes visibles                                                                | 3    |
| src/components/shared/TrustStrip.astro, SocialLinks.astro                                   | Mensajes confirmados y enlaces con nombres accesibles                                      | 3    |
| src/features/catalog/components/CatalogBook.astro, CatalogSpread.astro                      | Composición de páginas y adaptación a móvil                                                | 3    |
| src/features/catalog/components/PerfumePage.astro, ProductPrice.astro                       | Hoja de perfume, precio y enlace real; sin conocimiento de almacenamiento                  | 3    |
| src/features/catalog/styles/catalog.css                                                     | Estilo editorial acotado y estados hover/focus                                             | 3    |
| src/pages/index.astro                                                                       | Componer el catálogo a partir del servicio                                                 | 3    |
| src/pages/perfumes/[slug].astro                                                             | Generar detalles desde productos públicos; SEO y404 coherentes                             | 4    |
| src/features/catalog/components/ProductDetail.astro, FragranceNotes.astro, InspiredBy.astro | Jerarquía de imagen principal, referencia menor, notas y CTA                               | 4    |
| src/motion/catalog-scene.ts, product-scene.ts, product-transition.css                       | Entrada/zoom progresivos, preferencias y limpieza propia                                   | 3–4  |
| src/features/orders/domain/order-request.ts                                                 | Contrato de solicitud, validación y límites de campos                                      | 5    |
| src/features/orders/services/whatsapp.ts                                                    | Construir mensaje y enlace seguro desde datos validados                                    | 5    |
| src/features/orders/components/OrderForm.astro, order-form.ts                               | Formulario semántico y mejora cliente pequeña; React solo si su estado lo justifica        | 5    |
| src/design/tokens.css, global.css; BaseLayout y PageHead                                    | Extensiones necesarias, sin rehacer el sistema base                                        | 3–6  |
| tests/unit/catalog.test.ts, pricing/whatsapp tests                                          | Variantes, datos pendientes, precios confirmados y mensaje codificado                      | 2–5  |
| tests/e2e/catalog.spec.ts, product-detail.spec.ts, order.spec.ts                            | Navegación, retorno, móvil, reduced motion, formulario y destinoWhatsApp                   | 3–7  |
| AGENTS.md, README.md y docs de catálogo/validación                                          | Actualizar fase vigente, rutas y guía de edición; preservar límites arquitectónicos        | 2–7  |

No todos los componentes requieren hidratación ni un archivoJS. Se evitarán abstracciones que no
sean compartidas; el mapa puede simplificarse al implementar sin mezclar datos, motion y UI.
Los módulos orders construyen una consulta comercial, no un pedido persistido ni un checkout.

## 7. Flujo de consulta a WhatsApp

1. Elegir perfume desde el detalle o selector del formulario.
2. Introducir nombre, teléfono, ciudad y comentario opcional. Campos con labels, autocomplete,
   límites y validación; producto preseleccionado y editable cuando corresponda.
3. Mostrar CTA claro «Continuar en WhatsApp»; validar y generar el mensaje con utilidad independiente.
4. Navegar al destino configurado con el texto codificado. No envío automático: el usuario revisa
   y confirma el mensaje en WhatsApp. No afirmar que el pedido ya se registró o confirmó.
5. No guardar datos en localStorage, analítica, logs o un backend. Avisar junto al CTA que los datos
   se incluirán en WhatsApp. Mantener alternativa de contacto directo si JavaScript falla.

El mensaje incluye producto confirmado, nombre, teléfono, ciudad y comentario si existe.
Precio/stock quedan sujetos a confirmación por la marca. Las pruebas interceptarán el enlace:
no abrirán conversaciones reales ni enviarán mensajes. No hay pagos, carrito ni panel administrativo.

## 8. Secuencia y criterios para avanzar

| Fase | Resultado y validación antes de continuar                                                            |
| ---- | ---------------------------------------------------------------------------------------------------- |
| 1    | Auditoría, mapa de módulos, contenido confirmado/pendiente y este plan; detenerse aquí               |
| 2    | Modelo/dataset/configuración; tests de datos, precios, publicación y typecheck                       |
| 3    | Catálogo editorial visible; responsive320px/tablet/escritorio, teclado y build                       |
| 4    | Detalles directos y zoom; probar clic, atrás/adelante, sinJS, reduced motion y cleanup               |
| 5    | Formulario y WhatsApp; validar mensaje, caracteres especiales, selección y errores sin envíos reales |
| 6    | Refinamiento y auditoría de accesibilidad, red, LCP/CLS y bundle sobre el contenido implementado     |
| 7    | typecheck, lint, formato, tests, build, budgets, integridad y guía de edición; sin despliegue        |

Al final de cada fase se informará qué se hizo, archivos afectados, decisiones, comprobaciones,
pendientes y preparación de la siguiente. La implementación solo empezará después de la revisión
del plan solicitada al final del brief. El contenido faltante no bloquea la estructura técnica;
sí limita qué información puede presentarse como confirmada al comprador.

## 9. Cierre de esta fase

- Archivos de implementación revisados, sin cambios de UI, datos o dependencias.
- Los44 tests unitarios existentes pasan en la revisión actual. Typecheck y lint correctos; build estático completado sin errores.
- Los dos recursos aprobados coinciden con sus hashes anteriores; se corrigen rutas del manifiesto.
- Plan y referencias de compatibilidad documentados; no se ha construido ni probado todavía el
  catálogo futuro. Los resultados de la base en docs/validation.md siguen siendo un informe histórico.
- Fase 1 lista. Próximo trabajo: fase 2, modelo/datos y configuración de contacto.
