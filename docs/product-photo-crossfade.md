# Fundido de fotografías al entrar y regresar

**3 de noviembre de 2026.** La petición del propietario suaviza el cambio entre fotografía
general y detalle. Se conserva el zoom, el tamaño del libro, los encuadres aprobados y las
fotografías originales. No cambia el diseño ni los datos comerciales.

## Problema y corrección

La entrada anterior ocultaba el marco y revelaba la foto nueva en100ms; el regreso sustituía
el source inmediatamente. Las dos direcciones tenían ritmos diferentes y podían percibirse
como un corte durante el movimiento de cámara.

`src/motion/product-photo.ts` controla ahora ambos sentidos. Primero decodifica el candidato
responsive fuera del DOM. Mientras espera mantiene visible la fotografía actual y conserva
la consulta y compra. Después respalda esa fotografía completa en el mismo marco, cambia el
source del único `img`, espera su decode y funde la opacidad de la nueva durante420ms, con
`cubic-bezier(.22,.61,.36,1)`.

El respaldo utiliza el archivo terminado exacto, con su propio fondo y encuadre. Es temporal,
centrado, completo y con `contain`; no es un estudio CSS, una extensión del fondo, una máscara
ni un segundo nodo de producto. Se retira junto con la opacidad inline y la animación al acabar.
No se añaden recursos gráficos, filtros, dependencias ni mediciones de layout por frame.
Las timelines GSAP y las mediciones FLIP del libro permanecen intactas.

Cada zona conserva una única solicitud deseada. La generación de solicitudes descarta cargas
tardías después del regreso o desmontaje; cambiar de dirección cancela la animación anterior.
Un fallo mantiene el source previo y permite reintentar al volver a entrar. Movimiento reducido
omite el fundido, también si cambia durante su reproducción. Ocultar la pestaña asienta el
fundido activo; desmontar cancela recursos y restaura el source general.

## Comprobación

La regresión `tests/e2e/photo-crossfade.spec.ts` recorre los seis perfumes y ambos sentidos en
1440×900 y390×844. Pausa la animación nativa real y registra cuadros a0,210 y390ms. Compara los
píxeles iniciales con la fotografía anterior, exige una opacidad progresiva, imagen completa,
respaldo del URL exacto, persistencia del único `img` y limpieza final. Otro caso interrumpe
el fundido con movimiento reducido y con el evento de desmontaje.

Las regresiones de carga fría, transiciones fotográficas, lectura editorial y navegación
comprueban la espera ante red lenta, fallos/reintentos, compra disponible, respuestas tardías,
ausencia de parches blancos, foco, historial y restauración del libro.

Logs, métricas, capturas y resultados de esta revisión se conservan en
`reports/photo-crossfade/`. Son pruebas de Chromium emulado: no acreditan60FPS sostenidos en
teléfonos físicos ni compatibilidad Safari/Firefox. No se publica el proyecto.

Resultado:92 regresiones aprobadas en5.4minutos, más seis comprobaciones finales del muestreo
sincronizado en1.4minutos. Un worker, cero reintentos, procesos nativos con salida0. Se observaron
las72 capturas consolidadas de ambos sentidos y los seis perfumes:
[escritorio](../reports/photo-crossfade/crossfade-1440.png),
[móvil](../reports/photo-crossfade/crossfade-390.png) y
[visor de cuadros completos](../reports/photo-crossfade/review.html).

Una captura adicional inicial detectó una pausa pendiente de la animación nativa: la opacidad
leída y el cuadro del compositor no coincidían. La prueba ahora espera `animation.ready` y un
frame de confirmación, y avanza el reloj de cámara junto con cada muestra. Se conserva el
umbral original de comparación de píxeles. La repetición final pasó los seis casos sin cambios
adicionales en producción. El fallo de muestreo y su trace quedan en `sampling-check/`.

El JS gzip pasa de123039 a123408 bytes, un coste medido de369 bytes. El límite previo era123392;
se amplía únicamente128 bytes, a123520. CSS gzip baja de15884 a15848 bytes; no se añaden
bibliotecas. El paquete de Cloudflare Pages se vuelve a preparar con el build validado.
