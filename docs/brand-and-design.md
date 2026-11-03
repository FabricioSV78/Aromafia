# Identidad y fundamentos visuales

El PNG oficial muestra una llama con lentes negros y vestimenta árabe sobre un fondo marfil,
detalles rojos en el pañuelo y acentos dorados. La palabra AROMAFIA usa letras serif de alto
contraste, proporciones amplias y un detalle gráfico en la A. No se ha identificado la familia
tipográfica exacta; no se atribuye un nombre de fuente sin evidencia.

La combinación comunica seguridad, humor peruano y lujo accesible. El personaje debe conservar
actitud adulta; evitar ojos/rasgos exagerados, gestos infantiles, saturación de stickers y chistes
que compitan con la confianza necesaria para vender perfumes originales.

## Tokens iniciales, no composición final

`src/design/tokens.css` contiene valores semánticos y `global.css` las capas reset/base/components/utilities.
Son fundamentos revisables al definir el diseño; no deciden secciones ni la composición del catálogo.

| Recurso          | Token / valor                    | Uso                                            |
| ---------------- | -------------------------------- | ---------------------------------------------- |
| Marfil           | `--color-ivory: #f0e8d5`         | Fondo derivado de la identidad aprobada        |
| Tinta            | `--color-ink: #10100f`           | Texto y acción principal                       |
| Oro              | `--color-gold: #b8893a`          | Detalle decorativo, no texto pequeño           |
| Oro oscuro       | `--color-gold-dark: #775019`     | Enlaces sobre fondos claros con contraste      |
| Rojo pañuelo     | `--color-scarf: #a81e24`         | Acento y foco visible                          |
| Superficie       | `--color-surface: #fffdf7`       | Superficies claras                             |
| Texto secundario | `--color-text-muted: #554c40`    | Información secundaria legible                 |
| Estados          | error `#9c2027`, éxito `#265a3c` | Siempre acompañados por texto/iconografía útil |

Los valores web son una interpretación funcional, no una certificación de colores corporativos
de imprenta. Las pruebas calculan contraste de tokens reales: ≥4.5:1 para texto sobre marfil y
superficie, ≥3:1 para foco/bordes. Las combinaciones nuevas se verifican individualmente.

## Tipografía, espacio y adaptación

- Serif de sistema (`Georgia`) para títulos y sans de sistema para lectura/controles, provisionales.
  No se descargan fuentes de terceros ni se declara que sean las del logo.
- Escala 0.875/1/1.25rem y títulos fluidos con `clamp`; interlineado1.6 cuerpo y1.15 títulos.
- Longitud de lectura65ch; no texto forzado en mayúsculas para toda la interfaz.
- Espaciado de base4px con escala1/2/3/4/6/8/12/16; contenedor máximo75rem y gutter fluido.
- Breakpoints de referencia:30rem,48rem,64rem,80rem. Usar media queries reales; variables CSS no
  sustituyen valores en condiciones `@media`. La infraestructura motion distingue48rem.
- Probar desde320px, zoom y textos largos. El layout final decidirá dónde necesita cada breakpoint.
- Botón primario sólido, secundario delineado, terciario textual. Áreas táctiles objetivo44px,
  foco3px, estado disabled nativo y hover/active explícitos. Navegación usa enlaces.

## Movimiento e imágenes

Duraciones base120/220/600ms y curvas declaradas por tokens. Son vocabulario, no obligación de
animar todo. Preferir un momento significativo y respuestas a acciones. Nunca ocultar controles
por el relato ni impedir saltar una secuencia. `prefers-reduced-motion` conserva función y contenido.

La llama puede participar mediante desplazamiento/escala/opacidad del conjunto, reflejos y escenas
de profundidad moderada una vez aprobadas. Para movimientos independientes de cabeza, pañuelo o
lentes conviene recibir un SVG auténtico o un archivo por capas del diseñador. El PNG plano no
contiene esa estructura; no reconstruirla arbitrariamente ni recortarla si compromete calidad.

El PNG original y la v3 aprobada tienen protección por hash. No se cargan en la página base.
Desde E, `BrandMark.astro` genera WebP de 320/640/960/1254px con calidad94 desde ese PNG. Los tamaños
mayores cubren las tapas ampliadas y pantallas de mayor densidad sin superar la fuente original.
La portada carga con prioridad y la contraportada de forma diferida. El papel aproxima el marfil
del fondo y una máscara CSS suaviza solo el margen vacío exterior: el personaje y las letras
permanecen completos, sin blur, separación de capas ni edición del archivo original.
Futuras fotografías usarán dimensiones, `alt`, tamaños responsive y AVIF/WebP cuando aporten;
el LCP se carga inmediatamente y las demás imágenes progresivamente. El favicon definitivo
queda pendiente de un recurso aprobado; la base usa una referencia vacía sin petición404.
