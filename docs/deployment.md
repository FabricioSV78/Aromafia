# Preparación para Cloudflare Pages

**3 de noviembre de 2026.** El propietario eligió Pages para este catálogo estático. Esta guía
sustituye la previsión anterior de Workers Static Assets. La preparación es local: no se ha
creado un proyecto remoto, conectado una cuenta ni publicado el sitio.

Astro conserva `output: 'static'`. El catálogo, la intro, las imágenes y el formulario que
prepara WhatsApp se entregan como archivos. No necesitan adapter, Functions, base de datos ni
CLI de Cloudflare. [Astro y Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/).

## Opción inmediata: subir el ZIP

El paquete listo para revisión es `artifacts/aromafia-cloudflare-pages.zip`. Contiene únicamente
los archivos de `dist`, con `index.html` y `_headers` en la raíz del ZIP. No subir la carpeta del
proyecto, `src`, `pantalla_inicial`, `reports`, `.env` ni `node_modules`.

En el panel de Cloudflare:

1. Ir a **Workers & Pages → Create application → Pages**.
2. Elegir **Direct Upload / Drag and drop** y asignar el nombre del proyecto.
3. Arrastrar el ZIP preparado, o la carpeta `dist`.
4. Revisar los archivos y pulsar **Deploy site** cuando se decida publicar.

El panel admite ZIP o carpeta. Elegir Direct Upload impide convertir ese mismo proyecto a
integración Git; para automatizar después habría que crear otro proyecto Pages. Si se desea
publicación automática desde el principio, utilizar la opción Git descrita abajo.
[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

Para reconstruir localmente:

```sh
npm ci
npm run build:pages
```

En PowerShell usar `npm.cmd`. Para renovar el ZIP, desde la raíz del proyecto:

```powershell
New-Item -ItemType Directory -Path artifacts -Force | Out-Null
Compress-Archive -Path .\dist\* -DestinationPath .\artifacts\aromafia-cloudflare-pages.zip -Force
```

`build:pages` verifica los originales, construye Astro, revisa presupuestos y ejecuta el
control de Pages. `npm run check:pages` permite repetir únicamente ese control. Los informes
se guardan en `reports/cloudflare-pages/`, fuera del paquete. Las pruebas generales siguen
disponibles con `npm run verify`; la construcción remota no instala ni ejecuta navegadores.

## Alternativa: integración Git

Esta carpeta todavía no tiene un repositorio Git. No se ha creado ni conectado uno durante
la preparación. Cuando exista en GitHub o GitLab, crear un proyecto Pages con integración Git
y estos valores:

| Ajuste                 | Valor                                                   |
| ---------------------- | ------------------------------------------------------- |
| Framework preset       | Astro                                                   |
| Root directory         | Raíz del repositorio de AROMAFIA                        |
| Build command          | `npm ci && npm run build:pages`                         |
| Build output directory | `dist`                                                  |
| Production branch      | La rama real que se elija; por ejemplo `main` si existe |

Es una adaptación del build estático oficial, con instalación reproducible y controles locales.
[Configuración de build](https://developers.cloudflare.com/pages/configuration/build-configuration/).

Variables de build para producción y previews:

| Variable                  | Valor inicial                                        |
| ------------------------- | ---------------------------------------------------- |
| `NODE_VERSION`            | `24.18.1`                                            |
| `SKIP_DEPENDENCY_INSTALL` | `true`                                               |
| `PUBLIC_SITE_INDEXABLE`   | `false`                                              |
| `PUBLIC_SITE_URL`         | Dejar sin definir hasta conocer el origen HTTPS real |

`SKIP_DEPENDENCY_INSTALL` evita una instalación automática adicional, porque el comando ya usa
`npm ci`. `.node-version` y `.nvmrc` también fijan Node24.18.1. Pages permite seleccionar Node
mediante esos archivos o `NODE_VERSION`; no conviene depender de que detecte `engines` en su
build v3. No fijar `NODE_ENV=production` durante la instalación: las herramientas de build son
dependencias de desarrollo. [Entorno de build](https://developers.cloudflare.com/pages/configuration/build-image/).

El repositorio fuente debe conservar `pantalla_inicial`, los recursos privados de compilación,
los archivos de configuración, `docs/original-assets.json` y `package-lock.json`. Son entradas
del build, no archivos para subir a Pages. `.gitattributes` protege los hashes del HTML aprobado
frente a cambios de fin de línea entre Windows y Linux. No añadir `.env`, informes o artefactos.

## Rutas y encabezados

El libro navega mediante fragmentos `#libro/...` y no requiere una regla SPA. Se conserva
`404.html` para rutas inexistentes; no añadir `/* /index.html 200`, que ocultaría errores.
Pages puede normalizar `scene.html` a `scene`; los enlaces relativos de la intro conservan su
carpeta y sus recursos. [Servicio de archivos](https://developers.cloudflare.com/pages/configuration/serving-pages/).

`public/_headers` pasa a `dist/_headers`. `X-Frame-Options: SAMEORIGIN` permite la intro alojada
en el mismo sitio. Mantener esa regla: `DENY` la bloquearía. La caché inmutable se limita a
`/_astro/*`, cuyos nombres tienen hash; las fotografías con nombres estables y el HTML no
reciben esa política larga. Las reglas efectivas se comprobarán sobre HTTP después de publicar.
[Encabezados de Pages](https://developers.cloudflare.com/pages/configuration/headers/).

El control previo comprueba también referencias HTML/CSS/srcset, archivos de intro, ausencia
de fuentes privadas/runtime, límite de1000 archivos de carga manual y25MiB por archivo.
[Límites de carga manual](https://developers.cloudflare.com/pages/get-started/direct-upload/#limits).

## Dominio e indexación

El paquete actual permanece con `noindex` y `robots.txt` de revisión. Esto permite publicar una
revisión accesible, pero no la vuelve privada. No se inventa dominio ni se activa indexación.

Cuando haya dominio HTTPS definitivo y contenido aprobado, definir `PUBLIC_SITE_URL` con su
origen y `PUBLIC_SITE_INDEXABLE=true` solamente en producción y reconstruir. El build validará
canonical y sitemap; en previews conservar `false`. En Direct Upload las variables del panel
no cambian archivos precompilados: hay que reconstruir localmente y subir un paquete nuevo.

## Alcance de la verificación

La preparación comprueba el artefacto local y deja el ZIP listo. La instalación y compilación
en Linux de Pages, DNS, TLS, compresión CDN, encabezados reales y URL pública solo podrán
comprobarse tras el despliegue autorizado. Las pruebas locales no se presentan como una
publicación realizada. Los resultados de esta entrega están en `docs/validation.md`.
