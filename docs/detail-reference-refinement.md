# Detalle: referencia ampliada y lectura más limpia

**3 de noviembre de 2026.** El propietario pidió más protagonismo para la imagen de referencia,
eliminar el espacio reservado bajo los títulos cortos y retirar las fuentes bajo la fotografía,
el bloque de concentración y el aviso de similitud. La revisión aplica la misma composición
a los seis perfumes, sin cambiar sus fotografías, precios ni la navegación del libro.

El encabezado usa ahora una fila de altura natural, compartida por nombres de una o dos líneas.
Marca, título, descripción, precio y notas conservan su jerarquía y sus nodos reales. Se retiró
la reserva mínima equivalente a dos líneas que dejaba vacío debajo de nombres como Hawas Ice.

Las fotografías de referencia mantienen la proporción completa 3:4 y crecen de 135 a 210px de
alto en escritorio, de 108 a 165px en escritorio compacto y de 135 a 200px en móvil. El nombre
va debajo en escritorio y junto a la imagen en móvil. El producto vendido conserva la fotografía
principal, mayor que la referencia; no se amplía ni se estira el fondo por separado.

Se eliminaron del HTML los enlaces de investigación bajo el perfume, el componente sin uso
`ProductSources`, sus estilos, el par «Concentración / Eau de Parfum» y el párrafo de similitud.
Las fuentes y la concentración siguen documentadas en los datos privados. El rótulo «Alternativa
olfativa a» identifica la comparación. La fuente del precio externo permanece verificable
desde el propio importe «Ref.», sin reintroducir la fila de enlaces retirada ni presentarlo
como precio anterior de AROMAFIA.

La intro v3 solicitada anteriormente se conserva. Su iframe se crea desde un `template` solo
cuando se va a reproducir: una sesión que ya la vio, un enlace directo y la lectura sin
JavaScript no crean un documento vacío adicional. Esto evita trabajo y diagnósticos de sandbox
provocados por herramientas que intentan inyectar scripts en un iframe inactivo.

## Validación

La comparación toma como base las capturas de `reports/mandarin-background/visual/`, anteriores
a esta revisión y ya verificadas. El recorrido posterior completó156 capturas y48 detalles en
1920×1080,1440×900,1366×768,768×1024,430×932,390×844,375×667 y320×568. Se observaron las ocho
hojas de contacto y capturas completas de la referencia y compra en móvil: sin desbordamientos
horizontales, recortes nuevos ni superposiciones. Las48 fotografías principales conservaron sus
dimensiones dentro de un píxel. El navegador del recorrido terminó normalmente con código0.

La suite completa de218 casos terminó con **212 aprobados y seis omisiones intencionales**, cero
inesperados y cero flaky, en8.1minutos. Incluye la intro real con Axe, títulos de los seis perfumes,
referencias ampliadas, lectura sin JavaScript, compra, historial, gestos, giro, fotografías de
carga lenta y limpieza. Usó un worker, cero reintentos y dos navegadores Chromium modernos
secuenciales; ambos cerraron con código0. El catálogo restante representa una pestaña que ya vio
la intro mediante el fixture de sesión; las26 pruebas de intro usan una sesión nueva.

Tipos:106 archivos sin errores, advertencias ni hints. Los111 unitarios, lint, formato, build e
integridad de originales son correctos. Presupuesto final: JS gzip123039 bytes, CSS gzip15884 y
HTML máximo51035. No se añadieron dependencias ni se modificaron las fotografías.

Artefactos de la revisión en `reports/detail-refinement/`:

- [Comparación de los seis perfumes](../reports/detail-refinement/review.html).
- [Escritorio antes/después](../reports/detail-refinement/comparison-1440.png).
- [Móvil antes/después](../reports/detail-refinement/comparison-390.png).
- `after/metrics.json`, `geometry-comparison.json`, `full-e2e.json` y `full-e2e-exit.json`.

La evidencia específica de fidelidad y reproducción de la intro está en `reports/brand-intro/`.
Sus13 recursos estáticos se comprobaron también por HTTP contra el manifiesto SHA256.

Las pruebas finales usan un preview de producción aislado en el puerto4322; el4321 puede estar
ocupado por el servidor de desarrollo del propietario. Una respuesta con `/@vite/client` indica
desarrollo y no sirve para validar el bloqueo de módulos `/_astro/*.js`. Los casos sin JavaScript
obtienen la URL de la configuración común, evitando visitar otro servidor por accidente.

Esta revisión es local y se prueba con Chromium emulado. No supone publicación, pruebas en
teléfonos físicos ni validación de Safari/Firefox.
