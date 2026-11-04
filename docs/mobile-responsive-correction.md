# Corrección responsive de la captura del celular

**3 de noviembre de 2026.** La captura del propietario muestra el catálogo publicado en
`aromafia.pages.dev`. La corrección conserva el papel dorado, las fotografías terminadas,
dos perfumes por cara, la navegación del libro y el fundido de420ms.

## Problemas reproducidos

El catálogo fijaba su altura a100svh y repartía el espacio restante en dos filas que podían
ser más pequeñas que su texto. A360×740, Mandarin Sky dejaba «Explorar»16.30px por debajo de
su fila, cruzando el separador. Con texto al125%, el desbordamiento llegaba a74.94px y Qahwa
también excedía su fila. El cambio de tipografía al cruzar720px de altura agravaba la
discontinuidad cuando las barras del navegador cambiaban el espacio disponible.

El texto compartía aproximadamente la mitad del ancho con la imagen. Marca, nombres largos,
descripción, referencia, precio y acción competían por esa columna estrecha. El pie dividía
tres mensajes comerciales en columnas pequeñas; el lienzo marfil del documento podía
aparecer alrededor del catálogo oscuro al desplazarse o cambiar el área del navegador.

## Corrección

- En teléfonos, foto cuadrada y encabezado comparten la primera fila. La descripción utiliza
  el ancho disponible y la fila inferior separa el precio de «Explorar», con44px de altura.
- Las filas respetan la altura de su contenido. El papel conserva un mínimo legible y el
  documento permite desplazamiento vertical si no cabe, en lugar de comprimir o cortar texto.
  Se conserva el scroller de la hoja para contenido ampliado que necesite más altura.
- La tipografía móvil depende del ancho y del tamaño de texto, sin el salto anterior a720px.
  El detalle mantiene su lectura vertical y el escritorio su composición existente.
- El pie usa dos columnas y reserva una fila completa para la contraentrega. Controles y pie
  conservan áreas táctiles amplias. El área segura inferior se reserva en el pie y en el
  retorno sticky, sin duplicarla entre elementos en flujo. Redes y nombres largos permiten reflow.
- El lienzo del documento utiliza el fondo oscuro de esta página. El fondo crema de la intro
  conserva su prioridad; otras páginas mantienen su propio fondo.
- El HTML sin JavaScript presenta foto, datos y compra en flujo vertical legible.
- Con texto al200%, el ancho útil del papel activa una composición vertical cuando la foto y
  el encabezado ya no caben juntos. Precio y acción permiten saltar de línea; los nombres
  largos, los datos complementarios, las notas y la referencia olfativa se reorganizan sin
  reducir el texto para forzarlo a encajar. La imagen de referencia conserva su protagonismo
  secundario y puede situar su nombre debajo cuando necesita más espacio.

Los cambios viven en `mobile-layout.css`, la limpieza de reglas móviles de
`catalog-reference.css` y la propiedad de lienzo de `BaseLayout.astro`/`global.css`.
No cambian fotografías, datos, dependencias ni timelines.

## Evidencia y alcance

La matriz antes/después de `reports/mobile-responsive/` incluye360×740,393×745,390×760,
320×568,390×844,768×1024 y texto al125%. En la primera revisión posterior, ambas acciones
a360×740 quedaron18.36px dentro de su fila, sin desbordamiento; al125% quedaron38.69px dentro.
Los JSON `before-matrix.json` y `after-matrix.json` conservan las medidas.

La nueva regresión `mobile-responsive.spec.ts` recorre los seis perfumes en320×568,
360×740,375×667,390×760,393×745,430×932,768×1024 y844×390; además prueba texto al125%, al200% y el
cambio de altura844→745→844. Comprueba fotos completas, textos y acciones dentro de su fila,
ausencia de superposiciones, navegación táctil, notas, referencia, compra compacta y regreso.
Las comprobaciones existentes de una sola vista siguen aplicándose al escritorio; en móvil
se exige acceso real mediante scroll, sin imponer una altura menor que su contenido.

La comprobación específica de texto al200% a320px terminó con **dos casos aprobados en17.8s**,
en ambos proyectos de Chromium. Recorre los seis perfumes, compra y regreso. Los bloques de
lectura que superan la altura de la pantalla se comprueban por partes alcanzables mediante
scroll; no se exige que todas las notas quepan simultáneamente ni se omite su contenido.

La visita de navegador a la URL pública resultó bloqueada por la red del entorno
(`ERR_NETWORK_ACCESS_DENIED`). Esto no demuestra un error del sitio público. La reproducción
y corrección se comprueban contra el build de producción local en4322 y la captura aportada.
No se prueba un teléfono físico ni Safari/Firefox y no se publica desde este entorno. El ZIP
actualizado debe subirse a Pages para que esta revisión aparezca en el sitio publicado.
