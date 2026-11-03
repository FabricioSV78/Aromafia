# Imágenes finales del catálogo por perfume

La revisión posterior adopta los fondos de Mandarin como plantilla de los otros cinco perfumes.
La estructura y las dimensiones descritas aquí se conservan; la preparación vigente de los
estudios y sus resultados está en [Mandarin como plantilla](mandarin-background-template.md).
El estudio único y los importes de tamaño de esta entrega se conservan abajo como historia.

**3 de noviembre de 2026.** La petición del propietario organiza los seis perfumes en carpetas
independientes, con tres imágenes principales listas para usar y sus variantes responsivas.
Los fondos, sombras y encuadres forman parte de cada archivo. La interfaz conserva el libro,
la plantilla compartida de detalle y las fotografías reales de los productos.

## Estructura publicada

La raíz `public/images/perfumes/` contiene únicamente estas seis carpetas:

| Perfume              | Carpeta estable  |
| -------------------- | ---------------- |
| 9 pm                 | `9pm/`           |
| Hawas Ice 100ml      | `hawas-ice/`     |
| Odyssey Mandarin Sky | `mandarine/`     |
| Khamrah Qahwa        | `khamrah-qahwa/` |
| Hawas Malibu         | `hawas-malibu/`  |
| Zakat Royale Opal    | `royale-opal/`   |

Cada carpeta contiene exactamente siete WebP:

```text
public/images/perfumes/<slug>/
  general.webp          640 × 640
  general-320.webp      320 × 320
  detail.webp           960 × 960
  detail-480.webp       480 × 480
  detail-640.webp       640 × 640
  inspiration.webp      480 × 640
  inspiration-240.webp  240 × 320
```

Son **18 composiciones principales y 42 archivos públicos**, con un total de2111810 bytes
—aproximadamente2.11MB— frente a14.33MB del directorio anterior, que incluía derivados y fuentes.
`general` muestra el frasco para el
catálogo; `detail` reúne el perfume y su presentación con protagonismo; `inspiration` presenta
únicamente el perfume de referencia. Esta última sigue siendo una comparación secundaria y no
se incluye en la compra. Los nombres y las relaciones olfativas continúan documentados aparte.

## Preparación de los archivos

`scripts/build-perfume-images.mjs` lee `src/assets/perfumes/image-recipes.json` y produce los WebP
opacos de calidad 94. Las recetas fijan fuente, contorno exterior, proporción, posición y tamaño
del objeto. El generador comprueba que el producto no salga del lienzo y registra sus límites.
Los contornos o el alfa nativo recortan solo el campo exterior: no se reconstruyen frascos,
etiquetas, reflejos internos, cajas ni letras.

El fondo vacío se preparó con la herramienta integrada `image_gen` y está en
`src/assets/perfumes/studio/cream-peach-source.png`. El prompt registrado en las recetas es:

> Empty photographic studio background matching supplied Mandarin: warm champagne cream and pale peach, continuous matte sweep, soft upper-left light and gentle falloff; no objects, products, text, logos, border, horizon or existing shadows. Authentic product pixels are composited afterward.

La generación se limita a ese estudio vacío. Encima se componen las fotografías auténticas del
producto, manteniendo sus proporciones y sin filtros de recoloración en CSS. Las sombras de
apoyo también quedan incorporadas al archivo. Los originales y sus perfiles permanecen en las
fuentes privadas; los recursos de entrega son derivados preparados para la web.

Mandarin conserva las escenas aportadas y su detalle cuadrado aprobado. Los tres PNG del
propietario se trasladaron sin alterar bytes a
`src/assets/perfumes/originals/mandarine/{1,2,3}.png`; la composición de detalle aprobada está en
`detail-master.png`, junto a ellos. El archivo general elimina únicamente fondo vacío superior
e inferior para ocupar el cuadrado. La referencia conserva su escena vertical.

El detalle de Khamrah Qahwa compone el frasco real de `khamrah-qahwa-source.png` y la caja real de
`detail-boxes/khamrah-qahwa-official-03.png`, para que el frasco tenga más presencia. El manifiesto
identifica ambas fuentes y sus hashes; no se presenta como una única fotografía original ni
contiene un producto generado. Invictus Aqua y Angels’ Share usan contornos exteriores que
conservan los reflejos claros del vidrio y el metal dentro de sus siluetas.

Fuentes, hashes, límites de objeto, tamaños y bytes de cada salida están en
[perfume-assets.json](perfume-assets.json). Las procedencias originales anteriores siguen en los
manifiestos de investigación; sus antiguas rutas públicas se conservan como historia, no como
archivos vigentes.

Para reproducir los recursos desde las fuentes privadas:

```sh
node scripts/build-perfume-images.mjs
```

## Integración en el libro

`product-images.ts` publica `generalImage` y `detailImage`; `product-inspirations.ts` publica la
tercera imagen. Todos utilizan las nuevas rutas y `srcSet`. `InspiredBySection` incluye ahora
los candidatos responsivos de la referencia. El mismo nodo `img` del producto principal cambia
de source al enfocar y regresar, después de decodificar el recurso; no se crea otra copia visible.

Las imágenes ya llenan sus proporciones de destino. El contenedor no añade bordes, fondo de
estudio, sombras, máscaras ni ajustes por perfume. El antiguo endpoint `presentation.css` y su
servicio de encuadres se retiraron. Los contornos privados pertenecen exclusivamente al proceso
de preparación de archivos.

La referencia olfativa pasa de 100 a **135 px de alto**, o de 80 a **108 px** en escritorio de
poca altura. Se conserva más pequeña que la imagen principal, que ocupa aproximadamente
240–462 px según la vista comprobada. El detalle continúa usando tres zonas en escritorio y
lectura vertical natural en móvil.

## Limpieza ejecutada

Antes de retirar archivos se inventariaron rutas, tamaños y hashes. La limpieza comprobó los
destinos absolutos dentro del proyecto y conservó las fuentes necesarias para reproducir los
recursos. El resultado se registra en `reports/perfume-assets/cleanup.json`:

- Retirados **129 derivados públicos antiguos**, incluidas las máscaras públicas sustituidas.
- Movidos intactos los **tres PNG aportados** a la carpeta privada de originales.
- Retirados **dos archivos antiguos de trabajo** del fondo; el detalle aprobado se conserva
  como fuente privada en `originals/mandarine/detail-master.png`.
- Copiadas y verificadas las **diez máscaras** en `src/assets/perfumes/masks/` antes de retirar
  sus copias públicas.
- Retirados los scripts antiguos `generate-photo-masks.mjs`, `extend-mandarin-background.mjs`
  y los datos de siluetas que ya no utiliza la interfaz.
- Retiradas también las tres variantes públicas `public/images/photography/perfume-studio-v1-*`
  y el antiguo maestro privado `src/assets/photography/perfume-studio-v1.png`, sin referencias
  activas. Sus rutas, tamaños y hashes están en `reports/perfume-assets/obsolete-studio-cleanup.json`.

`public/images/perfumes/` queda con seis carpetas y 42 archivos, sin las colecciones anteriores de
`clarity`, `pilot`, `detail-v1`, `detail-box-v1` o `reference-v1`. El PNG oficial y el HTML v3 de
`pantalla_inicial/` conservan su ubicación y protección.

Después de la limpieza se ejecutó de nuevo el generador desde las fuentes privadas. Los
**42 archivos resultantes conservaron exactamente sus SHA256**, por lo que los recursos
retirados ya no son necesarios para reproducir el conjunto vigente. Resultado en
`reports/perfume-assets/regeneration-result.json`.

## Comprobaciones de esta revisión

| Comprobación                   | Resultado confirmado                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Estructura pública             | Seis carpetas, siete archivos por carpeta, 18 principales y 42 archivos totales                   |
| Tipos                          | 101 archivos; cero errores, advertencias o hints                                                  |
| Unitarios                      | 111 correctos en 15 archivos                                                                      |
| Lint                           | Correcto                                                                                          |
| Navegador dirigido             | 74 casos correctos en 3.1 minutos; dos cierres nativos con código 0                               |
| Suite completa                 | 183 aprobados y tres omisiones previstas, de 186 casos, en 6.9 minutos; un worker, sin reintentos |
| Build y presupuesto            | JS gzip 122307 bytes, CSS gzip 9985 bytes y HTML máximo 53280 bytes                               |
| Recorrido visual               | 48 detalles y 156 capturas en las ocho resoluciones; cero errores de página y overflow horizontal |
| Navegador del recorrido visual | Chromium moderno, un navegador aislado; cierre nativo normal con código 0                         |
| Regeneración posterior         | 42 archivos idénticos por SHA256, usando únicamente las fuentes privadas conservadas              |

La composición de las 18 imágenes y las hojas de contacto se encuentran en
`reports/perfume-assets/asset-contact-sheet.png` y `reports/perfume-assets/visual/`.
Los recorridos se ejecutaron con Chromium moderno por turnos. La suite completa usó un worker,
cero reintentos y parada tras el primer fallo; sus dos navegadores secuenciales cerraron con
código 0. Logs en `targeted-e2e.log` y `final-e2e.log` dentro de `reports/perfume-assets/`.
La suite completa registró183 resultados esperados, tres omisiones, cero inesperados y cero
flaky, en414112.44ms. Su resumen está en `final-e2e-summary.json`. Lighthouse se ejecutó después
de los recorridos, sin otra auditoría simultánea: rendimiento100, accesibilidad100, buenas
prácticas100 y SEO66 con noindex intencional; LCP1506.15465ms, CLS0 y TBT0ms. El proceso nativo
con PID29656 cerró con código0. Informes en `reports/perfume-assets/performance/`. No se convierten
las métricas de iteraciones anteriores en pruebas de estos recursos.
La ejecución de Chromium emulado no acredita Safari, Firefox, teléfonos físicos ni FPS de campo.
