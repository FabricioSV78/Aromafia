# Fase 4 — libro interactivo y detalle con zoom

Entrega local del **2 de noviembre de 2026**. Esta fase incorpora la corrección visual del usuario:
el libro ocupa una sola vista, «Abrir libro» abre físicamente la portada y cambiar de página hace
girar una hoja. Esta petición sustituye la lectura vertical propuesta en fase 3.

## Resultado

- Portada con el logo oficial completo, lomo, canto de papel, perspectiva y sombras.
- Apertura y cierre sobre el lomo; paso de hoja en ambas direcciones, sin desplazar la página web.
- Dos perfumes por vista desde 896px y uno en móvil/tablet. Controles Anterior, Siguiente y Cerrar.
- Detalle con zoom desde la hoja seleccionada, dentro de un diálogo. El principal ocupa más área
  que su referencia secundaria; aparecen precio, presentación, disponibilidad, notas y consulta.
- Seis rutas reales `/perfumes/{slug}/`, utilizables directamente y sin JavaScript.
- Estado compartible `#libro/N` o `#libro/N/perfume/slug`; recarga, Atrás, cierre y cambios de ancho
  conservan un estado coherente. El cierre devuelve el foco al perfume o a «Abrir libro».

No hay fotografías de producto aprobadas: se muestran sus nombres y «Fotografía por confirmar».
Notas, presentación e inspiración pendientes tienen mensajes explícitos. Los precios anteriores
propuestos siguen privados; no se presentan descuentos históricos como confirmados.
No se alteraron el PNG oficial ni el HTML v3 aprobado. No se añadieron dependencias.

## Archivos y responsabilidades

| Archivo                                                                     | Responsabilidad                                                            |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/pages/index.astro`                                                     | Composición del escenario, contactos y diálogo                             |
| `src/features/catalog/components/CatalogBook.astro`                         | Portada, hojas, controles y alternativa sin JS                             |
| `src/features/catalog/components/PerfumePage.astro`                         | Hoja pública y enlaces nativos al perfume                                  |
| `src/features/catalog/components/ProductDetail.astro`                       | Fragmento compartido por ruta y diálogo                                    |
| `src/features/catalog/components/FragranceNotes.astro`                      | Entrada, Corazón y Fondo, con pendientes explícitos                        |
| `src/features/catalog/components/InspiredBy.astro`                          | Referencia secundaria, sin asociaciones inventadas                         |
| `src/features/catalog/styles/catalog.css`                                   | Perspectiva, papel, composición responsive y estados finales               |
| `src/features/catalog/styles/product-detail.css`                            | Detalle responsive en página y diálogo                                     |
| `src/pages/perfumes/[slug].astro`                                           | Rutas estáticas desde el repositorio público y metadatos                   |
| `src/motion/book-state.ts`                                                  | Índices, hojas visibles y formato/lectura del hash                         |
| `src/motion/book-scene.ts`                                                  | Navegación, GSAP, solicitudes cancelables, diálogo, foco e historial       |
| `src/motion/scene.ts`                                                       | `run` registra callbacks posteriores en el contexto y omite los cancelados |
| `tests/unit/book-state.test.ts`, `tests/unit/motion.test.ts`                | Estado y ciclo de vida de efectos                                          |
| `tests/e2e/catalog.spec.ts`, `product-detail.spec.ts`, `foundation.spec.ts` | Comportamientos reales en navegador                                        |

El servicio y el adaptador de catálogo siguen en servidor/build. El cliente recibe HTML público,
solicita únicamente las rutas estáticas del mismo origen y almacena los fragmentos en memoria.
No importa el dataset ni las propuestas privadas de precios.

## Movimiento y acceso

La geometría se resuelve con CSS; GSAP se importa de forma diferida y anima transform/opacity.
No se usa ScrollTrigger, WebGL, scroll hijacking ni un bucle automático. La inclinación responde
al puntero fino y es pequeña; las acciones de portada y hojas duran aproximadamente un segundo.
Cada acción tiene un contexto propio que se revierte al completar o cancelar. Los clones de hojas
son decorativos, temporales, inert y sin IDs duplicados. Los estados CSS finales no dependen de
mantener estilos inline de una animación terminada.

`mountScene` suspende los timelines fuera de pantalla o con pestaña oculta. El desmontaje aborta
solicitudes y listeners, elimina clones/fragmentos y revierte estilos. Cambiar a movimiento reducido
durante la sesión cancela efectos y asienta la vista; si está activo al entrar no se descarga GSAP.

Las hojas inactivas están hidden/inert. El diálogo mantiene foco, admite Escape y restaura el origen.
Anterior/Siguiente, flechas, Inicio/Fin y Escape permiten operar el libro con teclado. Los enlaces de
producto conservan su URL real; si falla la solicitud del diálogo se navega al detalle completo.
Sin JavaScript las seis hojas quedan en flujo, con enlaces y precios legibles.

El libro cabe sin scroll de documento en 320×640, 390×844, 768×900 y 1440×900. Con zoom o pantallas de
altura muy reducida se permite reflow para conservar contenido y controles. El detalle largo en móvil
puede desplazarse dentro del diálogo; no fuerza a comprimir información hasta volverla ilegible.

## Verificación de la entrega

| Comprobación       | Resultado                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck y ESLint | Correctos, 0 errores/advertencias de Astro/TS                                                                                            |
| Prettier           | Correcto                                                                                                                                 |
| Unitarios          | 67 pruebas, 8 archivos                                                                                                                   |
| Chromium           | 42 pruebas, escritorio y Pixel 7 emulado; ejecución final 25s                                                                            |
| Accesibilidad      | axe sin violaciones en portada, libro abierto y diálogo; foco/teclado verificados                                                        |
| Regresiones        | Giro real de portada/hoja/cierre; pulsaciones rápidas; enlace directo incompatible; cambio escritorio→móvil; fallo de fetch con fallback |
| Build              | 8 páginas estáticas y robots; seis detalles incluidos                                                                                    |
| Presupuestos       | JS emitido gzip 118655bytes; CSS gzip 6526bytes; HTML máximo 21370bytes                                                                  |
| Originales         | Ambos hashes SHA256 conservados                                                                                                          |
| Lighthouse móvil   | Rendimiento 100, accesibilidad 100, buenas prácticas 100; SEO 66 por noindex intencional                                                 |
| Laboratorio local  | LCP 1365ms, CLS 0, TBT 0ms; presupuestos configurados cumplidos                                                                          |

La medición corresponde al contenido actual con placeholders, no a futuras fotografías ni tráfico
real. TBT no prueba INP. Solo se probó Chromium; no se afirma compatibilidad validada con Safari,
Firefox, lector de pantalla o dispositivos físicos. No se conectaron servicios ni se desplegó.
La auditoría de dependencias de fundamentos sigue documentada en `docs/validation.md`; no se
modificaron paquetes ni se repitió ese informe como si fuera una nueva auditoría.

Artefactos locales en `reports/book/`: `aromafia-book-motion.webm`, capturas de portada/libro/detalle
para escritorio y móvil. Lighthouse: `reports/lighthouse.html` y `.json`. Estos informes se ignoran
en Git. Para reproducir: `npm run build`, `npm run test:e2e`; con preview en4321,
`npm run audit:performance`.

## Pendientes y siguiente fase

La fase 4 queda completa y lista para fase 5: formulario sencillo y mensaje de WhatsApp con los
datos del cliente y el perfume seleccionado. El CTA actual es consulta directa; no registra pedidos
ni envía mensajes automáticamente. Las fotografías, referencias, notas, presentaciones y precios
anteriores reales continúan pendientes de contenido aprobado.
