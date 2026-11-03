# Revisión visual del movimiento — subfase D

Revisión local del **2 de noviembre de 2026**, en Chromium headless. Se inspeccionaron los giros
de hoja, la apertura y el cierre en escritorio de 1440×900 y móvil emulado de 390×844.
Este documento registra la evidencia visual y el muestreo de movimiento; los checks generales
y el detalle de la subfase D se documentan en su entrega principal.

## Problemas encontrados y corrección

El giro anterior reemplazaba las caras inferiores justo en la mitad de la animación. Cuando la
hoja estaba de canto, ese cambio podía mostrar de golpe la página siguiente antes de que el
reverso la cubriera. Además, desvanecer el contenedor de la hoja podía aplanar sus dos caras 3D.

La corrección mantiene los fondos durante todo el recorrido. Al avanzar, permanecen la izquierda
anterior y la derecha siguiente; al retroceder, la izquierda siguiente y la derecha anterior.
El reverso del clon contiene el destino y lo cubre progresivamente. Las caras reales se asientan
al terminar, cuando el clon ya coincide con ellas. No se sustituye contenido visible a mitad.

`createBookTurnTransition` en `src/motion/book-turn.ts` coordina un giro de 1.04 s con aceleración
y desaceleración `power2.inOut`, profundidad constante y sin desvanecer el padre preserve-3d.
Las caras tienen backface oculto, una separación mínima para evitar interferencia de superficies
y sombreado discreto. `will-change` se limita a la hoja temporal, que el controlador elimina.

La apertura y el cierre conservan la secuencia de `book-cover.ts` corregida en C. En los cuadros
revisados no reapareció el reverso como pared sobre los nombres, ni recortes bruscos o cambios
de geometría. El papel vacío durante parte de esa secuencia es deliberado: el texto se revela
cerca de su escala final para evitar deformarlo mientras se despliega el libro.

## Capturas y recorrido visual

La primera revisión aisló las fábricas de animación sobre la escena de desarrollo. Después de
integrar el controlador y el CSS de D, **se repitieron y sobrescribieron todas las capturas sobre
el build de producción local servido en 4321**. Los archivos actuales corresponden a esa segunda
revisión, con las timelines reales del controlador.

Se capturaron los progresos **0%, 25%, 49%, 51%, 75% y 100%**. El par 49/51 permite revisar el paso por
el canto de la hoja, donde ocurría el cambio prematuro. Cada perfil incluye avance, retroceso,
apertura y cierre: 48 cuadros individuales y ocho hojas de contacto, cada una en HTML y PNG.

Los artefactos se encuentran en `reports/book-subphase-d/motion/`:

| Revisión                | Hojas de contacto HTML y PNG                            |
| ----------------------- | ------------------------------------------------------- |
| Avance de escritorio    | `desktop-forward-contact.png`, `desktop-forward.html`   |
| Retroceso de escritorio | `desktop-backward-contact.png`, `desktop-backward.html` |
| Apertura de escritorio  | `desktop-opening-contact.png`, `desktop-opening.html`   |
| Cierre de escritorio    | `desktop-closing-contact.png`, `desktop-closing.html`   |
| Avance móvil            | `mobile-forward-contact.png`, `mobile-forward.html`     |
| Retroceso móvil         | `mobile-backward-contact.png`, `mobile-backward.html`   |
| Apertura móvil          | `mobile-opening-contact.png`, `mobile-opening.html`     |
| Cierre móvil            | `mobile-closing-contact.png`, `mobile-closing.html`     |

Los cuadros individuales usan el patrón `{perfil}-{acción}-{progreso}.png`, por ejemplo
`desktop-forward-0_49.png` o `mobile-closing-1.png`. Las hojas de contacto se construyen con HTML
y CSS y se capturan en el navegador; no se retocan las imágenes para esconder problemas.

La inspección confirmó fondos coherentes al pasar por el canto, el reverso correcto, ausencia
del salto de contenido a mitad y una última apertura consistente con la contraportada.
El regreso asienta las caras reales sin dejar la hoja temporal sobre el contenido.

También se grabaron dos recorridos normales, sin pausar ni adelantar timelines:

- `desktop-open-turn-close.webm`.
- `mobile-open-turn-close.webm`.

Ambos muestran abrir, avanzar, retroceder y cerrar. Son grabaciones separadas del muestreo rAF
para que la codificación de vídeo no altere esa medición.

## Cómo se obtuvieron los cuadros

Los auxiliares locales se conservan en `.cache/review-book-turn.mjs`,
`.cache/review-book-cover-d.mjs` y `.cache/review-motion-timing-d.mjs`.

Los dos primeros abren el build, ejecutan una acción real y localizan su timeline a través del
tween de la hoja o portada. Pausan únicamente esa timeline y fijan cada progreso. Los cuadros
intermedios suprimen callbacks; el 100% permite que se ejecute el callback normal de finalización,
incluido revertir el contexto, retirar el clon y renderizar las caras, contador y controles finales.
La escena se vuelve a crear para cada acción y perfil.

Para repetirlo en este workspace, construir primero el sitio y mantener preview en 4321:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 4321 --ignore-lock
```

En otra terminal:

```powershell
node .cache/review-book-turn.mjs
node .cache/review-book-cover-d.mjs
node .cache/review-motion-timing-d.mjs
$env:QA_TIMING_ONLY = '1'
node .cache/review-motion-timing-d.mjs
Remove-Item Env:\QA_TIMING_ONLY
```

Los scripts y los informes son auxiliares locales ignorados, no forman parte de `npm run verify`.
Si se limpia `.cache/`, habrá que recuperar esos auxiliares para repetir exactamente esta captura.
La captura no añade controles ni hooks de depuración al código de producción.

## Muestreo de intervalos rAF

Se midieron intervalos entre callbacks `requestAnimationFrame` mientras el estado era `turning`,
sin screenshots ni vídeo durante el muestreo. El informe inicial conserva un avance y un
retroceso por perfil en `raf-sampling.json`:

| Perfil y dirección       | Intervalos | Mediana | p95     | Máximo  | Intervalos >20 ms |
| ------------------------ | ---------- | ------- | ------- | ------- | ----------------- |
| Escritorio, avance       | 61         | 16.7 ms | 16.7 ms | 33.3 ms | 1                 |
| Escritorio, retroceso    | 55         | 16.7 ms | 33.3 ms | 33.4 ms | 5                 |
| Móvil emulado, avance    | 62         | 16.7 ms | 16.7 ms | 16.8 ms | 0                 |
| Móvil emulado, retroceso | 61         | 16.7 ms | 16.8 ms | 16.8 ms | 0                 |

La repetición continua de tres pares avance/retroceso por perfil se conserva por separado en
`raf-warm-sampling.json`: 12 pasadas. Todas tuvieron mediana 16.7 ms y p95≤16.8 ms. En las seis de
escritorio hubo de cero a un intervalo de 33.2–33.4 ms por pasada; en las seis móviles no hubo
intervalos superiores a 20 ms. El primer resultado menos favorable no se borró ni se atribuye su
causa a una optimización no medida. No se aisló la CPU del resto de procesos del equipo.

Estos intervalos describen callbacks del navegador local. **No acreditan FPS sostenidos, INP de
usuarios reales ni fluidez en un teléfono de gama media físico.** La emulación cambia viewport
y entrada táctil; no reproduce su GPU, temperatura o potencia. Tampoco se probó Safari/Firefox.

## Último ajuste de carga

Después de esta revisión se retiró el halo decorativo por el problema de CLS observado en la
validación principal. Ese ajuste de fondo no cambia el giro, las caras ni su geometría, por lo
que las capturas siguen siendo evidencia válida de las transiciones. Los resultados finales de
CLS y Lighthouse corresponden a la validación principal; no se deducen del muestreo rAF.
