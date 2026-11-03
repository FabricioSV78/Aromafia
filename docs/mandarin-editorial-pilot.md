# Mandarin Sky — piloto editorial del catálogo

Registro histórico del piloto. La petición posterior del propietario autorizó su extensión a los
seis perfumes; el estado vigente está en [detalle editorial compartido](catalog-editorial-all-perfumes.md).
Las restricciones de alcance y rutas de CSS citadas debajo describen esta iteración anterior.

**3 de noviembre de 2026.** Implementación del brief y las dos referencias entregadas por el propietario.
Alcance autorizado: vista general, detalle, transición y calidad de **Odyssey Mandarin Sky**.
Se detiene aquí para revisión visual; todavía no se extiende a los otros cinco perfumes.

## A — Análisis y dirección

La primera referencia dedica el encuadre al frasco, centrado sobre crema, con una línea fina.
La segunda separa producto, información editorial y comparación, con servicios en la base.
Las imágenes adjuntas orientan la composición; ninguna se incrusta como cartel. Nombre, precio,
notas, fuentes y compra permanecen en HTML generado desde el catálogo público.

Paleta local del piloto: papel `#f4e9d6`, luz `#fff9ee`, tinta `#231d15`, bronce `#805a20` y
reglas `#b18b5066`. Se mantienen las familias tipográficas del proyecto: serif de títulos/precio
y sans serif para información. El gesto visual principal es el contraste naranja/turquesa del
frasco real; no se añaden pedestales, frutas, nuevas ilustraciones ni decoraciones animadas.

## B — Vista general

`PerfumeZone` habilita la presentación piloto exclusivamente para el slug estable `mandarine`.
Se conservan dos productos por cara. La fotografía tiene un campo crema cálido y borde fino;
marca, nombre, precio y enlace «Explorar» quedan fuera de la imagen. Los otros cinco mantienen
su composición aprobada. La nueva fotografía procede de Armaf, no de una captura del anuncio.
Encuadre, etiqueta, color y sombra originales se conservan en el archivo; WebP94 responsive sin
ampliación sobre900px. Véanse [investigación](mandarin-pilot-research.md) y
[manifest de derivados](mandarin-pilot-image-derivatives.json).

## C — Detalle editorial

En escritorio, la misma zona ocupa el papel completo, con tres áreas: imagen grande a la izquierda,
nombre/descripción/precio/notas en el centro y referencia/presentación/consulta a la derecha.
Los tres servicios de `commerce.ts` se muestran una sola vez, integrados en el borde inferior del
papel. La fotografía se encuadra mediante CSS conservando visible el frasco; no se genera una caja
para suplir la ausencia de una fotografía adecuada. El enlace de fuente funciona como crédito.

`FragranceNotes` acepta el tratamiento editorial con iconos SVG discretos. Se mantienen las notas
oficiales de Armaf, aunque la referencia gráfica contenga otras. El tercer grupo se denomina
«Notas de fondo», según su significado en el modelo. `InspiredBySection` representa referencias
públicas confirmadas o un pendiente explícito. `ReadingPurchase` reúne el botón y su aviso, con
alternativa nativa a WhatsApp. Solo la compra abre el diálogo compacto existente.

No se ha confirmado un precio anterior ni una relación con Scandal Pour Homme: `regularPrice`
e `inspiredBy` continúan en null. La columna derecha muestra «Referencia olfativa — Por validar»;
no aparece una botella de comparación ni se afirma una equivalencia comercial.

## D — Transición

Se reutiliza la cámara y la compensación FLIP de `book-layout.ts`. Imagen, título y precio son los
mismos nodos antes y después, sin una segunda ficha ni un modal de producto. El estado final
restaura la transformación neutra: texto y fotografía se dibujan a su escala de lectura real.
El cuerpo del piloto se revela de manera progresiva después del movimiento compartido.
El regreso recorre la compensación inversa y recupera la zona y el foco del enlace original.

`data-book-editorial` y `--editorial-height` pertenecen al controlador y se limpian al regresar o
desmontar. La altura móvil se mide una vez por cambio de composición; no se mide ni se anima
layout por frame. Se conservan historial, enlaces profundos, interrupciones, preferencias de
movimiento, cambio de breakpoint y compra. No se añaden motores ni dependencias.

## E — Adaptación y revisión

El nuevo brief autoriza lectura vertical para el **detalle móvil del piloto**, sustituyendo para
él la antigua obligación de encajar toda la información en una pantalla. Nombre/foto, precio,
descripción, notas, referencia, servicios y compra se recorren en el documento, con retorno visible.
El catálogo sigue en una vista; los otros cinco detalles conservan su marco anterior. En escritorio
el libro mantiene sus dimensiones. El regreso desde una posición avanzada recupera el scroll de
entrada; Escape, historial y compra conservan el contexto. Sin JS queda el catálogo legible en flujo.

Pruebas y límites finales se registran en [validación](validation.md). Las evidencias locales están en
`reports/mandarin-pilot/`, `reports/pilot-motion/` y las capturas/mediciones de Playwright.
No se ha publicado la web ni enviado un mensaje de WhatsApp. La extensión a los otros perfumes
queda pendiente de la revisión del propietario.
