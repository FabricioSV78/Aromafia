# Recursos multimedia

Importar fotografías aprobadas desde esta carpeta con `astro:assets` para optimización al construir.
Reservar dimensiones y definir `alt` contextual; usar `Picture` con AVIF/WebP cuando corresponda.
La imagen LCP usa carga inmediata; el resto usa lazy loading. No precargar todas las imágenes.

El PNG oficial y la animación aprobada se conservan en `pantalla_inicial/`, fuera de `public/` y del bundle.
No modificarlos, separar capas, vectorizar ni generar nuevos personajes sin autorización.
`docs/original-assets.json` registra sus huellas; `npm run check:assets` comprueba su integridad.

Al aprobar el diseño, crear derivados optimizados preservando el original. No incluir automáticamente
el PNG de 2.4 MB ni el HTML de animación completo como dependencia inicial de la web.
