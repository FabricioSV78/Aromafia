# Libro editorial — entrega de subfase B

**2 de noviembre de 2026.** Se validó la [arquitectura de A](book-navigation-subphase-a.md) y se
implementó únicamente B. El nuevo brief reemplaza el detalle modal anterior y exige revisar cada
subfase antes de continuar. El zoom espacial de C queda pendiente de esa revisión.

## Experiencia implementada

- Tres caras de catálogo, cada una con exactamente dos perfumes. Los seis productos y precios
  originales aparecen una sola vez, en el orden recibido.
- Cuatro perfumes por apertura de escritorio; dos por cara en móvil. La cuarta cara es una
  contraportada editorial con identidad oficial, sin perfumes duplicados ni productos ficticios.
- Portada, lomo, papel, apertura/cierre y giro en ambas direcciones reutilizan la escena existente.
- Navegación mediante controles visibles, flechas, Inicio/Fin, Escape y gesto táctil horizontal.
  Los desplazamientos verticales, taps, pinch y punteros cancelados no se convierten en avances.
- Las zonas muestran imagen o placeholder, nombre, marca, descripción breve y precio vigente.
  Los datos faltantes siguen explícitos; un precio anterior solo aparece si está confirmado.
- Sin modal, popup ni capa superpuesta. «Ver ficha» conserva temporalmente el detalle estático
  `/perfumes/{slug}/`. Su retorno lleva a la cara que contiene el producto, incluido el segundo
  perfume de cada cara. Esto mantiene consulta comercial durante la transición a C/D.

Esta entrega no presenta las rutas nativas como el resultado final de navegación inmersiva.
C implementará el acercamiento y regreso sobre la zona real; D integrará su información ampliada.

## Arquitectura y archivos

`BookNavigationState` es la única fuente de verdad para fase, cara y selección. Las fases activas
son `closed`, `preparing`, `opening`, `browsing`, `turning` y `closing`. `preparing` permite esperar
hasta 450ms por GSAP; si falla o no llega a tiempo, el libro continúa usable sin interpolación.
Un token invalida callbacks antiguos y cada acción posee un contexto GSAP con limpieza propia.

`#libro/N` cuenta caras físicas, incluida la contraportada. Los hashes previos con `/perfume/slug`
localizan la zona real, enfocan su enlace y se normalizan a la cara, sin reabrir el diálogo anterior.
Los cambios de ancho y de preferencia de movimiento asientan una vista válida; Atrás/Adelante
restauran la apertura. Si un giro oculta la zona enfocada, el foco vuelve a la nueva cara visible.

| Archivo                           | Cambio                                                                     |
| --------------------------------- | -------------------------------------------------------------------------- |
| `CatalogBook.astro`               | Agrupación de dos productos por cara y contraportada                       |
| `PerfumePage.astro`               | Cara física con título y dos zonas de perfume                              |
| `PerfumeZone.astro`               | Zona editorial individual y enlace nativo                                  |
| `catalog.css`                     | Composición responsive, estados del libro y retirada del CSS modal         |
| `src/pages/index.astro`           | Retirada del diálogo y del CSS de detalle innecesario en inicio            |
| `src/motion/book-state.ts`        | Tipos de estado y cálculo de cara desde índice de producto                 |
| `src/motion/book-scene.ts`        | Índices por cara, estados explícitos, giro, gesto táctil, foco e historial |
| `src/pages/perfumes/[slug].astro` | Retorno a la cara del producto mediante helper compartido                  |
| `tests/unit/book-state.test.ts`   | Asignación de dos productos por cara y entradas inválidas                  |
| `tests/e2e/*.spec.ts`             | Navegación y accesibilidad de B, sustituyendo las pruebas de modal         |
| `CatalogSpread.astro`             | Retirado: componente sin uso del listado anterior                          |

Los componentes de catálogo se encuentran en `src/features/catalog/components/`; su CSS en
`src/features/catalog/styles/`. También se actualizaron AGENTS, README, guía de contenido, guía
de motion y validación. Dominio, datos, repositorio, contactos, precios y originales siguen intactos.
No se añadieron paquetes, servicios ni infraestructura. No hay importación de datos privados en cliente.

El giro usa transform/opacity y dos caras decorativas temporales. Los clones son inert, están
ocultos al árbol accesible y retiran IDs, slugs, enlaces identificadores y relaciones ARIA.
Las caras reales ocultas están hidden/inert. No se reordena layout por frame. El perfil ligero
omite inclinación por puntero; no hay scroll hijacking, WebGL ni avance automático.

## Comprobaciones ejecutadas

| Comprobación              | Resultado                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Astro/TypeScript estricto | 61 archivos, 0 errores/advertencias                                                                                  |
| ESLint y Prettier         | Correctos                                                                                                            |
| Vitest                    | 68 pruebas correctas, 8 archivos                                                                                     |
| Playwright Chromium       | 42 pruebas correctas en escritorio y móvil; 20.5s                                                                    |
| axe                       | Sin violaciones en portada, libro abierto y fichas directas probadas                                                 |
| Responsive                | Una vista sin desbordamiento del documento a 320×640, 390×844, 768×900 y 1440×900                                    |
| Giro e interrupción       | Giro real, repetición rápida, cambio de reduced motion durante giro y limpieza de clones                             |
| Navegación                | Dos perfumes por cara, contraportada, todos los precios, teclado, gesto, historial, recarga y retorno de seis fichas |
| Alternativas              | Sin JS y reduced motion; las rutas siguen accesibles sin GSAP                                                        |
| Build                     | 8 páginas estáticas y robots                                                                                         |
| Tamaños                   | JS emitido gzip 118028bytes; CSS gzip 6562bytes; HTML máximo 19918bytes                                              |
| Originales                | PNG oficial y HTML v3 mantienen sus hashes SHA256                                                                    |
| Lighthouse móvil          | Rendimiento 100, accesibilidad 100, buenas prácticas 100 y SEO 66 por noindex intencional                            |
| Laboratorio de carga      | LCP 1356ms, CLS 0 y TBT 0ms; presupuestos existentes cumplidos                                                       |

Los informes actuales están en `reports/lighthouse.html` y `.json`, `playwright-report/` y
`reports/book-subphase-b/`. Esta última carpeta contiene `book-editorial.webm`, portada,
apertura inicial/final de escritorio y capturas móviles 320/390. Son artefactos locales ignorados.

Las pruebas táctiles automatizadas envían PointerEvents en Chromium y comprueban sus resultados;
no equivalen a validar un teléfono físico. Lighthouse mide carga de portada con el contenido
actual, no FPS de los giros ni INP real. No se afirma 60 FPS sostenidos ni compatibilidad probada
en Safari/Firefox. Las futuras fotografías y el zoom requieren medir de nuevo su coste real.

## Punto de revisión

B queda completa. El siguiente trabajo es **C: acercamiento espacial reversible hacia cualquiera
de las cuatro zonas visibles**, manteniendo la geometría del libro como referencia. D, E y F
quedan después de C. No se implementaron nuevos formularios ni se enviaron mensajes a WhatsApp.
