# Auditoría visual, táctil y móvil del catálogo

**3 de noviembre de 2026.** Esta auditoría revisa el catálogo tipo libro y los seis detalles,
manteniendo la identidad crema/dorada, las fotografías originales, la plantilla de Khamrah Qahwa
y la navegación existente. Incluye el cierre de las tres fotografías por perfume y de los precios
externos documentados en [catálogo y fotografías](catalog-three-photographs.md). No incorpora una
subfase adicional, publicación, pago ni envío real de mensajes.

**Estado de este registro:** línea base y capturas posteriores ejecutadas, con las correcciones
visuales y táctiles verificadas. El build final de las 13:45:44 cumple los presupuestos y la suite
E2E completa termina con 183 casos correctos y tres omisiones intencionales. Lighthouse y las
mediciones de las acciones pareadas están ejecutados; la comprobación táctil adicional se
distingue abajo. No se reutilizan métricas históricas como resultados del nuevo build.

## Método y alcance

La revisión combina capturas observadas, navegación real en Playwright/Chromium, comprobaciones
de geometría y pruebas separadas de movimiento. El script `scripts/audit-catalog-visual.mjs`
recorre la portada, las caras del catálogo, los seis perfumes, la compra, sus errores de validación
y el regreso. Comprueba que el formulario preselecciona el perfume correcto y que el foco vuelve
al control del producto. Las capturas estáticas usan `prefers-reduced-motion: reduce` para
comparar composiciones asentadas; la fluidez se mide por separado con movimiento habilitado.

| Grupo      | Viewports CSS comprobados antes y después |
| ---------- | ----------------------------------------- |
| Escritorio | 1920×1080, 1440×900 y 1366×768            |
| Tablet     | 768×1024                                  |
| Móvil      | 430×932, 390×844, 375×667 y 320×568       |

En cada tamaño se recorren **9 pm, Hawas Ice 100ml, Odyssey Mandarin Sky, Khamrah Qahwa,
Hawas Malibu y Zakat Royale Opal**. Son 48 vistas de detalle y 156 capturas por recorrido,
antes y después, incluyendo catálogo, detalle, notas, compra y formulario. Las hojas de contacto ayudan a evaluar
la consistencia entre productos; las capturas individuales conservan la resolución completa.
La inspección de CSS y las mediciones no sustituyen la observación de las imágenes.

Los informes locales están en `reports/visual-mobile-audit/`:

- `before/metrics.json`: geometría y manifiesto de la línea base.
- `before/{ancho}-overview-{cara}.png`: catálogo anterior por tamaño y cara.
- `before/{ancho}-{slug}-top.png`: detalle anterior de cada perfume.
- `before/{ancho}-{slug}-notes.png` y `-purchase.png`: lectura móvil y acceso a la compra.
- `before/{ancho}-contact-sheet.png`: composición comparativa de cada tamaño.
- `motion-before.json`: mediciones de movimiento y navegación táctil anteriores.
- `motion-comparison.json`: comparación de las 17 acciones pareadas en CPU 1× y 4×.
- `after/`: las mismas vistas después de corregir el diseño, con su propio `metrics.json`.
- `comparison.html`: 72 pares comparativos locales de escritorio, tablet y móvil.
- `comparison-1440-overview-1.png` y `comparison-320-overview-1.png`: comparativas de catálogo.
- `comparison-1440-khamrah-qahwa-top.png` y `comparison-390-mandarine-top.png`: comparativas de detalle.
- `performance/lighthouse.json`, `lighthouse.html` y `summary.json`: auditoría móvil del build final.

Los cuatro pares PNG acompañan la galería. En la comparación del catálogo a 320px, el lado
posterior muestra el documento completo para hacer visible el reflow vertical; la línea base es
el viewport original de 568px de alto. Esa diferencia se identifica en la comparación y no
significa que todo el contenido posterior encaje simultáneamente en una pantalla de 568px.

La captura posterior espera la decodificación de las referencias visibles. Algunas referencias
lazy aún no habían llegado al tomarse la instantánea anterior; su aparición posterior no se
atribuye a una funcionalidad nueva ni demuestra que antes faltara ese contenido.

## Problemas confirmados

| Problema observado                                  | Evidencia y efecto                                                                                                                                                | Corrección realizada                                                                                                                                                               |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo recortado a 320×568                        | En `before/320-overview-1.png`, el precio y el acceso del segundo perfume quedan cortados por el papel; el acceso de la primera fila roza la marca de la segunda. | Libro de al menos 736px a 320px de ancho y 672px en el resto del perfil móvil; lectura vertical natural en pantallas cortas, conservando dos perfumes por cara.                    |
| Descripciones truncadas                             | En esa misma captura, el resumen se corta con puntos suspensivos aunque sea información útil para elegir.                                                         | Retirado el límite de dos líneas; nombres, resúmenes, precios y accesos caben dentro de sus filas en las ocho resoluciones.                                                        |
| Libro pequeño en tablet                             | La cámara conserva un máximo de 460px dentro de un viewport de 768px, dejando margen lateral excesivo y tipografía pequeña para el espacio disponible.            | Máximo de 620px en tablet y tipografía editorial ajustada; se mantiene una cara con dos perfumes.                                                                                  |
| Gesto horizontal interceptado                       | La entrada táctil CDP real recibe `pointercancel` y conserva `#libro/1`. El ancestro desplazable `.perfume-page` tiene `touch-action: auto`.                      | `pan-y pinch-zoom` en el contenedor desplazable real; CDP confirma giro horizontal de ida/vuelta y que el gesto vertical no gira a 320, 390 y 768px.                               |
| Encuadre incorrecto durante una carga fría          | Al retener la fotografía de detalle, la imagen general puede recibir la máscara y el encuadre destinados a la foto con caja antes de que la sustitución termine.  | Foto y SVG decodificados antes de activar fuente/encuadre juntos; fallback general limpio, cancelación al regresar/desmontar y entrada de 100ms omitida bajo reduced motion.       |
| Mensajes comerciales pequeños                       | El texto inferior móvil usa una escala poco legible al reducirse la pantalla.                                                                                     | Texto aumentado a 11px y altura de línea 1.35, conservando una única aparición de los mensajes.                                                                                    |
| Inicio del detalle oculto tras desplazarse en 320px | Tras desplazar el catálogo para llegar a los controles, abrir un perfume podía dejar marca y título por encima del viewport.                                      | Se alinea el inicio del papel a 12px cuando está fuera por arriba entre las dos capturas FLIP; el hash se guarda antes de mover el documento y el regreso restaura `entryScrollY`. |

En las 48 mediciones de detalle de cada recorrido no se registró desbordamiento horizontal del
documento ni errores JavaScript de página. El catálogo requiere además comprobar los límites
verticales de cada fila: las pruebas dirigidas posteriores verifican sus fotografías, nombres,
descripciones, precios y accesos, sin confundir ausencia de overflow horizontal con ausencia de recortes.

Las superficies fotográficas siguen reservando proporciones coherentes. El frasco vendido conserva
el protagonismo y la inspiración permanece como referencia secundaria. En escritorio se mantiene
la composición de tres zonas; en móvil, notas, referencias y compra se leen en flujo vertical.
No se intenta comprimir todo el detalle dentro de una pantalla de 320px.

## Movimiento y rendimiento

`scripts/audit-mobile-motion.mjs` separa el movimiento con imágenes ya decodificadas de las pruebas
de fotografía con red retenida. Usa viewport 390×844, tacto mediante `Input.dispatchTouchEvent`,
CPU de Chromium a 1× y 4×, e intervalos `requestAnimationFrame` durante fases activas del libro.
Las muestras no se capturan simultáneamente con vídeo, screenshots o un perfil de DevTools.

La comprobación registra apertura/cierre, giro, acercamiento/regreso de los seis perfumes, tareas
largas, recursos y clones residuales. La comparación de heap se realiza en el mismo documento
antes/después de los recorridos y tras solicitar GC por CDP. Un perfil independiente comprueba
la navegación bajo reduced motion y la ausencia de descarga del motor de animación.

La batería fría confirma cinco escenarios en ambos proyectos de Chromium: foto retenida mientras
la compra sigue accesible, fallo y reintento, máscara SVG retenida, regreso antes de la respuesta y
desmontaje antes de la respuesta. Son diez casos correctos. Las capturas observadas en
`reports/mobile-motion-review/cold-captures/` muestran fallback limpio y el detalle con su caja al
resolver. La prueba táctil real confirma horizontal y vertical en los tres anchos indicados.
Dos casos adicionales a 320px, con animación y reduced motion, verifican mediante tap real el
inicio legible del detalle, la ausencia de salto al asentarse y el regreso al scroll exacto del
catálogo después de consultar la información inferior.

Las pruebas de píxeles finales reúnen 236 muestras, incluidas doce de clones visibles durante
las transiciones: no detectaron fondos blancos. No quedaron clones residuales al terminar.

La comparación reúne las mismas **17 acciones nombradas** en cada perfil: apertura, cierre,
giros y entrada/regreso de los seis perfumes. Excluye los swipes que fallaban en la línea base y
sus controles de recuperación. La línea base usó un fallback de ratón después de los gestos
fallidos; el recorrido posterior usa taps nativos. El orden de acciones y el medio de entrada no
son idénticos, por lo que la comparación describe una ejecución, sin demostrar una mejora
estadística ni garantizar resultados de un teléfono físico.

| Medición de acciones pareadas  | CPU 1× antes → después | CPU 4× antes → después |
| ------------------------------ | ---------------------- | ---------------------- |
| Intervalos activos muestreados | 1294 → 1292            | 1287 → 1280            |
| Mediana RAF                    | 16.70 → 16.70ms        | 16.70 → 16.70ms        |
| p95 RAF                        | 16.70 → 16.70ms        | 16.80 → 16.70ms        |
| Intervalo máximo               | 16.8 → 16.8ms          | 133.3 → 100ms          |
| Intervalos mayores de 50ms     | 0 → 0                  | 3 → 1                  |
| Tareas largas / duración total | 0 / 0 → 0 / 0ms        | 3 / 247 → 3 / 210ms    |

En ambos perfiles se completaron las acciones pareadas sin errores JavaScript ni clones de giro
residuales. Los listeners registrados permanecieron en 42. El heap posterior tras solicitar GC
creció 391432 bytes en CPU 1× y 380848 bytes en CPU 4× respecto al punto inicial; este recorrido
breve no permite afirmar ausencia de fugas. Reduced motion recorrió los seis perfumes sin
descargar GSAP. RAF próximo a 16.7ms refleja la cadencia observada del callback del navegador,
no una acreditación de 60 cuadros presentados por la GPU de un celular.

Lighthouse móvil del build final obtuvo rendimiento **100**, accesibilidad **100**, buenas
prácticas **100** y SEO **66** durante preparación con noindex intencional. Registró
**LCP 1504.329ms, CLS 0 y TBT 0ms**. Son resultados de laboratorio local; no prueban INP de campo
ni el comportamiento de una conexión móvil real.

**Limitación táctil sin causa confirmada:** un probe adicional a CPU 4× después de pan vertical y
swipes registró pérdida intermitente de click. En `reports/mobile-motion-review/touch-input-diagnostic.json`,
el tap concurrente de Playwright y el CDP secuencial de 0ms enfocaron el perfume; el CDP de 80ms
produjo pointerdown/up y touchstart/end en el mismo control, sin `defaultPrevented`, pero sin click,
y permaneció en browsing. La causa no está confirmada y no se aplica un parche especulativo.
El aislamiento posterior con pulsación de 80ms enfocó sin gestos y después de pan vertical solo;
tras pan y giros volvió a faltar el click (`touch-isolation.json`). Diferir el handler pointerup
al siguiente RAF en un probe temporal tampoco resolvió el caso en dos ejecuciones
(`touch-deferred-up.json`); ese experimento no se incorpora al sitio. No se declara resuelto ni
se atribuye con certeza al harness o a inercia de scroll. Requiere aislar la causa y comprobarlo
en teléfono físico; no se fuerza una apertura en pointerup que pueda causar activaciones
accidentales. La medición de las 17 acciones pareadas, los gestos y este probe posterior son
comprobaciones distintas. Los informes citados viven en `reports/mobile-motion-review/`.

## Validación ejecutada y salvedad de interacción

Las ocho resoluciones y los seis perfumes se recorrieron de nuevo después de las correcciones.
Las capturas y pruebas dirigidas comprueban precios y controles dentro del papel, resúmenes
completos, la escala de tablet y las tres fotografías con referencias y compra accesibles.
La composición conserva el espacio negativo necesario y la plantilla común de detalle.

| Comprobación                                | Resultado de esta revisión                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Tipos                                       | 100 archivos; cero errores, advertencias o hints; TypeScript correcto                                 |
| Lint                                        | ESLint correcto                                                                                       |
| Unitarios                                   | 111/111 en 15 archivos                                                                                |
| Navegador dirigido: catálogo y ocho tamaños | 40/40 correctos                                                                                       |
| Fotografías en frío                         | 10/10 correctos                                                                                       |
| Tacto CDP                                   | 1/1 correcto; un caso de escritorio omitido intencionalmente                                          |
| Capturas antes/después                      | 156 por recorrido, 48 detalles; cero errores de página y overflow horizontal                          |
| Suite E2E completa                          | 183 correctos y tres omisiones intencionales de 186 casos, en 3.9 minutos                             |
| Píxeles durante transiciones                | 236 muestras, doce con clones visibles; cero fondos blancos detectados                                |
| Build final de las 13:45:44 y presupuestos  | JS gzip 122352 bytes, CSS gzip 11449 bytes y HTML máximo 53115 bytes; dentro de límites               |
| Formato e integridad                        | Prettier global correcto; logo y HTML v3 conservan sus hashes aprobados                               |
| Lighthouse móvil                            | Rendimiento 100, accesibilidad 100, buenas prácticas 100 y SEO 66; LCP 1504.329ms, CLS 0 y TBT 0ms    |
| Movimiento: 17 acciones pareadas por perfil | p95 posterior 16.70ms en CPU 1×/4×; cero intervalos >50ms en 1× y uno en 4×; límites descritos arriba |

[Validación general](validation.md) conserva el historial de las revisiones anteriores.

## Límites de la comprobación

Chromium con viewport móvil, tacto y CPU ralentizada sigue siendo una emulación de escritorio.
No acredita 60 FPS sostenidos en un teléfono de gama media, Safari/iOS, Firefox, teclado virtual
físico, notch real, comportamiento térmico, batería ni lectores de pantalla. Los intervalos RAF
no equivalen a medición de presentación de cuadros de la GPU. Una comparación breve de heap no
demuestra por sí sola ausencia de fugas de memoria.

El laboratorio local tampoco acredita INP de campo, percentiles de tráfico ni una red de producción.
No se verifica recepción de WhatsApp ni se envían mensajes: solo se comprueba el formulario y la
preparación del enlace. El sitio permanece local y con noindex; los precios externos son
observaciones de una fuente y fecha concretas, no precios anteriores de AROMAFIA.
