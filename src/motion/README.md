# Infraestructura de escenas

La revisión vigente aplica `data-editorial-detail` a los seis perfumes. El estado
`data-book-editorial` y la altura móvil `--editorial-height` se calculan por acción para todos ellos:
tres zonas de lectura en escritorio y flujo vertical natural en móvil. La transición conserva los
mismos nodos y restaura scroll, foco e historial al volver. Las fotografías ya incorporan fondo,
sombras y encuadre; los contornos de preparación permanecen privados. Los iconos compartidos siguen
siendo SVG externos reutilizables. Alcance actual: `docs/perfume-asset-structure.md`.

La revisión editorial desde9PM utiliza el mismo Grid/subgrid con una banda de contenido
natural centrada en escritorio. Foto, marca y referencia comparten inicio; las notas no
ocupan una fila flexible y la compra permanece agrupada con sus datos. El `img`, el wrapper
de lectura y los nodos medidos se conservan, por lo que FLIP y el fundido no necesitan copias
ni otra timeline. Ver `docs/detail-editorial-balance.md`.

La revisión móvil vigente recupera foto izquierda y toda la información a la derecha, con
dos perfumes por cara. `setReading` cambia el mismo h4 entre su etiqueta corta de general y
su nombre completo de detalle antes de medir FLIP; al desmontar restaura el nombre completo.
El marco aprovecha el viewport habitual y permite reflow en alturas extremas/texto ampliado.
Las barras de portada y paginación reservan48px en ambos estados. No volver a separar
descripción y acciones de la columna derecha. Ver `docs/mobile-compact-restore.md`.

La plantilla vigente toma Khamrah Qahwa como referencia y conserva `PerfumeReading` como caja real
Grid/subgrid para sus animaciones de opacidad/retracción. El mismo `img` representa los roles
general y detalle dentro de `picture`. `product-photo.ts` prepara el candidato responsive fuera
del DOM, espera su decode y solo entonces activa el source. Conserva la fotografía anterior
completa como respaldo temporal del mismo marco mientras decodifica el `img` real y funde su
opacidad durante420ms, tanto al entrar como al regresar. No reconstruye fondos ni añade otro
nodo de producto. Al terminar retira el respaldo y todos los estilos temporales.
La consulta y Comprar siguen disponibles mientras carga. Movimiento reducido y pestañas ocultas
asientan el cambio sin fundido. Un fallo conserva la fotografía anterior; salir y volver permite
reintentar. La generación de cada solicitud descarta respuestas tardías al cambiar de dirección
o desmontar, cancela la animación nativa y libera el candidato de precarga. La geometría y la
timeline GSAP de la cámara permanecen independientes.
Ver `docs/product-photo-crossfade.md`, `docs/catalog-three-photographs.md` y `docs/mobile-visual-audit.md`.

F repara la visibilidad del control enfocado al cambiar el tamaño de la ventana, recibir foco o
cerrar la compra. Solo desplaza el documento si el control sale del viewport o queda completamente
bajo la barra de retorno. El RAF de foco y su listener se cancelan al desmontar; el guard de
`disposed` impide desplazamientos durante la limpieza. La composición compacta de escritorio
reserva el mismo papel de 600px antes y después del enfoque cuando la altura es menor de720px.
Verificación y límites: `docs/book-navigation-subphase-f.md`.

La subfase E usa GSAP para apertura/cierre, giro de caras, cámara y revelado del detalle real.
El nuevo brief exige navegación espacial continua y retira el modal de la fase 4. El libro permanece en una sola
vista. CSS cubre estados simples y el volumen del libro; GSAP coordina las escenas del libro.
El fundido puntual de fotografías usa la API nativa de animación, sin otra biblioteca.
ScrollTrigger se importa solo con `scroll: true` y no se necesita para esta escena.
Motion y Three.js quedan fuera hasta demostrar una necesidad que justifique su coste.

`mountScene(root, factory, options)` devuelve una función de limpieza idempotente. La fábrica es
síncrona y recibe `gsap`, `ScrollTrigger` opcional, `root`, `profile`, `signal`, `addCleanup` y `run`.
Crear todos los recursos dentro de la fábrica; devolver timelines superiores en `animations` y
ScrollTriggers en `triggers` para que se suspendan fuera de pantalla y en pestañas ocultas.
Los listeners externos deben usar `{ signal }` o registrarse en `addCleanup`.
Callbacks que creen animaciones después deben usar `run` para quedar registrados en el contexto de
la escena, o tener un contexto propio y su limpieza registrada. `run` no ejecuta tras cancelación.

El motor se carga al entrar en pantalla. Reduced motion omite la carga y revierte la escena al
activarse. Cambios de breakpoint (48rem) o ahorro de datos reconstruyen con perfil `light`/`full`.
El perfil es una decisión conservadora, no una detección fiable de la potencia del dispositivo.
En `light`, evitar pin, scrub largo, partículas densas y efectos continuos. Medir en móviles reales.
No usar scroll hijacking. Nunca ocultar texto/controles en el CSS inicial esperando a GSAP.

Astro: montar desde un script asociado al componente y conservar su dispose. Si se habilita
ClientRouter posteriormente, montar en `astro:page-load`; la limpieza ya escucha
`astro:before-swap`. Actualmente se usa navegación nativa. React: `useMotionScene` con raíz ref,
fábrica y opciones estables. No importar datos servidor dentro de la isla.

`context.revert()` restaura solo esta escena; nunca usar `killAll()`/`getAll().kill()`.
No devolver tweens hijos y su timeline a la vez. La suspensión conserva las pausas deliberadas.
La cancelación durante import no puede montar recursos huérfanos. Los fallos dejan el HTML base.
Una animación automática que dure más de cinco segundos requiere controles de pausa/omisión
cuando corresponda. La petición posterior del propietario incorpora expresamente la animación
v3 como intro con omisión; su integración se describe a continuación.

## Intro de marca

`features/intro/brand-intro.ts` controla una pasada del ciclo CSS de16 segundos en un iframe
aislado del mismo origen. No requiere GSAP ni otro motor. `BrandIntro.astro` aporta el `dialog`
nativo y «Saltar intro». El documento derivado se prepara exclusivamente en servidor/build
desde el HTML aprobado, validando su hash y reutilizando sus once PNG existentes sin alterarlos.
Los estilos del logo permanecen dentro del iframe; no se mezclan con los del libro.

El bootstrap del `head` activa la presentación antes del primer pintado y tiene una salida
independiente de3 segundos si no arranca el módulo. La escena comienza pausada hasta cargar
sus recursos y decodificar imágenes; el controlador limita la carga a8 segundos y la espera
del evento final a17. «Saltar intro», Escape, un fallo o activar movimiento reducido liberan
el catálogo. La salida normal usa opacidad CSS durante350ms; no modifica la escena del libro.

Al salir se retira el iframe, se limpian listeners/temporizadores y el estado de bloqueo,
se restaura el color del navegador y se devuelve el foco al acceso del libro. Ocultar la
pestaña, `pagehide` o `astro:before-swap` también disponen el recurso. Una marca de sesión
evita repetirla al navegar o recargar en la misma pestaña; los enlaces con fragmento y
el movimiento reducido la omiten. Sin JavaScript no hay bloqueo ni descarga de la escena.
[Alcance, recursos y validación](../../docs/brand-intro.md).

## Libro de una sola vista

`initializeBook(root)` en `book-scene.ts` mejora el HTML público y devuelve su dispose. Los cálculos
puros de índices y hash viven en `book-state.ts`. Un solo `BookNavigationState` contiene fase,
índice de cara y selección. La fase `preparing` limita a 450ms la espera del motor antes de abrir
sin efectos si no está disponible. El libro muestra dos caras desde 56rem y una por debajo de ese
ancho; cada cara de catálogo contiene dos perfumes y la cuarta es contraportada. Las hojas inactivas están
ocultas e inert para no recibir foco. La portada gira sobre su lomo y las hojas pasan mediante un
clon decorativo temporal, también inert y sin IDs duplicados. No hay un bucle automático de páginas.

El motor se carga de forma diferida al permitirse movimiento y el contenido sigue disponible si
falla su carga. Reduced motion abre, cambia y cierra el libro sin descargar GSAP; un cambio de
preferencia o breakpoint debe dejar un estado asentado, sin clones ni transformaciones huérfanas.
Los recursos pertenecen al contexto de la escena. Fuera de pantalla o con la pestaña oculta se
suspenden las animaciones; al desmontar se retiran listeners, se cancelan tareas y se revierte CSS.

Los enlaces de perfume usan hashes del libro. El clic primario sin modificadores enfoca
la zona con la cámara. La ficha completa y su página adicional fueron retiradas por el usuario;
el nombre del perfume ocupa el extremo derecho de los controles. No se solicitan ni
clonan fragmentos de detalle. El controlador gestiona cancelación, foco, Escape y Atrás/Adelante. El gesto
táctil horizontal distingue desplazamiento vertical, tap y pinch; cancela punteros interrumpidos
y suprime el click asociado a un swipe. Los controles visibles y el teclado ofrecen alternativas.
La cámara tiene su propio contenedor con transform-origin0,0 y mantiene la zona real del producto.
En E, `book-layout.ts` calcula compensaciones de cámara y elementos desde rectángulos anteriores
y posteriores al cambio de composición. La zona seleccionada se reorganiza sobre el papel completo,
con los mismos nodos de imagen, título y precio; no se limita a dejar el contenido magnificado.
Los rectángulos se leen en lotes por acción. Durante la timeline solo cambian transform y opacity,
sin medir ni animar dimensiones por frame. `book-camera.ts` conserva la función pura de la cámara
inicial de C. La inclinación por puntero se retiró para mantener rectángulos fiables y texto estable.
Un resize reencuadra sin copiar productos.
`book-cover.ts` coordina volumen, canto, portada y caras; no aplica opacity al padre 3D.
`book-turn.ts` anima una hoja opaca de dos caras durante 1.04s. Los fondos de la apertura permanecen
estables todo el recorrido y el render final ocurre al terminar, evitando el salto a mitad de giro.
Los cuadros intermedios y mediciones locales se documentan en `docs/motion-visual-subphase-d.md`.

`PerfumeReading` se renderiza en build dentro de la zona. La fase `revealing` muestra su cuerpo
después de una transición geométrica de 1.05s, con un revelado de 0.28s. La composición reúne
descripción, presentación, notas, referencia y consulta en una sola vista del libro
para el contenido actual. Sustituye la columna con scroll y el botón «Notas y detalles» de D.
El regreso usa `retracting` para retirar el cuerpo durante 0.16s y devuelve la geometría real
en 1.05s. La imagen, el nombre y el precio conservan sus nodos. No hay fetch de fragmentos ni
otra ficha superpuesta. Una altura extrema o zoom de texto debe conservar el reflow y el acceso.

`#libro/N` representa la cara física y `/perfume/slug` el enfoque. Una URL incompatible se corrige a
la cara real del producto. Las fases `focusing`, `focused` y `returning` pertenecen al mismo estado
que navegación y cierre; no pueden competir con giro o portada. `/pedido` añade la fase `ordering`
con el perfume preseleccionado. El formulario usa el modal compacto de compra autorizado por el
usuario y permite volver al detalle. Su controlador tiene limpieza idempotente y se desmonta con el libro.
Nombre, teléfono, ciudad, perfume y comentario opcional se validan antes de crear el enlace de
WhatsApp. Solo «Continuar en WhatsApp» abre el borrador codificado; el cliente lo revisa y envía allí.
No hay almacenamiento persistente ni envío automático.

Sin JavaScript, `PerfumeReading` permanece visible en el flujo del catálogo y ofrece «Comprar» como
enlace de WhatsApp. La mejora oculta ese enlace y habilita el botón del modal únicamente al leer
la zona; desmontar restaura el HTML nativo. No se depende de una ruta de ficha completa.
Sin JavaScript no se activa la disposición de una sola vista: las hojas y sus detalles quedan en
flujo. Esta alternativa mantiene lectura y consulta aunque falle motion.
El alcance y las comprobaciones de E se registran en `docs/book-navigation-subphase-e.md`.

La auditoría móvil mantiene `entryScrollY` al entrar al detalle y lo restaura al regresar. Las
capturas geométricas se toman antes y después de reorganizar el papel y de ajustar la posición del
documento, de modo que el FLIP puede conservar la continuidad visual sin medir por frame. El foco
usa `preventScroll`; la corrección de visibilidad del control se reserva para cuando hace falta.
Si el inicio del papel quedó por encima del viewport al desplazarse por el catálogo, se alinea
a 12px entre esas capturas. `writeHash` guarda primero la entrada del catálogo, antes de mover el
documento: Chromium conserva así el scroll que debe restaurarse, también bajo reduced motion.
El retorno restaura `entryScrollY` entre capturas, sin cambiar `history.scrollRestoration` global
ni añadir temporizadores de corrección. Dos casos con tap a 320px verifican inicio legible y
retorno exacto con y sin animación después de leer la parte inferior del detalle.
En el contenedor desplazable real `.perfume-page`, `touch-action: pan-y pinch-zoom` deja al
navegador el scroll vertical y el zoom, y permite que el controlador reciba el gesto horizontal
sin `pointercancel` prematuro. El test CDP pasa por la entrada táctil de Chromium, además de las
pruebas de estado con eventos de puntero.

Fuentes: [context](<https://gsap.com/docs/v3/GSAP/gsap.context()/>),
[matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>),
[ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
