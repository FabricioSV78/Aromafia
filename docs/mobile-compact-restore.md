# Recuperación de la distribución móvil aprobada

**3 de noviembre de2026.** La petición del propietario recupera expresamente la **primera**
de sus dos capturas y rechaza la composición con descripción bajo la foto. Esta revisión
sustituye únicamente esa distribución de la vista general. El detalle editorial queda intacto.

## Diseño recuperado

Cada hoja sigue mostrando dos perfumes. La foto cuadrada permanece a la izquierda; marca,
nombre, descripción, referencia de precio, importe actual y «Explorar» se agrupan a la derecha.
Se recuperan proporciones próximas a48/52 y los espaciados compactos. Las fotos terminadas
se muestran completas y del mismo tamaño; no hay recortes, filtros ni fondos añadidos.

El marco vuelve a aprovechar la altura disponible del celular y sus controles reservan48px,
igual que la portada. Los tres beneficios permanecen en la fila inferior. Las filas permiten
su altura mínima de contenido: en pantallas extremadamente cortas o con texto ampliado se
puede desplazar la hoja para leer, sin ocultar ni recortar información. Nunca se reorganiza
la descripción debajo de la fotografía. El detalle conserva su lectura vertical natural.

## Nombres de presentación

| Producto original    | Solo vista general |
| -------------------- | ------------------ |
| 9 pm                 | 9PM                |
| Hawas Ice 100ml      | Hawas Ice          |
| Odyssey Mandarin Sky | Mandarin Sky       |
| Khamrah Qahwa        | Khamrah Qahwa      |
| Hawas Malibu         | Hawas Malibu       |
| Zakat Royale Opal    | Royale Opal        |

La tabla vive en `presentation/overview-name.ts`, fuera del modelo comercial. El HTML conserva
el nombre completo y aporta ambas etiquetas al mismo `h4`. `setReading` elige el texto adecuado
antes de medir FLIP; al volver restaura el corto. Se conservan nodo, id, enlaces, slugs, marcas,
capacidades, notas, referencias, precios y nombres de formulario/WhatsApp. Al desmontar o leer
sin JavaScript se presentan los detalles nativos con los nombres completos.

## Comprobación

La captura base anterior y la nueva utilizan360×680,360×740,393×745,390×760,430×932,
320×568,768×1024 y1440×900. Cada pasada registra23 capturas generales y48 productos visibles.
El primer tamaño reproduce aproximadamente el área web de la captura del propietario,
descontando las barras de Android/Chrome. Los informes están en `reports/compact-catalog/`.

La regresión específica recorre los seis perfumes en siete tamaños y con movimiento normal:
comprueba dos productos por hoja, fotos iguales a la izquierda, todos los textos a la derecha,
ausencia de superposiciones, nombres por vista, compra con nombre original y regreso al mismo
`h4`. Las validaciones de contenido no sustituyen la observación de las capturas.

Resultado final:111 aprobados y tres omisiones previstas de114 casos en8.1minutos, cero
inesperados y cero flaky. Un worker, cero reintentos y dos procesos Chromium cerrados con
código0. Las omisiones corresponden al muestreo de bordes táctiles en el proyecto de escritorio;
esos tres tamaños sí pasan en el proyecto móvil. Los controles quedan dentro del viewport y
el documento no necesita desplazamiento en las18 caras registradas a tamaños móviles habituales.
[Comparativas de las hojas](../reports/compact-catalog/review.html).

En horizontal se corrigió una altura mínima heredada del escenario que interceptaba el toque
de los controles. Con texto al200%, la etiqueta de Explorar permite reflow dentro de su misma
columna. Las dos comprobaciones específicas al200% terminaron correctamente antes de la
aceptación final. Ninguna de estas adaptaciones mueve la descripción debajo de la foto.

Tipos114 archivos sin errores, advertencias ni hints;115 unitarios, lint, formato, build e
integridad correctos. No hay dependencias nuevas ni ampliación de presupuestos. El ZIP de
Pages actualizado pesa2959698 bytes y sus69 entradas coinciden por SHA256 con `dist`.
La comprobación adicional de superficies fotográficas uniformes y títulos generales completó
otros12 casos correctos en28.4s, sin omisiones ni reintentos.

La verificación es local con Chromium moderno, un worker y un preview aislado en4325. No prueba
teléfonos físicos, Safari/Firefox ni FPS de campo. Se actualiza el ZIP de Pages para que el
propietario pueda subirlo; no se publica desde esta sesión.
