# Estabilidad del navegador de pruebas en Windows

**3 de noviembre de 2026.** El propietario informó de un cuadro de Windows para
`chrome-headless-shell.exe`: «La memoria no se pudo read», al intentar leer la dirección
`0x000000000000005C`. Esta revisión separa el fallo nativo del navegador, la configuración de
las pruebas y el comportamiento de la web. No se elimina ninguna prueba ni se modifica el catálogo.

## Evidencia disponible y límites del diagnóstico

- `@playwright/test`, `playwright` y `playwright-core` están alineados en **1.64.1**.
- El registro de navegadores de esa instalación requiere **Chromium156.0.8078.4**, revisión **1248**.
  Tanto el Chromium completo como Chrome Headless Shell están presentes; ambos informaron esa
  versión en las comprobaciones de ejecución.
- Al iniciar la revisión, Node registró **31.924GiB de RAM total** y aproximadamente
  **18.58GiB libres**. La consulta CIM fue denegada. Esa muestra no indica agotamiento de memoria,
  pero tampoco reconstruye el consumo en el instante del fallo anterior.
- La consulta válida al registro Application de Windows cubrió siete días y23 eventos con
  identificadores1000,1001 y1002. Ninguno identificó Chrome Headless Shell. No se obtuvo un dump,
  un módulo causante ni una pila del fallo reportado.
- La prueba inicial con Headless Shell abrió escritorio1440×900 y móvil390×844 en secuencia,
  dentro de un solo navegador. Terminó con código0, sin eventos de crash de página, errores de
  página ni desconexiones inesperadas. El error informado **no se reprodujo en ese recorrido**.
- La misma comprobación con Chromium completo en headless moderno recorrió las dos vistas y
  cerró con código0, sin crash ni desconexión inesperada. Su stderr incluyó un mensaje de
  geolocalización/IAppCapability con acceso denegado `0x80070005`; no impidió la navegación ni
  las capturas de ese recorrido. Ese mensaje es distinto del fallo de lectura informado.

La lectura de una dirección baja como0x5C es compatible con una desreferencia de un puntero nulo
o cercano a nulo. La explicación de Microsoft sobre
[violaciones de acceso C0000005](https://learn.microsoft.com/en-us/shows/inside/c0000005)
describe esta posibilidad y otras causas. La captura del cuadro por sí sola no confirma el
código de excepción, el componente culpable, falta de RAM ni un defecto de Playwright.

La causa probable es una **violación de acceso nativa del proceso Headless Shell**, cuyo origen
preciso no pudo determinarse. La configuración anterior permitía dos workers E2E y los scripts
independientes podían abrir otros navegadores simultáneamente. Esa concurrencia constituye un
factor de presión y una variable de diagnóstico concreta; no demuestra que causara el fallo.
Tampoco hay evidencia suficiente para atribuirlo al código de AROMAFIA, declarar corrupta la
instalación o actualizar dependencias como reparación demostrada.

## Configuración corregida

`playwright.config.ts` conserva los dos proyectos de escritorio y móvil y todos sus casos,
pero utiliza `workers: 1`, `fullyParallel: false`, `channel: 'chromium'` y `headless: true`.
La documentación de Playwright explica tanto el
[headless moderno de Chromium](https://playwright.dev/docs/browsers#chromium-new-headless-mode)
como la ejecución con
[paralelismo desactivado](https://playwright.dev/docs/test-parallel#disable-parallelism).

El mismo lanzamiento se aplica a:

- `scripts/audit-catalog-visual.mjs`.
- `scripts/audit-mobile-motion.mjs`.
- `scripts/audit-performance.mjs`.
- `scripts/compare-catalog-audit.mjs`.

Configurar el runner no habría cambiado esos lanzamientos independientes. Por ello se han
actualizado también, y las auditorías se ejecutan por turnos: E2E, capturas y rendimiento no
comparten ejecuciones simultáneas. Un worker no limita lo que abra otro script fuera del runner.
Los procesos internos de renderer/GPU de un único Chromium son parte de su arquitectura y no
equivalen a varios navegadores de auditoría.

`npm run test:browser:install` usa ahora `playwright install chromium --no-shell` para instalar
el Chromium completo compatible sin descargar Shell. No desinstala por sí solo el Shell existente.
No se cambiaron versiones, dependencias, lockfile, funciones de la web ni pruebas; tampoco se
añadieron flags de Chromium para ocultar errores ni un fallback automático al ejecutable anterior.

## Comprobación reproducible

`scripts/check-browser-stability.mjs` registra errores de página, eventos de crash, desconexiones
inesperadas y la salida del proceso que él mismo lanza. Impone un límite al cierre; cualquier
terminación de emergencia se restringe a ese proceso propio. Su opción explícita `--shell`
permite una comparación diagnóstica con el motor anterior y **no es un fallback de las pruebas**.

Resultados iniciales:

| Recorrido                                       | Navegador                             | Resultado                                                       |
| ----------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Escritorio1440×900 y móvil390×844, secuenciales | Headless Shell156.0.8078.4            | Código0; sin crash, errores de página ni desconexión inesperada |
| Las mismas dos vistas, secuenciales             | Chromium156.0.8078.4 headless moderno | Código0; sin crash ni desconexión inesperada                    |

Los JSON de estos recorridos están en:

- `reports/browser-stability/shell-baseline/result.json`.
- `reports/browser-stability/chromium-modern/result.json`.

## Suite completa con el motor moderno

La suite conservó sus186 casos y se ejecutó con un worker, `retries: 0` y detención tras el
primer fallo. Terminó con **183 pruebas aprobadas, tres omisiones intencionales, cero resultados
inesperados y cero casos flaky**, en419962ms, aproximadamente7.0minutos. El proceso de pruebas
cerró con código0.

El log `DEBUG=pw:browser` registró dos lanzamientos secuenciales del ejecutable
`chromium-1248/chrome-win64/chrome.exe`, correspondientes a los proyectos de escritorio y móvil.
Ambos procesos cerraron con código0 y no aparecieron marcadores de crash. La ejecución completa
no volvió a reproducir el cuadro de Windows reportado. Esta observación no garantiza que un
fallo intermitente no pueda reaparecer.

Evidencia:

- `reports/browser-stability/e2e.json`: resultados de todos los casos.
- `reports/browser-stability/e2e-summary.json`: un worker, conteos, ejecutables y cierres.
- `reports/browser-stability/e2e-exit.json`: salida0 del runner y hora de terminación.

Durante el seguimiento se obtuvieron muestras de17.31GiB y17.73GiB de memoria libre. Son valores
puntuales, no un máximo de consumo ni una medición del commit del sistema. Las restricciones de
CIM impidieron obtener esos otros datos; no se afirma que el consumo previo al fallo fuera igual.

También pasaron tipos —102 archivos sin errores, advertencias ni hints—, ESLint, Prettier,
111 pruebas unitarias en15 archivos, integridad de originales y presupuesto. El código de la web
no cambió: JS gzip122352 bytes, CSS gzip11413 bytes y HTML máximo53136 bytes.

## Recorrido visual aislado

El recorrido con Chromium moderno terminó con **156 capturas y48 detalles** de los seis perfumes
en1920×1080,1440×900,1366×768,768×1024,430×932,390×844,375×667 y320×568. Registró cero errores
de página y cero desbordamientos horizontales. Se ejecutó sin otros navegadores de auditoría
simultáneos y cerró con código0; el proceso nativo con PID2744 también terminó con código0.

Las hojas de contacto observadas de1920,768,430 y375px conservan la identidad, los fondos crema
dorados, la tipografía y la distribución del catálogo. Mandarin mantiene su foto cuadrada completa,
sin las franjas laterales corregidas anteriormente; los otros cinco detalles conservan sus fotos
y proporciones. La lectura vertical móvil y su barra de regreso mantienen la composición prevista.
Esta inspección visual no se presenta como una prueba en hardware móvil físico.

El recorrido utilizó `AUDIT_OUTPUT_DIR=reports/browser-stability/visual` para conservar intactos los
informes históricos. Las capturas, hojas de contacto y `metrics.json` están en ese directorio.

## Lighthouse y comprobación final

Lighthouse móvil se ejecutó después del recorrido visual, sin otro navegador de auditoría
simultáneo. Obtuvo **rendimiento99, accesibilidad100, buenas prácticas100 y SEO66**. La puntuación
SEO conserva el noindex intencional del sitio en preparación. Registró **LCP2031.95385ms, CLS0
y TBT0ms**. El script y el proceso nativo —PID26468— cerraron con código0. Son mediciones de
laboratorio; TBT no equivale a INP de campo.

El informe y sus métricas están en `reports/browser-stability/performance/`:

- `summary.json`.
- `lighthouse.json`.
- `lighthouse.html`.

En total se registraron **seis lanzamientos secuenciales**: uno de Shell para diagnóstico, uno
de Chromium moderno para la comprobación inicial, dos del E2E, uno del recorrido visual y uno de
Lighthouse. Los seis procesos nativos terminaron con código0; el error de Windows no se reprodujo.
La opción manual `--shell` del diagnóstico permanece como comparación explícita, sin fallback
en el runner ni en las auditorías habituales.

La consulta final válida al registro Application volvió a cubrir siete días y23 eventos de los
identificadores1000/1001/1002, sin errores que identificaran a Playwright o sus navegadores. Al
terminar no quedaban procesos de Headless Shell ni WerFault. La RAM libre final fue18.665GiB;
sigue siendo una muestra puntual y no una medición del máximo o del commit.

## Criterio de cierre

Las comprobaciones iniciales, la suite completa, el recorrido visual y Lighthouse terminaron
sin reproducir el error, con la configuración moderna y un worker. **La auditoría actual queda
validada para estas ejecuciones controladas sin crash.** Esto no acredita una reparación
definitiva del fallo intermitente reportado ni permite confirmar su causa precisa. Si reaparece,
se conservan logs y artefactos para aislarlo antes de declarar válido un nuevo resultado visual.

Esta comprobación es local, en Windows y Chromium. No certifica Safari/iOS, Firefox, teléfonos
físicos ni ausencia futura de fallos nativos. Los resultados de las auditorías anteriores se
conservan como historia y no se presentan como ejecuciones del motor moderno.
