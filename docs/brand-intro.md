# Intro de marca con la animación v3

**3 de noviembre de 2026.** El propietario pidió expresamente que la animación aprobada de
`pantalla_inicial/AROMAFIA · Animación de logo v3 (1).html` aparezca antes del catálogo.
Esta petición sustituye la decisión anterior de conservarla únicamente como referencia.
El archivo original y el PNG oficial permanecen intactos.

## Comportamiento

En la primera entrada al inicio de la web se muestra la animación v3 a pantalla completa,
sobre su fondo original. Se reproduce una pasada de su ciclo principal de 16 segundos y
después se retira mediante una transición de opacidad de 350ms. El catálogo conserva su
portada y su funcionamiento; no se abre automáticamente el libro.

«Saltar intro» y Escape permiten entrar antes. Al terminar o saltar se guarda
`aromafia:intro:v3:seen=1` en `sessionStorage`, para no repetirla al recargar o volver al
inicio en la misma pestaña. La marca no persiste entre sesiones. Si ese almacenamiento
no está disponible, la intro funciona igualmente y el acceso al catálogo no depende de él.

Los enlaces con fragmento, incluidos los de un perfume o una compra, conservan el acceso
directo a su destino y omiten la intro. También se omite cuando está activo
`prefers-reduced-motion: reduce`. Sin JavaScript el catálogo sigue visible y el iframe no
solicita sus recursos.

## Conservación e integración de los recursos

`src/features/intro/services/intro-document.server.ts` comprueba el SHA256 del HTML original
contra `docs/original-assets.json` antes de preparar los recursos estáticos. Reutiliza los
once PNG que ya estaban embebidos, conservando sus bytes; no vuelve a separar el personaje,
no modifica sus capas y no regenera ni vectoriza el logo. Se conservan los 33 keyframes,
los colores, las proporciones y el contenido original de la escena.

`src/pages/intro/v3/[file].ts` genera durante el build estas rutas locales:

| Recurso                      |      Tamaño preparado | Tratamiento                                            |
| ---------------------------- | --------------------: | ------------------------------------------------------ |
| `/intro/v3/scene.html`       |            7366 bytes | Documento derivado, pausado inicialmente y con noindex |
| `/intro/v3/scene.css`        |           39749 bytes | CSS original y reglas de integración                   |
| Once PNG con nombre por hash | 460384 bytes en total | Bytes originales extraídos del HTML                    |

Los cambios del derivado son las rutas de esos recursos, el CSS externo, la pausa inicial,
una sola iteración de `.stage` y los metadatos noindex. No se copia el HTML original íntegro
al build ni se incorporan sus datos base64 al documento principal. El manifiesto del servicio
registra hashes, dimensiones, tratamiento y procedencia.

`BrandIntro.astro` aloja la escena en un iframe del mismo origen, aislando sus estilos del
libro. Usa `sandbox="allow-same-origin"`, sin permiso de scripts. La presentación exterior
es un `dialog` nativo, con botón de omisión y manejo de Escape; el detalle de los perfumes
sigue en el papel y el modal de compra conserva su alcance propio.

`public/_headers` pasa de `X-Frame-Options: DENY` a `SAMEORIGIN` para permitir esta composición
local e impedir la incrustación desde otros orígenes. Son encabezados preparados para el
hosting futuro; esta revisión no publica el sitio ni acredita su aplicación en producción.

## Carga, recuperación y limpieza

El bootstrap del `head` reserva el fondo de la intro antes del primer pintado y oculta
temporalmente el catálogo. Un temporizador independiente de tres segundos lo libera si
el módulo cliente no se inicia. El controlador `brand-intro.ts` abre la presentación,
pone el foco en «Saltar intro» y limita a ocho segundos la espera de los recursos.

El documento del iframe comienza con sus animaciones pausadas. Solo se inicia después
de cargar la escena y decodificar sus imágenes. Una respuesta sin `.stage`, un fallo de
carga o una decodificación fallida libera el catálogo. El evento de final de `.stage`
coordina la salida normal; un plazo de 17 segundos evita depender de ese evento.

El iframe se instancia desde un `template` únicamente si se va a reproducir. Las sesiones ya
vistas, los enlaces directos y el HTML sin JavaScript no crean un documento `about:blank` que
las herramientas de navegador puedan intentar instrumentar dentro del sandbox.

Al salir se restaura el color del navegador, se retiran el estado de bloqueo y el iframe,
se abortan los listeners y se cancelan los temporizadores. Se devuelve el foco a «Abrir
libro», o al contenido si ese control no está visible. La preferencia de movimiento
reducido activada durante la reproducción la termina inmediatamente. Ocultar la pestaña,
`pagehide` o `astro:before-swap` también limpian la presentación, sin dejar la animación
ejecutándose detrás del catálogo ni reiniciarla al restaurar la página.

## Presupuesto y límites de rendimiento

La primera medición del build de integración registró JS gzip122999 bytes frente a122307 antes:
el controlador añadió692 bytes, sin dependencias ni otro motor de animación. El límite de
120KiB quedaba excedido en119 bytes; después de investigar el incremento se amplió únicamente
en512 bytes, hasta123392. CSS gzip16080 bytes sigue bajo20480 e `index.html`, de55275 bytes,
sigue bajo57344. La revisión posterior conjunta del detalle y la creación diferida del iframe
registra JS gzip123039 bytes, CSS gzip15884 y HTML máximo51035. Los recursos de la escena se
solicitan únicamente cuando se reproduce.

La primera visita espera deliberadamente a la animación, salvo que el visitante la salte.
Eso cambia la experiencia y puede cambiar el LCP respecto al catálogo sin intro. Las
mediciones Lighthouse anteriores no describen esta versión. No se afirma rendimiento100,
LCP de campo ni60FPS sostenidos sin nuevas mediciones.

## Validación de esta revisión

Las evidencias de esta integración están en `reports/brand-intro/`:

- La ejecución dirigida terminó con **26 pruebas aprobadas**, sin omisiones, en59 segundos,
  con un worker y Chromium moderno. Comprueba primera vista, omisión, Escape, sesión, acceso
  directo, movimiento reducido, fallos y lectura sin JavaScript. Ese resultado es anterior
  al refuerzo posterior con Axe en los dos casos de1440px; la suite completa actual contiene
  también esas comprobaciones de accesibilidad.
- `scripts/audit-brand-intro.mjs` completó la comparación real en1440×900,768×1024,390×844
  y320×568: doce pares de cuadros a2000,8500 y12500ms, más la intro y el catálogo completos.
  Son33 capturas PNG, sin errores de página y con cierre nativo de Chromium en código0.
- La mayoría de los pares son idénticos. La máxima diferencia media por canal fue0.2537
  sobre255, y como máximo0.981% de los canales difirieron más de8 unidades. Los pequeños
  cambios se localizaron en los bordes rasterizados de las letras a320px; no implican
  cambios de imágenes, keyframes, colores o geometría.
- Se observaron las capturas de intro de1440,390 y320px, las comparativas de12500ms y las
  salidas al catálogo. Una pasada adicional a tiempo normal en390px terminó automáticamente
  en16500ms, incluyendo la retirada de la presentación y la comprobación del catálogo.
- La [comparación interactiva de capturas](../reports/brand-intro/review.html) permite elegir
  resolución y momento. Los datos están en `visual/metrics.json`; no son mediciones de FPS.

La aceptación conjunta con la revisión del detalle terminó con **212 pruebas aprobadas y seis
omisiones intencionales de218 casos**, cero inesperados y cero flaky, en8.1minutos. Incluye
el refuerzo con Axe durante la intro, fallos de recursos, omisión, sesión, movimiento reducido,
teclado, HTML sin JavaScript y todo el catálogo. Usó un worker y cero reintentos; el runner y
los dos procesos Chromium secuenciales cerraron con código0. El resultado final está en
`reports/detail-refinement/full-e2e.json` y `full-e2e-exit.json`; los intentos anteriores de
`reports/brand-intro/` quedan como diagnóstico, no como resultado final.

Las pruebas finales usan el preview de producción aislado del puerto4322. El4321 puede estar
sirviendo desarrollo y no se reutiliza para validar módulos estáticos. Los13 recursos de la
escena coinciden por HTTP con sus hashes del manifiesto (`asset-delivery.json`). Tipos106
archivos sin errores,111 unitarios, lint, formato e integridad de originales correctos.

Esta entrega es local. No incluye publicación ni servicios nuevos, y las pruebas emuladas
no acreditan Safari, Firefox o teléfonos físicos.
