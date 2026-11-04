# Validación del proyecto

## Revisión vigente — restauración del catálogo móvil compacto

**3 de noviembre de2026.** La petición posterior recupera expresamente la primera captura:
foto izquierda y marca, nombre, descripción, precios y Explorar en la columna derecha,
dos perfumes por hoja. Se retira la distribución con descripción/acción debajo de la foto.
Los nombres cortos se aplican únicamente a general; el mismo h4, el detalle, el formulario,
los identificadores y los datos comerciales conservan sus contratos originales.
[Alcance y tabla de etiquetas](mobile-compact-restore.md).

Antes/después:23 capturas por pasada en ocho combinaciones de ancho/alto,48 perfumes visibles
en cada recorrido. Se observaron las tres hojas móviles y muestras de320px,tablet y escritorio.
A360×680,360×740,393×745,390×760 y430×932 el documento no necesita scroll y los controles
quedan dentro del viewport en las tres hojas; en alturas extremas se conserva acceso mediante
scroll, sin mover el contenido fuera de su columna. [Capturas y comparativas](../reports/compact-catalog/review.html).

Tipos114 archivos sin errores, advertencias ni hints;115 unitarios en16 archivos, lint,
formato, integridad y build de Pages correctos. JS gzip123460, CSS gzip16495 e HTML máximo51477.
No se elevan presupuestos ni se añaden dependencias. El paquete tiene69 archivos,3325709 bytes
y126 referencias locales válidas. ZIP renovado:2959698 bytes, todas las entradas coinciden por
SHA256 con `dist`. No se publica desde esta sesión.

La aceptación final completó **111 aprobados y tres omisiones previstas de114 casos** en8.1minutos,
cero inesperados y cero flaky. Un worker, cero reintentos y dos procesos Chromium de salida0.
Las omisiones son las tres comparaciones de borde del giro en el proyecto de escritorio;
las tres pasan en el proyecto táctil móvil. Incluye los seis perfumes, nombres por vista,
compra original, mismo h4, movimiento normal/reducido, retorno, teclado, HTML sin JavaScript,
texto al125%/200%, rotación y cambio de altura. Resultados en `reports/compact-catalog/summary.json`.
La regresión adicional de fotografías iguales y títulos generales completó12 casos correctos
en28.4s, sin omisiones ni reintentos.

## Revisión anterior — equilibrio editorial y responsive

**3 de noviembre de2026.** La corrección parte de9PM y aplica una sola composición a los
seis perfumes: inicios de columna alineados, foto completa, contenido de altura natural,
notas agrupadas, datos y compra próximos y precios alineados por su línea de texto. Se
conservan el papel, las fotos, las animaciones y los nodos reales.
[Cambios y evidencias](detail-editorial-balance.md).

Se capturaron48 detalles antes y48 después, en ocho resoluciones; cada pasada genera156
capturas de viewport y24 vistas generales completas, con cero errores de página y cero
desbordamientos horizontales. Se observaron las ocho hojas de contacto posteriores y las
comparaciones de9PM. Las pruebas de alineación y ventanas compactas completaron12 casos
correctos en26.2s. La regresión final terminó con **121 aprobados y una omisión prevista de122
casos**, cero inesperados y cero flaky, en7.6minutos. Un worker, cero reintentos y los dos
procesos Chromium de salida0. Recorre los seis perfumes, lectura, compra, retorno, texto
al125%/200%, cambios de tamaño, gesto táctil, giro, fundido y movimiento reducido. Los resultados
están en `reports/detail-editorial/final-e2e.json`, `final-e2e-exit.json` y `summary.json`.
Tipos112 archivos sin errores, advertencias ni hints;115 unitarios en16
archivos, lint y formato correctos. [Comparaciones de9PM y los seis perfumes](../reports/detail-editorial/review.html).

Build Pages:69 archivos,3324858 bytes,126 referencias locales; JS gzip123408, CSS gzip16533
e HTML máximo51084. El ZIP actualizado mide2959631 bytes y sus69 archivos coinciden por
SHA256 con `dist`. No se modifican originales ni dependencias y no se publica.

La prueba de recorrido inicial registró una conexión rechazada del preview compartido, no
un archivo fotográfico corrupto. El recorrido final usa un preview aislado en4324 y conserva
un worker y Chromium moderno. La red del entorno bloqueó la URL pública; estas verificaciones
son locales y emuladas, sin acreditar teléfonos físicos, Safari/Firefox ni60FPS de campo.

## Corrección móvil anterior — captura del propietario

El catálogo móvil deja que sus filas crezcan con el contenido, reserva48px tanto cerrado
como abierto y reorganiza foto/título, descripción y precio/acción sin cortar textos. Se
retiran los cambios tipográficos abruptos por altura, se ordena el pie y el lienzo exterior
mantiene el color oscuro. Admite texto al125% y200% y cambio de altura del navegador.
[Corrección y comparativas](mobile-responsive-correction.md).

La aceptación móvil previa a la redistribución posterior terminó con188 aprobados y cuatro
omisiones previstas de192 casos, cero inesperados y cero flaky, en9.6minutos. Un worker,
cero reintentos y dos procesos Chromium de salida0. La matriz adicional cubre diez combinaciones
de ancho/alto/texto; ninguno de sus dos productos por hoja desborda su fila.
[Informe móvil](../reports/mobile-responsive/review.html).

## Revisión anterior — fundido general/detalle

**3 de noviembre de2026.** La petición posterior suaviza el cambio de fotografía al entrar
y regresar. `product-photo.ts` decodifica primero el candidato responsive y funde el único
`img` durante420ms sobre la fotografía anterior completa, conservada temporalmente en su
mismo marco. Al finalizar limpia animación, opacidad y respaldo. Movimiento reducido omite
el efecto; cancelación y desmontaje descartan callbacks tardíos. No cambia la cámara ni el
tamaño del libro. [Implementación y alcance](product-photo-crossfade.md).

La regresión dirigida completó **92 casos correctos**, sin omisiones ni reintentos, en5.4minutos.
Comprueba los seis perfumes, ambos sentidos, carga fría/fallida, consulta y compra, píxeles
sin blanco, nodos reales, lectura editorial, foco, historial y restauración. Un worker con
Chromium moderno; los dos procesos cerraron con código0, sin reproducir el error de memoria.
Resultados en `reports/photo-crossfade/e2e.json` y `e2e-exit.json`.

El muestreo final sincronizado de cámara y fotografía completó otros **seis casos correctos**
en1.4minutos, con procesos nativos de salida0. Se observaron72 cuadros consolidados de los
seis perfumes, entrada y regreso a1440×900 y390×844:
[escritorio](../reports/photo-crossfade/crossfade-1440.png),
[móvil](../reports/photo-crossfade/crossfade-390.png) y
[visor completo](../reports/photo-crossfade/review.html).
Se corrigió una pausa pendiente del compositor en la prueba, sin relajar el umbral de píxeles
ni modificar producción; la evidencia inicial se conserva en `sampling-check/`.

Tipos110 archivos sin errores, advertencias ni hints;115 unitarios en16 archivos, lint y
formato correctos. Build Pages:69 archivos,3319191 bytes,126 referencias locales válidas;
JS gzip123408, CSS gzip15848 e HTML máximo51035. Los originales mantienen sus hashes. El ZIP
renovado pesa2958907 bytes y sus69 archivos coinciden por SHA256 con el build. Mantiene
`noindex`; no se despliega. Chromium emulado no acredita FPS en teléfonos físicos ni Safari/Firefox.

## Revisión anterior — preparación de Cloudflare Pages

**3 de noviembre de2026.** La petición del propietario prepara Pages estático. Se conservó el
render de Astro y se añadieron `build:pages` y `check:pages`, sin dependencias ni CLI nuevos.
El control verifica archivos privados, recursos, rutas HTML/CSS/srcset, intro,404, encabezados
y límites de carga manual. `.gitattributes` conserva los bytes de los originales entre sistemas.
[Guía y configuración](deployment.md).

Build de Pages correcto:69 archivos,3318370 bytes; el mayor mide373531 bytes. Se resolvieron126
referencias locales sin faltantes. El ZIP `artifacts/aromafia-cloudflare-pages.zip` mide2958577
bytes, tiene `index.html` y `_headers` en su raíz y sus69 archivos coinciden por SHA256 con
`dist/`. No contiene fuentes privadas, informes, originales protegidos ni runtime de servidor.

Tipos108 archivos sin errores, advertencias ni hints;115 unitarios en16 archivos, lint, formato,
build, presupuesto e integridad correctos. Las cuatro regresiones nuevas prueban el control
de subida, recuperación de referencias inexistentes, exclusión de archivos privados y política
de iframe. La prueba dirigida de navegador completó **36 casos correctos**, sin omisiones,
inesperados ni flaky, con Chromium moderno, un worker y cero reintentos. Sus dos procesos
secuenciales cerraron con código0. Incluye intro, rutas, teclado, Axe, fallos y HTML sin JavaScript.

Los artefactos están en `reports/cloudflare-pages/`: `preflight.json`, `package.json`,
`smoke-e2e.json`, `smoke-e2e-exit.json`, `summary.json` y logs. La interfaz no se modificó;
la aceptación visual completa anterior se conserva como referencia, sin repetirla como prueba
de publicación. El paquete mantiene `noindex` y no se inventa dominio.

No se creó un proyecto remoto ni se publicó el sitio. La infraestructura Linux de Pages,
los encabezados HTTP de la CDN, DNS y TLS quedan por comprobar cuando se despliegue.

## Revisión anterior — detalle limpio e intro v3

**3 de noviembre de2026.** Las referencias crecen a210px en escritorio,165px en escritorio
compacto y200px en móvil, con fotografía completa3:4. Los títulos usan su altura natural.
Se retiraron del HTML las fuentes bajo la foto, concentración y aviso de similitud; las fuentes
siguen documentadas y el precio externo conserva su enlace en «Ref.».
[Cambios y comparación visual](detail-reference-refinement.md).

La aceptación completa del build final terminó con **212 aprobados y seis omisiones previstas
de218 casos**, cero inesperados y cero flaky, en8.1minutos. Un worker, cero reintentos; runner
y dos procesos Chromium modernos cerrados con código0. Resultados en
`reports/detail-refinement/full-e2e.json`, `full-e2e.log` y `full-e2e-exit.json`.

El recorrido real de los seis perfumes completó156 capturas y48 detalles en ocho resoluciones,
sin errores de página ni overflow horizontal. Se observaron las ocho hojas de contacto y las
capturas de referencia/compra; no se detectaron superposiciones ni recortes nuevos. Las48
fotografías principales mantienen dimensiones dentro de un píxel frente a la revisión anterior.
[Escritorio](../reports/detail-refinement/comparison-1440.png),
[móvil](../reports/detail-refinement/comparison-390.png) y
[visor completo](../reports/detail-refinement/review.html).

Tipos106 archivos sin errores, advertencias ni hints;111 unitarios en15 archivos, lint, formato,
build e integridad correctos. Presupuesto final: JS gzip123039 bytes, CSS gzip15884 e HTML máximo51035.
La suite usa el preview de producción en4322 para no reutilizar por accidente desarrollo en4321.
Chromium emulado no acredita teléfonos físicos, Safari/Firefox ni FPS de campo. No se publica.

## Intro de marca — recursos y fidelidad

**3 de noviembre de2026.** La petición expresa del propietario incorpora la animación v3
antes del catálogo. El original permanece intacto; el derivado reutiliza sus once PNG,
conserva los33 keyframes y se reproduce una vez por pestaña/sesión, con omisión y Escape.
Movimiento reducido, enlaces con fragmento y lectura sin JavaScript mantienen el acceso
directo. Carga, eventos, foco y limpieza tienen recuperación ante fallos.
[Implementación, recursos y límites](brand-intro.md).

La ejecución dirigida terminó con **26 pruebas aprobadas en59 segundos**, antes del refuerzo
posterior con Axe en los dos casos de1440px. La auditoría visual actual completó33 capturas
en1440×900,768×1024,390×844 y320×568: doce pares original/integración a2000,8500 y12500ms,
sin errores de página y con salida nativa de Chromium0. La máxima diferencia media fue0.2537
por canal sobre255; como máximo0.981% de los canales superaron8 unidades, en bordes de letras
a320px. La mayoría de los cuadros coincidieron exactamente. También se observó la intro y
el regreso al catálogo; la pasada automática a tiempo normal terminó en16500ms a390px.
[Comparación de capturas](../reports/brand-intro/review.html).

El primer build de intro registró JS gzip122999 bytes —692 más que antes—, CSS gzip16080 e HTML máximo55275.
Tras medir e investigar el incremento se amplió solo512 bytes el presupuesto JavaScript,
hasta123392. No se añadieron dependencias. La intro deliberadamente precede al catálogo;
las métricas Lighthouse anteriores no describen el rendimiento de esta versión.

La suite final descrita arriba incluye las26 pruebas de intro y el refuerzo de Axe. El iframe
se crea desde un `template` únicamente si la intro se reproduce. Sus13 recursos se verificaron
por HTTP contra el manifiesto, sin cambios en los11 PNG originales. No se conectan servicios.

## Revisión anterior — fondos basados en Mandarin

**3 de noviembre de 2026.** Las imágenes aprobadas de `public/images/perfumes/mandarine/`
fijan el estudio fotográfico de los demás perfumes. Se prepararon dos estudios vacíos con la
herramienta integrada `image_gen`, derivados de sus referencias de general y detalle, y se
compusieron encima las fotografías auténticas sin recolorearlas ni cambiar sus encuadres.
Se corrigió además la extensión del filtro de la sombra horneada para que el desenfoque no
dejara una banda rectangular. La web conserva los archivos completos con proporción nativa,
sin fondos, bordes, máscaras o filtros CSS adicionales.
[Preparación y evidencias](mandarin-background-template.md).

`pipeline-result.json` confirma 42 WebP y 2076424 bytes: 35 variantes actualizadas y los siete
archivos de Mandarin intactos por SHA256. `delivery.json` confirma los 42 archivos servidos
por HTTP con hashes idénticos al manifiesto. Los cuatro muestreos exteriores de fondo por
imagen muestran menor diferencia media RGB respecto a la plantilla; son una comprobación
auxiliar de consistencia, no una medición absoluta de color.

La suite dirigida —editorial, carga retrasada de fotos, transiciones fotográficas y bordes
del giro móvil— terminó con **77 aprobados, tres omisiones intencionales, cero inesperados
y cero flaky**, de 80 casos, en 204292.91ms —aproximadamente 3.4 minutos—. Usó Chromium moderno,
un worker y cero reintentos; el runner y sus dos procesos nativos terminaron con código0.
Se comprueban además las proporciones y la cadena de superficies de las imágenes completas
para los seis perfumes. Resultados en `reports/mandarin-background/e2e.json`, `e2e.log` y
`e2e-exit.json`.

El recorrido visual posterior produjo 156 capturas y 48 detalles en las ocho resoluciones
1920×1080, 1440×900, 1366×768, 768×1024, 430×932, 390×844, 375×667 y 320×568, sin errores de
página ni desbordamiento horizontal. Se observaron las hojas de contacto de los ocho tamaños
y las 18 composiciones nativas, sin parches ni recortes. Chromium —PID29296— cerró con código0.
Evidencias en `reports/mandarin-background/visual/`, `visual.log` y `visual-exit.json`.

Tipos: 100 archivos sin errores, advertencias ni hints. Lint, 111 unitarios en 15 archivos,
build, integridad de originales y presupuesto correctos: JS gzip122307 bytes, CSS gzip10006
bytes y HTML máximo53280 bytes. No se repitieron Lighthouse ni mediciones de FPS; estos
resultados no acreditan teléfonos físicos, Safari/Firefox ni rendimiento de campo.

La [galería de las 18 fotografías](../reports/mandarin-background/gallery.html), el
[catálogo de escritorio](../reports/mandarin-background/visual/1440-overview-1.png) y el
[catálogo móvil](../reports/mandarin-background/visual/390-overview-1.png) permiten revisar la
entrega local. No se publica el sitio ni se conectan servicios.

## Revisión anterior — giro móvil y escala del catálogo

**3 de noviembre de 2026.** Se redujo un poco el precio final de la vista general, manteniendo
el tamaño del detalle. «Abrir libro» se centra y limita a176px en móvil, con48px de altura.
El reverso de la hoja móvil se recorta a los límites del libro mediante `overflow: clip` en
su capa, conservando el giro3D y eliminando la barra que aparecía fuera del papel.
[Causa, cambios y evidencias](mobile-turn-and-type-polish.md).

Se compararon90 capturas antes y90 después en cinco tamaños, incluidos80 cuadros intermedios
por recorrido. El catálogo y los seis detalles se recorrieron además en las ocho resoluciones:
156 capturas y48 detalles, sin errores de página ni desbordamiento horizontal. Se observaron
las imágenes para comprobar proporciones, texto ordenado y alineación móvil.

La nueva regresión de bordes pasó tres casos móviles a320,390 y768px; los tres casos equivalentes
de escritorio se omiten intencionalmente. Son42 cuadros de ida/vuelta con comparación de píxeles
exteriores frente al estado asentado, comprobando también cámara, giro, opacidad, historial y
limpieza. Tipos100 archivos sin errores, advertencias ni hints; lint,111 unitarios e integridad
correctos. Presupuesto: JS gzip122307 bytes, CSS gzip10006 bytes y HTML máximo53280 bytes.

La suite completa de192 casos terminó con **186 aprobados, seis omisiones intencionales, cero
resultados inesperados y cero flaky**, en428456.821ms —aproximadamente7.1minutos—, con un worker
y sin reintentos. El runner y los procesos nativos de Chromium terminaron con código0.
Resultados en `reports/mobile-polish/final-e2e.json`, `final-e2e-exit.json` y `final-e2e.log`.
La [galería de giro](../reports/mobile-polish/turn-review.html), la
[comparativa del avance](../reports/mobile-polish/comparison-390-next-832.png) y la
[portada](../reports/mobile-polish/comparison-390-cover.png) conservan evidencia visual revisable.
No se repitieron Lighthouse ni perfiles RAF para este cambio de CSS; no se reutilizan métricas
anteriores como resultados nuevos. Chromium emulado no acredita teléfonos físicos, Safari/Firefox
ni FPS de campo.

## Revisión anterior — estructura final de imágenes por perfume

**3 de noviembre de 2026.** Los seis perfumes tienen su carpeta estable dentro de
`public/images/perfumes/`, con `general.webp`, `detail.webp` e `inspiration.webp` y sus variantes:
**18 composiciones principales y 42 archivos**. Fondo, sombra y encuadre quedan incorporados en
cada WebP; la interfaz no añade máscaras, bordes ni escenas de estudio. La inspiración aumenta
a 135px, o 108px en escritorio compacto, conservando menor tamaño que el producto principal.
Los recursos públicos suman2111810 bytes —aproximadamente2.11MB— frente a14.33MB del directorio
anterior, que también contenía originales y derivados acumulados.
[Fuentes, prompt, generación y limpieza](perfume-asset-structure.md).

| Comprobación              | Resultado de esta revisión                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Tipos                     | 101 archivos; cero errores, advertencias o hints                                                                                    |
| Unitarios                 | 111 correctos en 15 archivos                                                                                                        |
| Lint                      | Correcto                                                                                                                            |
| Navegador dirigido        | 74 casos aprobados en 3.1 minutos; dos cierres nativos con código 0                                                                 |
| Suite E2E completa        | 183 aprobados y tres omisiones previstas de 186 casos, en 6.9 minutos                                                               |
| Ejecución controlada      | Un worker, cero reintentos, parada tras el primer fallo; dos navegadores modernos secuenciales cerrados con código 0                |
| Inspección visual         | 48 detalles y 156 capturas en las ocho resoluciones, sin errores de página ni desbordamiento horizontal; cierre nativo con código 0 |
| Build y presupuesto       | JS gzip 122307 bytes, CSS gzip 9985 bytes y HTML máximo 53280 bytes                                                                 |
| Regeneración tras limpiar | 42 archivos con SHA256 idénticos; las fuentes privadas conservadas son suficientes                                                  |

Se eliminaron 129 derivados públicos anteriores de perfumes y tres variantes del antiguo estudio;
los tres PNG aportados se trasladaron intactos a fuentes privadas. También se retiraron dos
imágenes privadas antiguas de trabajo y el antiguo maestro privado del estudio. Las diez máscaras
se conservaron como fuentes privadas antes de eliminar sus copias públicas. Logo y HTML v3
permanecen protegidos. Inventarios y resultados en `reports/perfume-assets/cleanup.json`,
`obsolete-studio-cleanup.json` y `regeneration-result.json`.

Las capturas, galería, logs y JSON de pruebas están en `reports/perfume-assets/`. La suite completa
registró183 resultados esperados, tres omisiones, cero inesperados y cero flaky en414112.44ms,
con los dos cierres nativos en código0; resumen en `final-e2e-summary.json`. Lighthouse posterior,
ejecutado por separado, obtuvo rendimiento100, accesibilidad100, buenas prácticas100 y SEO66
con noindex intencional; LCP1506.15465ms, CLS0 y TBT0ms. Su proceso nativo —PID29656— cerró con
código0; informes en `reports/perfume-assets/performance/`. No se atribuyen a esta revisión las
métricas históricas que figuran más abajo. Chromium emulado no acredita Safari/Firefox,
teléfonos físicos ni FPS de campo. No se ha publicado el sitio ni se han enviado mensajes reales.

## Revisión anterior — estabilidad del motor de pruebas en Windows

**3 de noviembre de2026.** Tras el aviso de lectura inválida de memoria en
`chrome-headless-shell.exe`, se verificaron Playwright1.64.1 y sus navegadores compatibles
Chromium156.0.8078.4/revisión1248. Se cambió el runner a un worker, sin paralelismo, y se seleccionó
el Chromium completo en headless moderno tanto en E2E como en los scripts independientes. No se
alteraron funciones de la web, dependencias ni casos de prueba.
[Diagnóstico, fuentes y límites](browser-stability.md).

La comprobación inicial con Shell y su equivalente con Chromium moderno completaron escritorio
y móvil sin crash y con salida0. La suite completa posterior en modo moderno conservó186 casos:
**183 aprobados, tres omisiones intencionales, cero resultados inesperados y cero flaky**, en
419962ms —aproximadamente7.0minutos—, con un worker y sin reintentos. Sus dos lanzamientos
secuenciales de `chromium-1248/chrome-win64/chrome.exe` cerraron con código0; el log
`DEBUG=pw:browser` no contiene marcadores de crash. Evidencia en
`reports/browser-stability/e2e.json`, `e2e-summary.json` y `e2e-exit.json`.

Tipos102 archivos sin errores, advertencias ni hints;111 unitarios en15 archivos, lint/formato,
integridad y presupuesto correctos. El build conserva JS gzip122352 bytes, CSS gzip11413 bytes
y HTML máximo53136 bytes.
El recorrido visual moderno aislado terminó con156 capturas y48 detalles en las ocho resoluciones,
cero errores de página, cero desbordamientos horizontales y salida0 tanto del script como del
proceso nativo. Las hojas de contacto observadas conservan identidad, fuentes, tonos y fotos,
incluido el fondo completo de Mandarin. Evidencia en `reports/browser-stability/visual/`, separada
de los informes históricos mediante `AUDIT_OUTPUT_DIR`.

Lighthouse posterior, ejecutado por turnos, obtuvo rendimiento99, accesibilidad100, buenas
prácticas100 y SEO66 con noindex intencional; LCP2031.95385ms, CLS0 y TBT0ms. Script y proceso
nativo cerraron con código0. Informes en `reports/browser-stability/performance/`. Los seis
lanzamientos secuenciales de esta revisión cerraron con código0; la consulta final a eventos no
identificó errores de Playwright y no quedaron procesos de Headless Shell ni WerFault.

La auditoría actual queda validada para estas ejecuciones controladas sin crash. El error
reportado no se reprodujo ni siquiera en la comparación inicial con Shell; no se confirma una
causa precisa ni una reparación definitiva de la violación de acceso. Si el navegador vuelve a
fallar, se conserva la evidencia y ese nuevo recorrido no se da por aprobado. Las métricas e
imágenes anteriores que siguen debajo se conservan como historia.

## Corrección posterior — fondo del detalle y fotografía completa

**3 de noviembre de2026.** El detalle de los seis perfumes usa ahora el mismo fondo crema dorado
que las hojas del libro mediante `--book-page-surface`, también durante el regreso. Mandarin Sky
tiene una foto cuadrada con fondo lateral extendido; el original vuelve a componerse encima y
se verifica igualdad de los píxeles del frasco y la caja. Se conservan tamaño y proporción.
[Recursos, prompt y comprobaciones](detail-paper-and-photo-background.md).

Se observaron24 vistas de los seis perfumes a1440×900,1366×768,390×844 y320×568: fondo calculado
idéntico, marcos fotográficos y títulos con las mismas dimensiones que antes, compra y regreso
correctos. Capturas y comparativas en `reports/detail-surface-fix/`. Tipos101 archivos sin errores,
lint/formato correctos,111 unitarios y183 casos E2E aprobados, con tres omisiones intencionales.
Tras suavizar la sombra del fondo añadido se reconstruyó el sitio y pasaron de nuevo las24 vistas
y cuatro casos de transiciones fotográficas. Build dentro de límites: JS gzip122352 bytes,
CSS gzip11413 bytes y HTML máximo53136 bytes. No se reejecutaron Lighthouse ni perfiles RAF para
este cambio de CSS y fotografía; sus métricas siguen perteneciendo a la auditoría identificada
debajo. La salvedad táctil allí documentada no se declara corregida por este ajuste visual.

## Revisión anterior — tres fotografías y auditoría visual/móvil

**3 de noviembre de 2026.** La revisión conserva Khamrah Qahwa como plantilla única de detalle,
recupera la imagen secundaria de inspiración de los seis perfumes y añade fotografías de detalle
independientes con sus cajas. Los cinco precios tachados externos tienen fuente/fecha y se
identifican como referencias de otros comercios; no se publica un historial propio desconocido ni
se inventa una cifra para Royale Opal. [Alcance de fotografías y precios](catalog-three-photographs.md).

La auditoría recorre los seis perfumes en 1920×1080, 1440×900, 1366×768, 768×1024,
430×932, 390×844, 375×667 y 320×568. Se observan capturas de antes/después y se prueban
compra, regreso, foco y navegación real. Se corrigieron el recorte vertical a 320×568, resúmenes
truncados, escala reducida en tablet, texto pequeño del pie, gesto táctil interceptado y activación
prematura del encuadre al cargar la fotografía de detalle. Al enfocar desde el catálogo desplazado
a 320px, el inicio del papel se alinea entre capturas FLIP y el regreso conserva el scroll previo,
con pruebas de tap en movimiento normal y reduced motion.
[Hallazgos, evidencias y límites](mobile-visual-audit.md).

| Comprobación                                | Resultado de esta revisión                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Tipos                                       | 100 archivos; cero errores, advertencias o hints; TypeScript correcto                     |
| Lint                                        | ESLint correcto                                                                           |
| Unitarios                                   | 111/111 en 15 archivos                                                                    |
| Catálogo y ocho tamaños: navegador dirigido | 40/40 correctos                                                                           |
| Fotografías en frío                         | 10/10 correctos                                                                           |
| Tacto CDP                                   | 1/1 correcto a 320/390/768px; un caso de escritorio omitido intencionalmente              |
| Capturas comparativas                       | 156 por recorrido, 48 detalles; cero errores de página o desbordamiento horizontal        |
| Suite E2E completa                          | 183 correctos y tres omisiones intencionales de 186 casos, en 3.9 minutos                 |
| Píxeles durante transiciones                | 236 muestras, doce con clones visibles; cero fondos blancos detectados                    |
| Build final de las 13:45:44 y presupuestos  | JS gzip 122352 bytes, CSS gzip 11449 bytes y HTML máximo 53115 bytes; dentro de límites   |
| Formato e integridad                        | Prettier global correcto; logo y HTML v3 conservan sus hashes aprobados                   |
| Lighthouse móvil                            | Rendimiento 100, accesibilidad 100, buenas prácticas 100 y SEO 66 con noindex intencional |
| Laboratorio Lighthouse                      | LCP 1504.329ms, CLS 0 y TBT 0ms; no equivale a INP de campo                               |
| Movimiento: 17 acciones pareadas por perfil | p95 posterior 16.70ms en CPU 1×/4×; cero intervalos >50ms en 1× y uno en 4×               |

**Salvedad abierta:** un diagnóstico táctil adicional a CPU 4× detectó un toque sin click nativo
después de pan y giros, pese a recibir pointerdown/up. La causa no está confirmada; no se declara
corregida ni se atribuye solo a la automatización. El aislamiento y sus límites están en la
[auditoría móvil](mobile-visual-audit.md). Esta salvedad no forma parte de los 183 casos E2E aprobados.

Evidencia: `reports/visual-mobile-audit/before/`, `after/`, 72 pares en `comparison.html` y cuatro
comparativas PNG. La imagen de catálogo a 320px muestra el documento posterior completo con
reflow vertical junto al viewport anterior de 568px; no implica que se comprima todo en esa altura.
Las capturas posteriores esperan el decode de las referencias visibles: una referencia lazy
ausente de una instantánea anterior no se registra como una funcionalidad recién añadida.
Las capturas de espera/resolución de fotografías están en `reports/mobile-motion-review/cold-captures/`.
Lighthouse final está en `reports/visual-mobile-audit/performance/lighthouse.json`, `.html` y
`summary.json`. `motion-comparison.json` registra los recorridos pareados sin errores de página
ni clones finales. A CPU 4× se observaron tres tareas largas por un total de 210ms y un intervalo
RAF máximo de 100ms. Los listeners permanecieron en 42 y el heap tras GC creció 391432/380848 bytes
en CPU 1×/4×; no se declara ausencia de fugas. La línea base usó ratón de recuperación tras fallar
los gestos y el recorrido posterior taps nativos, por lo que una ejecución no demuestra una
mejora estadística. La [auditoría móvil](mobile-visual-audit.md) separa la comprobación táctil
adicional del recorrido de 17 acciones y documenta sus límites.
Las cifras anteriores de Lighthouse y E2E que aparecen debajo son históricas, no resultados del
build actual. La emulación de Chromium no acredita teléfonos físicos, Safari/Firefox, lectores de
pantalla, 60 FPS sostenidos ni INP de campo. No se publica el sitio ni se envían mensajes reales.

## Entrega anterior — plantilla Khamrah y dos roles de fotografía

**3 de noviembre de 2026.** Los seis detalles adoptan la composición de Khamrah Qahwa: imagen a la
izquierda, información y notas centrales, datos complementarios/compra a la derecha y beneficios
en la base. El encabezado común admite una o dos líneas sin desplazar precio y notas. La vista
general alinea también las descripciones y normaliza la escala de las siluetas dentro de marcos iguales.
[Alcance y archivos](catalog-khamrah-unification.md).

`generalImage` y `detailImage` sustituyen el array de imágenes. Son dos roles explícitos y editables,
con derivados y encuadres independientes. El mismo nodo img cambia de source durante el enfoque
y regreso. Las fuentes reales, perfiles ICC y alfa se conservan, sin filtros de color ni anotaciones
comerciales dentro de las fotos. [Procedencia de los 31 derivados](catalog-photo-variants.json).
La comparación no confirmada y «Precio de oferta» se omiten; no se publican precios anteriores inventados.

| Comprobación              | Resultado                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Tipos                     | 88 archivos; cero errores, advertencias o hints; `tsc` correcto                                                                         |
| Lint y formato            | ESLint y Prettier correctos                                                                                                             |
| Unitarios                 | 107/107 en 14 archivos; contrato de dos roles y fill válido                                                                             |
| Navegador                 | 154/154 casos en 3.2 minutos, Chromium de escritorio y emulación móvil                                                                  |
| Comparación visual        | Mandarin y Qahwa a 1440×900 y 1280×720; comienzos de descripción, precio y notas coinciden exactamente en las métricas finales          |
| Vista general             | Seis superficies iguales dentro de 1 px; descripciones alineadas dentro de 2 px; presencia fotográfica uniforme sin desbordar el marco  |
| Detalles y móvil          | 24 comprobaciones visuales de los seis perfumes a 1440/1280/390/320px, sin overflow horizontal; lectura y compra accesibles             |
| Fotografías en movimiento | 238 muestras, incluidas 12 de clones visibles; cero fondos blancos detectados y sin clones residuales                                   |
| Regresiones               | Identidad DOM, proporciones, marco, regreso, apertura/cierre, giro, foco, historial, compra, reduced motion y catálogo sin JS correctos |
| Contraste calculado       | Texto principal 13.09:1, descripción 6.71:1, anterior 5.74:1, precio actual 5.89:1 y Comprar 15.02:1 en sus fondos declarados           |
| Build y presupuesto       | Inicio/404 y robots; JS gzip 122104 bytes, CSS gzip 10219 bytes y HTML máximo 49081 bytes; límites conservados                          |
| Integridad                | Logo y HTML v3 originales conservan SHA256; fuentes de los perfumes intactas y derivados documentados                                   |
| Lighthouse móvil          | Rendimiento100, accesibilidad 100, buenas prácticas 100 y SEO 66 durante preparación con noindex                                        |
| Laboratorio               | LCP 1505.568 ms, CLS 0, TBT 0 ms; no equivale a INP de campo                                                                            |

Evidencia actual: `reports/khamrah-unified/final/` contiene las capturas y métricas finales; el log de
la suite completa, `photo-summary.json`, `contrast.json` y Lighthouse en `performance/` están en
`reports/khamrah-unified/`. Los artefactos de navegador permanecen en `test-results/` y `playwright-report/`.

La preparación de píxeles carga ambos roles fuera del DOM antes del muestreo; no altera sus umbrales
de detección ni crea otra copia visible. La prueba de retorno de compra mide la posición efectiva
con el modal abierto y conserva el límite de 2 px al cerrar: el clic puede revelar previamente un
control que estaba bajo la barra sticky. La navegación del producto y sus timelines no se reescribieron.

No se añadieron dependencias ni se publicó el sitio. Las emulaciones no acreditan Safari/Firefox,
teléfonos físicos, lectores de pantalla, notches reales ni FPS/INP de campo. La entrega termina con
estas correcciones para revisión visual, sin otras funciones.

## Entrega anterior — subfase F de aceptación integral

**3 de noviembre de 2026.** La petición posterior de continuar autoriza la aceptación integral del
libro. Se corrigieron las notas que salían del papel en ventanas de escritorio bajas y el control
enfocado que podía quedar fuera de pantalla después de girar el móvil o cerrar la compra. La
reserva del libro es la misma antes y después del enfoque; en alturas extremas se permite reflow.
Se conservan el diseño editorial y las fotografías aprobadas. [Alcance y archivos](book-navigation-subphase-f.md).

El catálogo transmite su color oscuro al navegador móvil; la 404 conserva el crema. Lighthouse usa
un perfil temporal aislado y un puerto local disponible, con cierre seguro del navegador. Las
comprobaciones finales se ejecutaron individualmente sobre el build de F.

| Comprobación              | Resultado                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Tipos                     | 88 archivos; cero errores, advertencias o hints; `tsc` correcto                                                                 |
| Lint y formato            | ESLint y Prettier correctos                                                                                                     |
| Unitarios                 | 106/106 en 14 archivos                                                                                                          |
| Navegador                 | 150/150 en 3.0 minutos; escritorio Chromium y emulación móvil                                                                   |
| Nuevos recorridos         | Seis perfumes a 915×540 y 1024×600; rotación con compra abierta, campos y selección conservados, cierre y retorno con teclado   |
| Composición               | Marco estable al enfocar; notas dentro del papel y separadas de servicios                                                       |
| Foco e historial          | Regreso sin salto innecesario; control fuera de pantalla recuperado; Escape, recarga, Atrás/Adelante y reduced motion correctos |
| Fotografías en movimiento | 239 muestras, 12 de clones visibles, cero fondos blancos detectados y cero clones residuales                                    |
| Build y presupuesto       | Inicio/404 y robots; JS gzip 122062 bytes, CSS gzip 9981 bytes, HTML máximo 50496 bytes; sin elevar límites                     |
| Integridad                | Logo y HTML v3 originales conservan SHA256                                                                                      |
| Lighthouse móvil          | Rendimiento 100, accesibilidad 100, buenas prácticas 100; SEO 66 por noindex intencional                                        |
| Laboratorio               | LCP 1504 ms, CLS 0, TBT 0 ms; no equivale a INP de campo                                                                        |

Evidencias: `reports/subphase-f/`, con log final, capturas de ventanas bajas, resumen de píxeles y
Lighthouse en `performance/`; detalles de las pruebas en `test-results/` y `playwright-report/`.
Se mantienen alternativas sin JavaScript y ante fallo del módulo. No se añadieron dependencias ni
se modificaron fuentes fotográficas, precios o datos comerciales.

La emulación no acredita Safari/Firefox, teléfonos físicos, notches reales, lectores de pantalla
ni FPS/INP de campo. El sitio sigue local y con noindex, sin pagos ni mensajes reales enviados.
F termina aquí para revisión visual; la publicación externa requiere una solicitud independiente.

## Revisión anterior — seis detalles editoriales y fotografías más claras

**3 de noviembre de 2026.** La ampliación autorizada aplica la composición editorial de Mandarin
Sky a los seis perfumes. En escritorio, cada detalle ocupa el mismo papel con fotografía,
información, notas y consulta; en móvil permite lectura vertical natural. La vista general iguala
el tamaño de las seis superficies fotográficas al de 9PM. Se conservan los nodos reales, la escala
final nativa, el marco de escritorio y el retorno al catálogo. [Alcance, archivos y decisiones](catalog-editorial-all-perfumes.md).

Las fotografías usan WebP calidad 96, con sus perfiles ICC y transparencia cuando existen, sin
ampliar las fuentes. Royale Opal incorpora una fotografía real de Redbag de 2992 × 2992 px, con la
etiqueta original legible y la capacidad 80 ml contrastada. Su máscara y encuadre conservan la corona
completa. [Manifest vigente de Opal](royale-opal-hires-derivatives.json). Los demás derivados están
documentados en [el manifest de claridad](perfume-clarity-derivatives.json).

`data-editorial-detail` sustituye el indicador exclusivo del piloto. Las máscaras SVG externas y
el sprite de iconos evitan repetir sus trazados en el HTML; los presupuestos permanecen intactos.
Los enlaces de fuentes tienen áreas clicables de al menos 44 px y separación suficiente; la
comprobación axe WCAG 2.2 AA de Royale Opal pasa en escritorio y móvil.

| Comprobación                 | Resultado                                                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipos                        | 87 archivos, cero errores; tsc correcto                                                                                                                         |
| Lint                         | ESLint correcto, cero errores                                                                                                                                   |
| Unitarios                    | 106/106 en 14 archivos                                                                                                                                          |
| Navegador                    | Suite completa 146/146 en 2.9 min, Chromium de escritorio y emulación móvil                                                                                     |
| Composición                  | Los seis detalles a 1440 × 900, 1280 × 720, 390 × 844 y 320 × 640; sin overflow horizontal ni solapes entre notas, referencia, presentación, servicios y compra |
| Vista general                | Ancho y alto de las seis superficies fotográficas iguales a 9PM, con tolerancia máxima 1 px en los cuatro tamaños                                               |
| Movimiento y retorno         | Mismos nodos de imagen/título/precio, escala final 1:1, marco de escritorio conservado y posición/foco/scroll restaurados al regresar                           |
| Fotografías en movimiento    | 241 muestras: 120 de enfoque/regreso en escritorio, 85 en móvil, 24 de portada/hojas en escritorio y 12 en móvil;0 fondos blancos detectados                    |
| Clones                       | 12 muestras de clones visibles, 8 de escritorio y 4 de móvil; cada giro termina sin clones residuales                                                           |
| Accesibilidad y alternativas | axe, teclado, Escape, historial, resize, reduced motion, catálogo sin JS/fallo del módulo y compra compacta correctos                                           |
| Build y presupuesto          | JS gzip 121908 bytes, CSS gzip 9920 bytes, HTML máximo 50496 bytes; límites conservados                                                                         |
| Lighthouse móvil             | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 66 por noindex intencional                                                                        |
| Laboratorio                  | LCP 1504 ms, CLS 0, TBT 0 ms; no acredita INP de campo                                                                                                          |

La prueba de fondos conserva sus umbrales: distingue un campo exterior blanco de un reflejo real
mediante al menos dos parches blancos. No se relajaron límites geométricos ni de píxeles. La
primera pasada detectó áreas insuficientes en los enlaces de Blomster/Kingdom; se corrigieron y
la suite final completa pasó con la fotografía y máscara nuevas de Opal.

Evidencia visual y mediciones en `reports/all-editorial/`, auditoría en
`reports/all-editorial/performance/` y capturas/muestras de navegador en los artefactos de
Playwright. No se acreditan Safari/Firefox, FPS de dispositivos físicos ni métricas de campo.
Se conserva noindex; no hubo despliegue, pagos ni envío de mensajes. La revisión visual del
propietario sigue siendo el siguiente paso; no se implementó una subfase F adicional.

Las secciones siguientes registran revisiones históricas. Sus alcances, cifras y limitaciones de
fuentes corresponden a los builds descritos allí; la revisión vigente es la de esta sección.

## Revisión histórica — vista general según la referencia de color y luz

**3 de noviembre de 2026.** La vista general usa papel crema dorado, entorno oscuro cálido,
tipografía serif más fuerte y frascos de mayor tamaño. Cinco contornos SVG recortan únicamente
el campo exterior de fotografías reales; Qahwa usa su alfa original. La mezcla normal conserva
colores, letras y reflejos. La escena plana se realiza en CSS. El libro mantiene su navegación,
datos y compra; el título visible continúa retirado. [Decisiones y archivos](catalog-reference-style.md).

Se igualó de nuevo la reserva de48px de las barras de apertura/navegación/retorno para mantener
el marco. Un ajuste compacto de Mandarin conserva sus notas dentro del papel a1280×720.

| Comprobación               | Resultado                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tipos / lint / formato     | 87 archivos, cero errores/advertencias/hints; tsc, ESLint y Prettier correctos                                                     |
| Unitarios                  | 106/106 en 14 archivos                                                                                                             |
| Navegador                  | Suite completa98/98 en1.9min;96 anteriores y2 perfiles del nuevo caso de geometría                                                 |
| Vista general              | Los seis perfumes a1650×954,1440×900,1280×720,390×844 y320×640; fotos/nombres/precios/enlaces dentro de sus filas sin solapamiento |
| Marco / detalle            | Apertura y enfoque conservan sus dimensiones; Mandarin compacto181.06px de lectura para179.41px de notas                           |
| Fotografías en movimiento  | 124 capturas,244 muestras fotográficas y12 de clones visibles;0 rectángulos blancos detectados                                     |
| Proporción en foco/regreso | 0.99999978–1.00000024; la proyección de giros3D se comprueba por separado                                                          |
| Regresiones                | Foco/teclado, historial, resize, reduced motion, accesibilidad, fallback sinJS/fallo del módulo y compra compacta correctos        |
| Build / presupuesto        | Inicio/404 y robots;JS gzip121909bytes,CSS gzip9843bytes,HTML máximo48437bytes; límites conservados                                |
| Integridad                 | Logo y HTMLv3 originales conservan SHA256; fotografías fuente sin modificaciones                                                   |
| Lighthouse móvil           | Rendimiento100,accesibilidad 100,buenas prácticas 100,SEO 66 por noindex intencional                                               |
| Laboratorio                | LCP1655.97ms,CLS 0,TBT 0 ms; no equivale a INP de campo                                                                            |

Los trazados se redondearon a cuatro decimales para contener el HTML; error menor de0.06px
en la fuente1080px. La prueba de fondos mantiene su detección de parches blancos y los reflejos
reales. Los contornos globales también sirven a los clones de hojas sin duplicar IDs. No se
generaron frascos/cajas/etiquetas ni se añadieron dependencias.

Evidencia de esta revisión histórica: `reports/reference-book/`, con ejecución completa en `final-e2e/` y Lighthouse
en `performance/` (Chromium mediante Playwright, perfil temporal y puerto9334, configuración móvil
habitual). No se acreditan Safari/Firefox ni FPS en dispositivos físicos. No se ha desplegado.

## Revisión anterior — fotografías de estudio y fondos durante las transiciones

**3 de noviembre de 2026.** Los seis perfumes usan fotografías reales encuadradas sobre una escena
cálida común con piedra e iluminación suave. El fondo es un recurso independiente generado con
`imagegen`; no contiene productos ni texto. `ProductHero` conserva los frascos, etiquetas y cajas
existentes, con metadatos de encuadre y puntos de apoyo. Solo Mandarin Sky conserva la composición
editorial completa del piloto. Se mantienen «Ideal para», disponibilidad confirmada sin campo público
y la compra compacta. [Archivos y decisiones](photographic-studio.md).

Se corrigieron dos causas de inconsistencia: el salto de `contain` a `cover` y la deformación
producida al compensar la altura móvil en la cámara. El escenario compartido mantiene su proporción
cuadrada, encaja en cada celda y mezcla su fotografía sobre un fondo opaco propio durante el movimiento.

| Comprobación                  | Resultado                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Tipos / lint / formato        | 85 archivos, cero errores/advertencias/hints; tsc, ESLint y Prettier correctos                                     |
| Unitarios                     | 106/106,14 archivos                                                                                                |
| Navegador                     | `npm run test:e2e`:96/96 en1.8min;92 anteriores y4 fotográficos nuevos                                             |
| Pruebas de imágenes           | 124 PNG,249 muestras fotográficas y12 de clones visibles;0 rectángulos blancos detectados                          |
| Proporción durante movimiento | 0.99999975–1.00000024 en foco/regreso; tolerancia máxima de prueba0.02                                             |
| Acciones examinadas           | Entrada/regreso de los seis perfumes, apertura/cierre y giros en ambos sentidos; escritorio1440×900 y móvil390×844 |
| Revisión visual adicional     | Catálogo a1280×720 y320×640; imágenes dentro de sus filas, sin invadir otros productos                             |
| Regresiones                   | Foco, teclado, historial, resize, reduced motion, fallback sinJS, accesibilidad y compra compacta correctos        |
| Build / presupuesto           | Inicio/404 y robots;JS gzip121909bytes,CSS gzip8880bytes,HTML máximo41195bytes; límites conservados                |
| Originales                    | SHA256 del logo y HTMLv3 conservados; fuentes fotográficas preservadas                                             |
| Lighthouse móvil              | Rendimiento100,accesibilidad 100,buenas prácticas 100,SEO 66 por noindex intencional                               |
| Laboratorio                   | LCP1807.64ms,CLS 0,TBT 0 ms; no equivale a INP de campo                                                            |

La prueba fotográfica reproduce y detecta los campos blancos/grises originales. Examina parches
del fondo visible y excluye reflejos, etiquetas y tapones blancos reales; las caras giradas se
miden en su plano3D. Evidencia final en `reports/photo-transitions/final-photographic-tests/`;
revisión de composición y cuadros intermedios en `reports/photo-studio/`. Lighthouse usa la misma
configuración móvil con Chromium iniciado por Playwright, en perfil temporal/puerto9334; resultados
en `reports/photo-studio/performance/`. No se instaló ninguna dependencia ni se elevó presupuesto.
Las capturas no acreditan FPS de dispositivos físicos ni compatibilidad Safari/Firefox. No hubo despliegue.

## Revisión anterior — piloto editorial Mandarin Sky

**3 de noviembre de 2026.** Aplicadas las referencias visuales únicamente a Odyssey Mandarin Sky:
fotografía oficial independiente, papel crema, composición editorial horizontal, notas con iconos,
referencia explícitamente pendiente y servicios integrados. El precio anterior continúa en null.
El detalle conserva sus nodos originales y termina a escala nativa; no aparece una página adicional
ni un modal de producto. La compra conserva el diálogo compacto aprobado.

La lectura móvil del piloto permite scroll natural según el nuevo brief. Catálogo y otros cinco
perfumes conservan su comportamiento. La entrega se detiene para revisión visual antes de extender
el diseño: [alcance y archivos](mandarin-editorial-pilot.md).

| Comprobación     | Resultado                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipos            | 83 archivos, cero errores, advertencias o hints; tsc correcto                                                                                           |
| Lint / formato   | ESLint y Prettier correctos                                                                                                                             |
| Unitarios        | 106 pruebas en 14 archivos correctas                                                                                                                    |
| Chromium         | 92/92 E2E correctas;84 anteriores y8 del piloto, escritorio/móvil                                                                                       |
| Composición      | Regiones dentro del papel y notas sin superponerse a servicios/compra en 1440×900,1280×720,1024×768; revisión visual adicional896×720                   |
| Móvil / tablet   | Lectura vertical a768/390/320px, sin overflow horizontal; orden de contenido, retorno desde scroll, foco y compra correctos                             |
| Movimiento       | Mismos nodos de imagen/título/precio; matriz final neutra, muestras rAF de entrada/regreso, cambio de breakpoint y reduced motion durante la transición |
| Accesibilidad    | axe en detalle móvil, controles nativos, teclado, Escape, foco y fallback sinJS correctos; foco bronce sobre papel                                      |
| Build            | Inicio/404 y robots;JS gzip121912bytes,CSS gzip8504bytes,HTML máximo39205bytes; presupuestos conservados                                                |
| Integridad       | Logo y HTMLv3 originales conservan SHA256; fuente fotográfica y derivados documentados aparte                                                           |
| Lighthouse móvil | Rendimiento100,accesibilidad 100,buenas prácticas 100,SEO 66 por noindex intencional                                                                    |
| Laboratorio      | LCP1580.87ms,CLS 0,TBT 0 ms; no acredita INP de campo                                                                                                   |

El lanzador habitual de Lighthouse falló al conectar con su puerto CDP9333. La auditoría final se
ejecutó con la misma librería y configuración móvil, iniciando Chromium mediante Playwright en
un perfil temporal y puerto9334; terminó correctamente. Informes en
`reports/mandarin-pilot/performance/`. Capturas generales/detalle a 1440/390/320px y revisión de
1280/1024/896px en `reports/mandarin-pilot/`; muestras y revisión de motion en `reports/pilot-motion/`
y artefactos de Playwright. No se modificó el script de auditoría ni se elevaron presupuestos.

No se acredita Safari/Firefox, hardware móvil físico ni una licencia comercial independiente de
las fotografías por su mera procedencia pública. No se generaron frascos, cajas o comparaciones.
No hubo despliegue, pagos ni envío de mensajes. Los otros cinco perfumes esperan revisión del piloto.

## Revisión anterior — producto solo dentro del libro

**2 de noviembre de 2026.** Retirados «Ver ficha completa», las páginas `/perfumes/[slug]/` y sus
componentes/controladores exclusivos. El nombre seleccionado pasa del centro al extremo derecho
de la barra de lectura, también en móvil. Los enlaces del producto usan hashes del mismo libro.

La alternativa sin JavaScript muestra las seis lecturas y fuentes dentro del catálogo, con
enlaces «Comprar» nativos a WhatsApp. La mejora conserva el modal de compra y su historial;
no se abre otra página de producto. Las rutas retiradas devuelven404.

Comprobaciones correctas: tipos/lint/formato;106 unitarios en 14 archivos;84 pruebas Chromium
escritorio/móvil, ejecutadas en dos bloques (68 de catálogo/lectura y16 de pedidos). Se conserva
la geometría y el retorno de foco, y se comprueban las seis lecturas sin JS y al fallar el módulo.
Build: inicio/404 y robots;JS gzip121742bytes,CSS gzip6962bytes,HTML máximo36351bytes. Ambos
originales conservan SHA256. Evidencia visual en `reports/book-only/`. No se repitió Lighthouse.

## Revisión anterior — catálogo documentado y compra en modal pequeño

**2 de noviembre de 2026.** Retirado el título visible, completados los seis perfumes con fotos,
marca, notas y descripciones documentadas, y «Comprar» abre un diálogo compacto tanto en el libro
como en la ficha nativa. Capacidades confirmadas por el propietario:80ml Royale Opal/Zakat y100ml
en los otros cinco; Mandarin Sky conserva el slug `mandarine`. No se inventan SKU ni existencias.
Alcance, fuentes y archivos en [catálogo y compra](catalog-research-and-purchase-modal.md).

| Comprobación           | Resultado                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Cadena completa        | `npm run verify` correcto                                                                                                  |
| Tipos / lint / formato | 86 archivos, cero errores/advertencias/hints; ESLint y Prettier correctos                                                  |
| Unitarios              | 110 pruebas,15 archivos                                                                                                    |
| Navegador              | 88 pruebas Chromium escritorio/móvil;1.1min                                                                                |
| Datos públicos         | Seis identidades/precios/capacidades, fotos locales y fuentes; stock/SKU pendientes                                        |
| Lectura                | Seis fichas en una vista sin alterar la caja del libro, también durante la transición                                      |
| Modal                  | Libro y ruta nativa, ancho máximo480px, campos/errores completos en320/390/1440px, Escape/backdrop/foco/scroll e historial |
| Fallback               | Catálogo nativo al fallar módulo/sinJS; enlace WhatsApp en ficha sinJS                                                     |
| Artefacto              | 8 páginas,JS gzip122873bytes,CSS gzip9197bytes,HTML máximo35373bytes; límites conservados                                  |
| Integridad             | Ambos originales conservan SHA256; fotos de productos y derivados con procedencia registrada                               |
| Lighthouse móvil       | Rendimiento99,accesibilidad 100,buenas prácticas 100,SEO 66 por noindex                                                    |
| Laboratorio            | LCP1882ms,CLS 0,TBT 0 ms                                                                                                   |

Fuentes técnicas: fabricantes para Afnan/Rasasi/Armaf/Lattafa; dos distribuidores concordantes
para Royale Opal, identificados como tales en la ficha. Fotografías responsive locales WebP90,
sin recorte ni ampliación por encima de las fuentes. No se publicaron precios o existencias ajenos
ni equivalencias/inspiraciones no verificadas. Los términos comerciales y capacidades proceden
del propietario. Precio anterior sigue sin confirmar y no se representa como histórico.

Se retiraron metadatos/callbacks/eventos obsoletos del controlador para mantener el presupuesto,
sin elevarlo ni cambiar dependencias. El margen JavaScript es mínimo: investigar nuevas cargas
antes de ampliarlo. Originales de marca sin cambios. Revisión visual en `reports/catalog-research/`
y `reports/purchase-modal/`; Lighthouse en `reports/catalog-research/performance/`.
Los límites Safari/Firefox, hardware móvil físico e INP de campo siguen sin acreditarse.
No hubo despliegue, pagos ni conversaciones reales de WhatsApp. F adicional sigue pendiente.

## Revisión anterior — mismo tamaño al abrir el detalle

**2 de noviembre de 2026.** Se conserva la geometría del libro al enfocar un perfume y al regresar.
Las filas de encabezado, pie y controles reservan espacio; el detalle y formulario se acomodan
al mismo marco. Los seis perfumes caben en una vista a 1440×900,390×844 y320×640. Las pruebas
comparan cámara, volumen y páginas antes/durante/después y en cuadros intermedios, con tolerancia2px.

Tipos, ESLint y105 unitarios correctos;26 pruebas focales de lectura/pedidos y84 de la suite general
correctas. Las mediciones visuales finales registran diferencia0px en las tres partes del libro
para catálogo, detalle, retorno y pedido en los tres tamaños, sin overflow ni errores JavaScript.
Artefactos visuales: `reports/book-fixed-size/`. Build:
JS gzip121636bytes, CSS gzip8801bytes, HTML máximo36100bytes; límites conservados.
Archivos y decisiones: [revisión de tamaño](book-navigation-subphase-e.md#revisión-posterior-conservar-el-tamaño-del-libro).
Los resultados Lighthouse y rAF de E son históricos; no se midieron de nuevo para este ajuste.

## Revisión anterior — redes en navbar y limpieza del libro

**2 de noviembre de 2026.** Instagram/Facebook/TikTok con iconos y nombres en el navbar; retirados
eyebrow, contador/copy superior, eslóganes laterales y fila inferior de redes/copy.
Archivos y decisiones en la [revisión de E](book-navigation-subphase-e.md#revisión-posterior-navbar-y-limpieza-del-marco).

`npm run verify` correcto:105 pruebas unitarias y84 de navegador, tipos/lint/formato sin fallos,
ambos originales conservados. Tras el ajuste final del CSS pasaron otras18 pruebas de layout y accesibilidad.
Revisión visual a320×640,390×844,768×900 y1440×900 sin overflow, con controles de al menos44px:
`reports/navbar-cleanup/`. Build final: JS gzip121662bytes, CSS gzip8776bytes, HTML máximo36100bytes.
No se añadieron dependencias ni se modificó el motor del libro. Las métricas de carga siguientes
son del cierre E anterior a esta limpieza; no se atribuye una nueva auditoría Lighthouse a esta revisión.

## Cierre de subfase E — lectura completa de una sola vista

**2 de noviembre de 2026.** Logos ampliados e integrados, composición completa del perfume sobre
su mismo papel y formulario de consulta por WhatsApp. Alcance y archivos:
[subfase E](book-navigation-subphase-e.md). F queda pendiente de revisión posterior.

| Comprobación          | Resultado actual                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Verificación completa | `npm run verify` correcto                                                                                                                      |
| Tipos, lint y formato | 78 archivos Astro/TS; cero errores, advertencias o hints; ESLint/Prettier correctos                                                            |
| Unitarios             | 105 pruebas, 13 archivos                                                                                                                       |
| Chromium              | 84 pruebas en escritorio/móvil; aproximadamente un minuto                                                                                      |
| Lectura               | Seis perfumes, mismo DOM de imagen/título/precio, información completa sin scroll interno en 1440×900, 390×844 y 320×640                       |
| Formulario            | Selección pública, campos/errores accesibles y dentro del papel, URL codificada interceptada sin mensajes reales                               |
| Navegación            | Foco, Escape, Atrás/Adelante, recarga, `/pedido`, regreso al libro y reduced motion, incluso al cancelar el retorno                            |
| Alternativas          | Sin JS, fallo del módulo con recuperación nativa en tres segundos y reflow a 320×450                                                           |
| Visual                | 40 cuadros deterministas y ocho contactos de giro/apertura/cierre; 19 capturas integradas finales; regresión de geometría durante zoom/regreso |
| Build                 | 8 páginas estáticas y robots; sin dependencias nuevas                                                                                          |
| Presupuesto           | JS gzip121662bytes, CSS gzip8938bytes, HTML máximo36418bytes; límites sin elevar                                                               |
| Integridad            | PNG oficial y HTML v3 conservan ambos SHA256                                                                                                   |
| Lighthouse móvil      | Rendimiento100, accesibilidad 100, buenas prácticas 100, SEO 66 por noindex                                                                    |
| Laboratorio           | LCP1357ms, CLS 0, TBT 0 ms; límites cumplidos                                                                                                  |
| rAF local             | Ocho recorridos; mediana16.7ms, p95 móvil emulado≤16.8ms/escritorio≤33.3ms, máximo33.4ms                                                       |

La revisión intermedia detectó y corrigió variables de tween compartidas que hacían salir de la
vista al producto, y errores del formulario que se recortaban en 320px. La auditoría detectó un
CLS inicial de 0.150: reservar el libro cerrado antes del primer pintado lo redujo a0, conservando
recuperación al fallar el módulo. El libro mantiene imagen/título/precio reales, sin modal o copias.

Artefactos: `reports/book-subphase-e/final/`, `motion/deterministic/`, `performance/lighthouse.*`
y `playwright-report/`. Se conserva además muestreo temporal de 40 cuadros en `motion/`; no es
una medición de FPS. Las fotografías, notas y presentaciones siguen pendientes. Los resultados
de carga no acreditan INP de campo ni Safari/Firefox o hardware móvil físico. No hubo despliegue,
conexión de servicios ni envío de conversaciones.

Se revalidó `npm audit`: producción sin avisos conocidos; auditoría completa con13 moderados
en herramientas de desarrollo, propagados desde `minimatch`/ESLint/typescript-eslint y el aviso
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). No se aplicaron overrides
ni cambios forzados de versiones. Informes actuales: `reports/book-subphase-e/npm-audit*.json`.
Las cifras de severidad del registro histórico de fundamentos pertenecen a aquella consulta.

## Entrega anterior — subfase D y revisión visual de movimiento

**2 de noviembre de 2026.** Detalle dentro del papel y giro corregido, sin cambios prematuros de
fondo ni fade del padre 3D. Alcance: [subfase D](book-navigation-subphase-d.md). Evidencia de cuadros
intermedios: [pruebas visuales](motion-visual-subphase-d.md).

| Comprobación          | Resultado actual                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Tipos, lint y formato | Correctos; 68 archivos Astro/TS sin errores/advertencias                                     |
| Unitarios             | 78 pruebas correctas, 9 archivos                                                             |
| Chromium              | 66 pruebas correctas en escritorio y móvil; 42.0s                                            |
| Lectura               | Mismo DOM, seis detalles, región interna, notas, referencia menor, CTA y retorno             |
| Acceso                | axe, teclado, foco, Escape, historial, recarga y reduced motion                              |
| Visual                | 48 cuadros, ocho contactos, dos vídeos; avance/retroceso/apertura/cierre                     |
| rAF local             | En 12 pasadas continuas: mediana 16.7ms, p95≤16.8ms, con intervalos aislados 33ms escritorio |
| Build                 | 8 páginas estáticas y robots                                                                 |
| Tamaños               | JS emitido gzip 119736bytes; CSS gzip 7475bytes; HTML máximo 33607bytes                      |
| Integridad            | Ambos SHA256 originales conservados                                                          |
| Lighthouse móvil      | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 66                             |
| Laboratorio           | LCP 1355ms, CLS 0, TBT 0ms; límites cumplidos                                                |

Se detectó y corrigió un CLS inicial de 0.703 retirando el halo decorativo. El muestreo rAF conserva
también la pasada inicial menos favorable, no prueba 60 FPS en hardware real. Carga medida con
placeholders; no acredita INP real ni compatibilidad Safari/Firefox. Informes actuales en
`reports/book-subphase-d/`, `playwright-report/` y `reports/lighthouse.*`. En ese cierre E permanecía pendiente.

## Entrega anterior — subfase C y corrección de portada

**2 de noviembre de 2026.** Libro mayor, apertura/cierre con geometría estable y cámara reversible
sobre el nodo real del perfume. Sin modal. Alcance y archivos: [subfase C](book-navigation-subphase-c.md).

| Comprobación          | Resultado actual                                                                      |
| --------------------- | ------------------------------------------------------------------------------------- |
| Tipos, lint y formato | Correctos; 65 archivos Astro/TS sin errores/advertencias                              |
| Unitarios             | 78 pruebas correctas, 9 archivos                                                      |
| Chromium              | 56 pruebas correctas en escritorio y móvil;33.3s                                      |
| Acceso                | axe, teclado, foco, inert, regreso, historial y recarga correctos                     |
| Geometría             | Portada sin salto, libro mayor, cámara sobre mismo DOM y retorno al bbox original≤2px |
| Responsive            | 320×640,390×844,768×900 y1440×900; sin overflow del libro                             |
| Alternativas          | SinJS y reduced motion inicial/durante animación                                      |
| Build                 | 8 páginas estáticas y robots                                                          |
| Tamaños               | JS emitido gzip119274bytes; CSS gzip6837bytes; HTML máximo20284bytes                  |
| Integridad            | SHA256 de ambos originales conservados                                                |
| Lighthouse móvil      | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 66                      |
| Laboratorio           | LCP1357ms, CLS 0, TBT 0ms; límites cumplidos                                          |

Los informes actuales están en `reports/book-subphase-c/`, `reports/book-cover-fix/`,
`playwright-report/` y `reports/lighthouse.*`. D integrará los detalles dentro del libro y E
el formulario. Las cifras de carga no acreditan FPS ni INP real; no se probó Safari/Firefox
o hardware móvil físico. Los registros siguientes son entregas anteriores.

## Entrega anterior — navegación espacial, subfase B

Validada A e implementada únicamente B el **2 de noviembre de 2026**. Dos perfumes por cara,
cuatro por apertura de escritorio, una cara por vista móvil y contraportada. Modal retirado;
las rutas nativas se conservan durante la preparación de C. Alcance y archivos:
[subfase B](book-navigation-subphase-b.md).

| Comprobación          | Resultado actual                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Tipos, lint y formato | Correctos                                                                                        |
| Unitarios             | 68 pruebas correctas, 8 archivos                                                                 |
| Chromium              | 42 pruebas correctas en escritorio y móvil; 20.5s                                                |
| Responsive y acceso   | Libro en una vista a 320×640, 390×844, 768×900 y 1440×900; axe, teclado, foco, gesto e historial |
| Mejora progresiva     | Sin JS, reduced motion y cambio de preferencia durante el giro                                   |
| Build                 | 8 páginas estáticas y robots                                                                     |
| Tamaños               | JS emitido gzip 118028bytes; CSS gzip 6562bytes; HTML máximo 19918bytes                          |
| Integridad            | SHA256 de ambos originales conservados                                                           |
| Lighthouse móvil      | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 66                                 |
| Laboratorio de carga  | LCP 1356ms, CLS 0, TBT 0ms; presupuestos cumplidos                                               |

Informes actuales en `reports/lighthouse.*`, `reports/book-subphase-b/` y `playwright-report/`.
Carga medida con placeholders; no prueba FPS, INP real ni hardware móvil/Safari/Firefox. No hubo
despliegue ni cambios de dependencias. Los registros siguientes son entregas anteriores.

## Entrega anterior — fase 4

El **2 de noviembre de 2026** se verificó el libro de una sola vista, apertura/cierre y paso de
hoja en 3D, detalles con zoom y seis rutas estáticas. Alcance, archivos y límites:
[fase 4](catalog-phase-4.md).

| Comprobación            | Resultado actual                                                           |
| ----------------------- | -------------------------------------------------------------------------- |
| Tipos, lint y formato   | Correctos                                                                  |
| Unitarios               | 67 pruebas correctas, 8 archivos                                           |
| Chromium                | 42 pruebas correctas en escritorio y móvil; 25s                            |
| Accesibilidad           | axe sin violaciones en portada/libro/diálogo, teclado y retorno de foco    |
| Responsive              | Libro sin scroll de documento a 320×640, 390×844, 768×900 y 1440×900       |
| Mejora progresiva       | Sin JS, movimiento reducido, fallback al fallar fetch, recarga e historial |
| Build                   | 8 páginas estáticas y robots                                               |
| Tamaños                 | JS emitido gzip 118655bytes; CSS gzip 6526bytes; HTML máximo 21370bytes    |
| Integridad              | SHA256 del logo y animación aprobada sin cambios                           |
| Lighthouse móvil        | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 66           |
| Métricas de laboratorio | LCP 1365ms, CLS 0, TBT 0ms; presupuestos cumplidos                         |

Noindex explica la penalización SEO; no hay dominio canónico inventado. No hubo nuevas
dependencias ni despliegue. El formulario corresponde a fase 5. Los informes actuales están en
`reports/lighthouse.html`, `.json`, `reports/book/` y `playwright-report/`.
Las cifras son de laboratorio con placeholders; no acreditan INP real ni compatibilidad Safari/Firefox.

## Registro histórico — fundamentos

Los resultados y límites siguientes corresponden a la pantalla mínima anterior al catálogo.
Las cifras actuales de la fase 4 se encuentran arriba; no se deben atribuir al catálogo las cifras
ni la ausencia de JS/contenido de aquella pantalla inicial.

Ejecutada el **2 de noviembre de 2026**, Windows, Node24.18.1, npm11.16.0.
El archivo de bloqueo registra las versiones exactas de la entrega.

## Resultados

| Comprobación               | Resultado observado                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Integridad de marca        | PNG oficial y HTML v3 aprobados conservan sus hashes SHA256                                    |
| Typecheck                  | Astro + `tsc --noEmit`: 0 errores, 0 advertencias                                              |
| Lint                       | ESLint: correcto                                                                               |
| Formato                    | Prettier: correcto                                                                             |
| Unitarios                  | 44 pruebas correctas, 5 archivos                                                               |
| Build                      | Correcto, salida estática: inicio, 404 y robots                                                |
| Presupuesto                | HTML máximo4863bytes; JS total emitido gzip68213bytes; CSS externo0 (CSS inline)               |
| Navegador                  | 8 pruebas correctas en Chromium escritorio y móvil; ejecución final4.4s                        |
| Accesibilidad automatizada | axe sin violaciones en los perfiles probados; teclado y enlace de salto correctos              |
| Sin JavaScript             | Contenido principal visible y usable a320px                                                    |
| Motion real                | GSAP + ScrollTrigger cargan; contexto, trigger, estilos y AbortSignal se limpian correctamente |
| SEO habilitado aislado     | Build de prueba en caché generó canonical, robots Allow y sitemap coherentes                   |
| SEO de entrega             | noindex/nofollow, robots Disallow; sin canonical ficticia ni JSON-LD inventado                 |
| Dependencias de producción | `npm audit --omit=dev`: 0 vulnerabilidades conocidas                                           |

`npm run verify` completó la cadena de integridad, tipos, lint, formato, unitarios, build,
presupuesto y navegador. En el sandbox Windows el cierre del servidor hijo quedó retenido;
se terminó el servidor creado para esa prueba y se verificó nuevamente `test:e2e` fuera de la
restricción: las8 pruebas y el cierre automático finalizaron correctamente. No se cambió la
política de ejecución de Windows. En este equipo se usa `npm.cmd`.

La prueba del contrato SEO utiliza `https://example.test` **solo como fixture en `.cache/`**;
no se publicó ni permanece en el build entregado. Después se reconstruyó `dist/` con la
configuración local no indexable. La prueba real de GSAP se realizó sobre un nodo temporal
en el navegador de desarrollo y se retiró; no se añadió una escena a la aplicación.

## Medición de rendimiento

Lighthouse móvil, ejecución final con preview de producción local:

| Métrica          | Resultado                                             |
| ---------------- | ----------------------------------------------------- |
| Rendimiento      | 100/100                                               |
| Accesibilidad    | 100/100                                               |
| Buenas prácticas | 100/100                                               |
| SEO              | 63/100; bloqueo de indexación deliberado en esta fase |
| LCP              | 609ms aproximadamente                                 |
| CLS              | 0                                                     |
| TBT              | 80ms                                                  |

Informes locales: `reports/lighthouse.html` y `.json`. El script de auditoría pasó los
presupuestos configurados. Una medición adicional de Chrome DevTools sin throttling registró
LCP28ms y CLS 0; no se compara directamente con la simulación móvil de Lighthouse.
La inspección de red de la página base mostró una sola petición HTML y ningún script de
aplicación descargado. El runtime React emitido en dist no está referenciado por la página actual.

Estas cifras corresponden a una pantalla mínima, no al catálogo final. El TBT no prueba INP,
y no existe tráfico/CrUX de usuarios reales. Repetir con las imágenes, fuentes, filtros y escenas
definitivas. No se afirma validación en Safari, Firefox, lector de pantalla o hardware móvil real.

## Avisos de dependencias de desarrollo

La auditoría completa reporta **13 avisos moderados, 0 altos y 0 críticos**, todos en la cadena
de herramientas de desarrollo. Son propagaciones del aviso de `minimatch@10.2.6` utilizado por
ESLint/config-array/typescript-eslint. El riesgo descrito es denegación de servicio al procesar
patrones glob que amplifican trabajo; esas herramientas no forman parte del runtime público.
[Aviso primario GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

El registro señala corrección en la línea11. No se forzó un override fuera de los rangos de los
paquetes superiores ni se aplicó `npm audit fix --force`, que proponía cambios mayores/regresivos.
Mantener los patrones de herramientas bajo control del repositorio y revisar versiones de
ESLint/typescript-eslint cuando incorporen el arreglo. Es deuda de tooling explícita; no se
presenta la auditoría completa como libre de avisos. Informe local: `reports/npm-audit.json`.

## Límites de la entrega

- La interfaz definitiva del catálogo y las escenas creativas siguen pendientes del brief del usuario.
- El origen de productos es local y vacío. No hay autenticación, pagos, carrito ni administración.
- No se conectaron Supabase, R2 ni otros servicios; no se crearon cuentas o recursos.
- Cloudflare está previsto a nivel de artefacto/arquitectura. No hay despliegue ni pipeline validado;
  la limitación de cf beta se documenta en `deployment.md`.
- No se han auditado flujos de compra ni datos comerciales inexistentes.
- No se generaron ni alteraron ilustraciones del personaje en esta fase.

La base queda lista para definir la experiencia visual y ampliar las pruebas sobre comportamientos
reales en esa siguiente fase.
