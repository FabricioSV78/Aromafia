# Equilibrio editorial de las fichas

**3 de noviembre de 2026.** La petición posterior toma9PM como primer caso y exige una
distribución común para los seis perfumes. Mantiene las correcciones responsive, las
fotografías aprobadas, el libro y las animaciones actuales.

## Hallazgos y decisión

La foto estaba centrada verticalmente en una celda más alta que su propio encuadre, por lo
que empezaba por debajo del título y de la referencia. Las notas ocupaban el principio de
una fila flexible; el resto quedaba vacío antes de los beneficios. En la columna derecha,
`margin-top:auto` enviaba Comprar al fondo y lo separaba de los datos.

Se conserva Grid/subgrid y el wrapper real de lectura. Las tres columnas forman ahora una
banda editorial de altura natural, centrada en el papel cuando el escritorio dispone de
altura suficiente. Fotografía, marca/título y referencia comienzan en la misma línea. La
foto permanece completa y cuadrada, sin recorte, recoloración ni escenas adicionales.

El encabezado, la descripción, el precio y las notas utilizan filas de contenido natural.
Una fila separada absorbe el espacio restante antes de los beneficios, sin estirar los
espacios entre textos. Los datos de presentación y ocasión se agrupan en dos columnas
cuando caben; Comprar sigue inmediatamente después con una separación constante. Las
referencias conservan su tamaño secundario y sus imágenes originales.

Los precios actuales y sus referencias externas alinean su línea de texto y permiten
reflow. Se conserva «Ref.» y su enlace verificable; no se convierte un precio externo en
histórico de AROMAFIA. Royale Opal continúa sin un precio tachado inventado.

En escritorio se mejora moderadamente la lectura de las notas. Las ventanas muy bajas
mantienen su versión compacta y los mismos límites del libro. Móvil y tablet conservan el
flujo vertical, texto ampliado y controles accesibles; no se encoge toda la ficha para
imponer una sola pantalla. No hay selectores por perfume ni posiciones manuales por slug.

## Fotografía y movimiento

Las fotos se usan completas con su fondo horneado aprobado. El papel del detalle sigue
compartiendo `--book-page-surface` con las hojas. No se añade ningún parche para simular
que la foto tiene el mismo color que el papel; se conserva la escena fotográfica Mandarin
aprobada por el propietario y la ausencia de filtros.

El mismo nodo de imagen, título y precio se conserva durante FLIP. `PerfumeReading` sigue
siendo una caja real para revelado y retracción; el fundido de420ms y sus cancelaciones no
cambian. No se modifica el marco del libro ni se añaden dependencias.

## Capturas y comprobaciones

La línea base recorre los seis perfumes en1920×1080,1440×900,1366×768,768×1024,430×932,
390×844,375×667 y320×568:48 detalles y156 capturas de viewport, más vistas generales completas.
Está en `reports/detail-editorial/before/`. El mismo recorrido posterior y sus mediciones
se guardan en `reports/detail-editorial/after/`; las comparaciones se construyen a partir
de esos píxeles, sin retocar las fotos de producto.

Se comprueban los inicios comunes, espacios de referencia/datos/compra, notas/beneficios,
proporciones de fotos, precios, ausencia de solapamientos y lectura de los seis perfumes.
Las regresiones de navegación, compra, movimiento reducido, giro y fundido se ejecutan
con Chromium moderno y un solo worker. Los resultados finales se recogen a continuación.

La regresión final se cerró con **121 aprobados y una omisión prevista de122 casos** en7.6minutos,
cero inesperados y cero flaky. Un worker, cero reintentos y dos procesos Chromium de salida0.
La omisión corresponde al gesto táctil en el proyecto de escritorio; ese mismo gesto pasa en
el proyecto móvil. Se revisaron las ocho hojas de contacto y las comparaciones de9PM, incluida
la referencia/compra móvil. [Visor antes/después](../reports/detail-editorial/review.html),
[escritorio](../reports/detail-editorial/comparison-9pm-1440.png) y
[móvil](../reports/detail-editorial/comparison-9pm-390.png).

Tipos112 archivos sin errores, advertencias ni hints; lint, formato,115 unitarios y build de
Pages correctos. El build conserva69 archivos y126 referencias locales válidas. JS gzip123408,
CSS gzip16533 e HTML máximo51084. Los originales mantienen sus hashes. El ZIP actualizado
mide2959631 bytes y sus69 entradas coinciden por SHA256 con `dist`; sigue sin publicarse.

En9PM a1920px, la separación entre el final de las notas y el comienzo de beneficios pasa
de187.91 a56.59px, conservando exactamente462.08px de ancho para la fotografía. La referencia
mantiene su tamaño y Comprar sube75.06px, agrupado con sus datos. La prueba de equilibrio
recorrió los seis perfumes en1920×1080,1440×900,1366×768 y1024×768: ocho casos correctos,
más cuatro comprobaciones de escritorio bajo/rotación,12 en total en26.2s.

Un recorrido inicial se interrumpió por `net::ERR_CONNECTION_REFUSED` al solicitar la foto
de Opal al preview compartido de4322. La traza no indica un archivo corrupto ni un fallo de
decodificación. Tres recorridos aislados de ese mismo perfume pasaron. La comprobación final
utiliza un puerto reservado mediante `AROMAFIA_TEST_PORT` y un preview aislado controlado
por la sesión de verificación, sin reutilizar otro proceso. El cierre automático del servidor
en Windows dejó un diagnóstico esperando después de completar sus tres recorridos y cerrar
Chromium con código0; se interrumpió ese runner y se separó la sesión del preview de la del
runner mediante `playwright-isolated.config.mts`, dentro de los informes. Esto no modifica
el sitio ni sus recursos. La configuración habitual sigue usando4322 por defecto.

Los ensayos emulados no verifican teléfonos físicos, Safari/Firefox ni60FPS de campo. La
red bloquea el acceso al sitio público; se utiliza el preview de producción local en4322.
Se renueva el ZIP de Pages, sin publicar ni modificar cuentas remotas.
