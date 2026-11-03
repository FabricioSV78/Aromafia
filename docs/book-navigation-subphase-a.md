# Navegación inmersiva del libro — subfase A

Decisión del **2 de noviembre de 2026**, a partir del nuevo brief «Navegación inmersiva tipo libro
con zoom cinematográfico». Se valida la arquitectura antes de implementar **únicamente la subfase B**.
El siguiente punto de revisión visual ocurre al cerrar B, antes de comenzar el zoom espacial de C.

## Estado de partida

La entrega anterior ya tiene portada, apertura/cierre, giro de hojas, controles, teclado, motion
diferido, limpieza por escena y seis rutas estáticas de detalle. El dominio, los precios y los
contactos permanecen separados de la presentación. Se conservan estas piezas y sus contratos.

Hay dos diferencias respecto al nuevo brief: cada cara contenía un perfume y el detalle se abría
en un diálogo. Ese mecanismo de detalle queda sustituido por la navegación espacial solicitada.
Se preservan sus obligaciones de foco, historial y alternativa nativa; **no se conserva un modal**.
El zoom anterior no satisface C porque no acerca la vista al mismo contenido de la página.
El formulario y el mensaje personalizado de WhatsApp siguen pendientes, ahora en E.

Las verificaciones de aquella entrega son históricas y están en `docs/catalog-phase-4.md`.
Este documento define decisiones y criterios; no acredita resultados de pruebas de B–F.

## Caras y composición editorial

Una hoja navegable representa una **cara física**, no un producto. Cada cara de catálogo contiene
exactamente dos zonas de perfume; cada zona mantiene identidad, imagen, nombre y enlace propios.

| Cara | Tipo                    | Contenido                                                       |
| ---- | ----------------------- | --------------------------------------------------------------- |
| 1    | Catálogo                | 9PM y Hawas Ice                                                 |
| 2    | Catálogo                | Mandarine y Khamrah Qahwa                                       |
| 3    | Catálogo                | Hawas Malibu y Royale Opal                                      |
| 4    | Contraportada editorial | Cierre del libro con identidad y contenido comercial confirmado |

Las cuatro caras físicas completan dos aperturas de escritorio: 1–2 y 3–4. La contraportada no
simula un perfume, no duplica productos y no incorpora una oferta ficticia. Es el cierre necesario
de los seis productos distribuidos en tres caras de dos perfumes. En móvil se navega una cara
por vista, conservando ambas zonas de perfume dentro de cada cara de catálogo.

El número de página, el progreso, el índice de navegación y el hash cuentan **caras físicas**.
Las zonas de producto son descendientes de la cara, con un slug independiente. Una búsqueda de
producto localiza primero su zona y después la cara que la contiene.

La vista general usa fotografía, nombre/marca, precio vigente, referencia anterior confirmada y
descripción breve cuando existan. Los campos faltantes siguen explícitos o ausentes según su
contrato: no se inventan marcas, fotografías, notas, descripciones ni precios anteriores.
Las propuestas privadas de precio no llegan a la UI. Las notas extensas corresponden al detalle D.

La composición mantiene el papel crema, negro y dorado de la marca, con dos zonas editoriales
integradas en cada cara. El espacio y la imagen deben sostener la jerarquía; se adaptan las
proporciones antes de reducir texto o controles hasta volverlos difíciles de usar. Con JavaScript
el libro permanece en una vista; sin JavaScript las caras se leen en flujo normal.

## Una fuente de verdad

En B, el controlador mantiene un único estado de navegación:

```ts
type BookPhase = 'closed' | 'preparing' | 'opening' | 'browsing' | 'turning' | 'closing';

interface BookNavigationState {
  readonly phase: BookPhase;
  readonly pageIndex: number;
  readonly selectedSlug: string | null;
}
```

`pageIndex` es cero basado y se normaliza para una o dos caras visibles según el ancho. La fase
determina si se puede actuar y qué controles están disponibles; clases, atributos, hojas visibles,
inert y URL se derivan del mismo estado. Los handles de GSAP, tokens de cancelación y referencias
DOM pertenecen a los recursos de la escena, no son una segunda selección o página actual.

| Origen           | Acción válida                         | Transición                                   |
| ---------------- | ------------------------------------- | -------------------------------------------- |
| `closed`         | Abrir                                 | `preparing` → `opening` → `browsing`         |
| `browsing`       | Anterior/Siguiente, teclado o gesto   | `turning` → `browsing` en la cara destino    |
| `browsing`       | Cerrar                                | `closing` → `closed`                         |
| Fase transitoria | Repetir acción de avance/apertura     | Omitir la repetición sin crear otro timeline |
| Cualquier fase   | Cambio de preferencia, ancho o salida | Cancelar/limpiar y asentar una vista válida  |

Cerrar no pierde la posición de lectura. Un cambio de ancho normaliza el índice al spread que
incluye la cara actual. Las hojas ocultas están hidden/inert; si el foco pertenecía a una cara que
se oculta, se devuelve a un destino visible. Usar un control de navegación conserva su foco.
Los clones de giro son decorativos e inert y no conservan IDs ni identificadores de producto.

Durante B, `selectedSlug` solo recuerda una zona válida desde un hash anterior o un enlace nativo.
En C, el mismo estado se ampliará con `focusing`, `focused` y `returning`; esas fases usarán ese
`selectedSlug`, validado contra los productos públicos. No se añadirá otro estado de selección
en una isla, un panel o una variable paralela. La cara permanece estable mientras se enfoca su zona.

## Navegación y transición temporal de B

Se mantiene `#libro/N` para la cara y `/perfumes/{slug}/` para la ruta pública de producto.
Las rutas de detalle existentes permanecen utilizables durante B como alternativa nativa temporal,
sin abrir diálogo. Su enlace de retorno se calcula desde la cara que contiene el producto:
`Math.floor(productIndex / 2) + 1`; no se reutiliza el ordinal individual como si fuera una página.

El formato `#libro/N/perfume/slug` queda reservado para el enfoque espacial. Durante B, un hash
anterior reconocido localiza la cara real del perfume, enfoca su enlace y se normaliza a `#libro/N`,
sin reactivar el modal. El enlace conserva la salida nativa a la ficha. En C ese slug restaurará
el estado enfocado. Atrás y el control Regresar deberán devolver al mismo spread.

Anterior/Siguiente siguen visibles y admiten teclado y pulsaciones táctiles. El gesto horizontal
debe distinguirse de un tap y de un desplazamiento vertical, respetar cancelaciones y evitar que
el swipe active accidentalmente el enlace de perfume. No se bloquea el zoom del navegador.

## Modelo de cámara para C

La solución elegida usa transformaciones DOM con el GSAP instalado; no necesita WebGL ni una
biblioteca adicional. Un contenedor de cámara rodeará el libro y tendrá `transform-origin: 0 0`.
La cámara controla traslación/escala; el volumen y las hojas mantienen su propia geometría 3D.
Durante el enfoque se suspende la inclinación de puntero y no se permite pasar páginas.
Cada propiedad tiene un responsable para evitar que el giro y la cámara compitan.

El origen es la **zona de producto real que ya está en la página**, no una copia flotante.
Al seleccionar, se leen juntos los rectángulos de cámara, superficie visible y producto. Después
se calcula una escala uniforme y una traslación hacia el área de lectura disponible, usando sus
coordenadas relativas. Se escriben transformaciones en una fase separada, sin medir layout por
frame. La aproximación FLIP conserva la posición y escala iniciales antes de interpolar al destino.

La cámara y el producto siguen perteneciendo al libro durante todo el trayecto; no se reemplaza
el catálogo por una pantalla ni se crea un modal. C se concentra en acercarse y regresar. D añadirá
el contenido dentro de la misma zona ampliada; si necesita reorganizarse, medirá los estados de
inicio/final una vez y compensará el cambio para mantener continuidad visual.

Regresar repliega primero la información que corresponda y anima la cámara a su transformación
de exploración. Devuelve el foco al enlace original sin cambiar de cara. La operación inversa usa
el mismo origen y modelo geométrico; no es otra entrada independiente. Un resize durante el
trayecto cancela el cálculo obsoleto, revierte el contexto y vuelve a una vista válida antes de
medir de nuevo. Si falla el motor, se conserva la navegación nativa y una composición CSS útil.
Reduced motion omite la interpolación y presenta directamente estados legibles.

## Recursos, rendimiento y límites

Se reutilizan `mountScene`, el import diferido de GSAP y el contexto de cada acción. La fábrica
sigue siendo síncrona; las importaciones y solicitudes posteriores tienen cancelación. Timelines,
listeners y clones se registran y limpian dentro de su raíz. Fuera de pantalla o con pestaña oculta
se suspende el trabajo; al desmontar se revierten estilos y se abortan tareas. Ninguna limpieza
mata animaciones globales. No se instala otro motor ni se introduce ScrollTrigger para esta escena.

Se priorizan transform/opacity y lecturas antes de escrituras. No hay animación de layout por
frame ni `will-change` global. Los perfiles ligeros reducen trabajo decorativo. Buscar fluidez no
autoriza afirmar 60 FPS en hardware que no se haya medido ni bloquear lectura o consulta.

Se conservan los presupuestos existentes: HTML máximo 51200bytes, JS emitido gzip 122880bytes,
CSS gzip 20480bytes; Lighthouse mínimo 90, LCP de laboratorio ≤2500ms, CLS ≤0.1 y TBT ≤200ms.
Se investiga cualquier exceso antes de modificar esos límites. Las cifras son criterios, no
resultados actuales. TBT no demuestra INP real.

El cliente usa HTML y props públicos; no importa `data/`, repositorios ni módulos `.server.ts`.
No se conectan servicios ni se despliega. Los originales de marca conservan su hash y el personaje
no se ilustra ni altera. Las skills locales `frontend-design` y `gsap-performance` orientan
composición y coste; el brief del usuario determina la experiencia y el alcance.

## Mapa de archivos

| Archivo o módulo                                                  | Cambio previsto                                                         | Subfase |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- | ------- |
| `src/features/catalog/components/CatalogBook.astro`               | Agrupar productos en caras, contraportada y controles                   | B       |
| Componentes de cara/zona en `src/features/catalog/components/`    | Separar hoja física y producto conservando precio/enlace                | B       |
| `src/features/catalog/styles/catalog.css`                         | Dos zonas por cara y adaptación a una/dos caras visibles                | B       |
| `src/motion/book-state.ts`                                        | Estado explícito, índices por cara y contrato de URL                    | B       |
| `src/motion/book-scene.ts`                                        | Reutilizar apertura/giro, serializar acciones, táctil y retirar diálogo | B       |
| `src/pages/index.astro`                                           | Componer el libro sin modal                                             | B       |
| `src/pages/perfumes/[slug].astro`                                 | Mantener ruta estática y corregir retorno por cara                      | B       |
| `tests/unit/book-state.test.ts`, `tests/e2e/`                     | Verificar distribución, controles, foco, URLs y alternativas            | B–F     |
| Contenedor/transformación de cámara en el módulo de motion        | Enfoque reversible sobre el producto real                               | C       |
| `ProductDetail.astro`, `FragranceNotes.astro`, `InspiredBy.astro` | Reutilizar información pública dentro de la zona ampliada               | D       |
| Módulos de solicitud/formulario y utilidad de WhatsApp            | Validar datos y construir el enlace, sin envío automático               | E       |
| Documentación y presupuestos existentes                           | Registrar resultados y límites medidos                                  | B–F     |

Los nombres nuevos concretos se fijan al implementar cada subfase; no se crean módulos vacíos
por anticipación ni se reconstruye el dominio para resolver una composición visual.

## Criterios de revisión por subfase

| Subfase | Aceptación antes de avanzar                                                                                                                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A       | Arquitectura, estados, caras, cámara y alcance definidos en este documento                                                                                                                                                                                                  |
| B       | Tres caras con dos perfumes únicos cada una; contraportada separada; cuatro perfumes en la primera apertura de escritorio y dos por cara móvil; giro sin duplicaciones/saltos; controles, teclado y táctil; enlaces nativos sin modal; tipos, lint, tests y build correctos |
| C       | Acercamiento a la zona exacta y regreso con continuidad de escala/posición; misma cara conservada; acciones repetidas/interrupciones y reduced motion estables; sin panel flotante ni pantalla sustituta                                                                    |
| D       | Detalles dentro de la zona enfocada; principal dominante, referencia menor y datos pendientes explícitos; contenido, foco y retorno legibles sin romper C                                                                                                                   |
| E       | Formulario semántico, validación y mensaje codificado con datos/producto; confianza y redes; ninguna conversación enviada automáticamente                                                                                                                                   |
| F       | Recorridos completos, enlaces directos, recarga/Atrás, cambio de producto, móvil/teclado/reduced motion, rendimiento y accesibilidad medidos; checks corregidos y límites documentados                                                                                      |

La autorización actual alcanza A y **solo B como siguiente subfase pendiente**. Tras verificar B se
presenta la experiencia para revisión; C, D y E no se implementan durante ese cierre.
