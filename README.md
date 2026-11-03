# AROMAFIA

Base técnica del catálogo de perfumes originales en Perú. **«Huele como jeque, paga como causa».**

Preparado para **Cloudflare Pages estático**, sin publicar ni conectar servicios:
`npm run build:pages` construye y valida `dist/`.
[Guía de carga manual e integración Git](docs/deployment.md).

La primera entrada al inicio presenta ahora la animación v3 aprobada, por petición expresa
del propietario. Se reproduce una vez por pestaña y sesión, admite «Saltar intro» o Escape
y después muestra el catálogo. Los enlaces directos, el movimiento reducido y la lectura sin
JavaScript conservan acceso inmediato. El original permanece intacto; su escena se sirve con
recursos locales y estilos aislados. [Integración, recuperación y límites](docs/brand-intro.md).

La vista general sigue ahora la nueva referencia: papel crema dorado, entorno oscuro cálido,
fotografías más grandes con sus colores originales y nombres/precios con tipografía editorial.
[Dirección visual y pruebas](docs/catalog-reference-style.md).

La revisión visual vigente conserva **Khamrah Qahwa como plantilla de los seis detalles**, con
encabezado de altura natural y columnas alineadas. Las referencias crecen a210px en escritorio,
165px en ventanas compactas y200px en móvil. Se retiraron los enlaces bajo la foto, el bloque de
concentración y el aviso de similitud por petición expresa.
[Detalle y comparaciones visuales](docs/detail-reference-refinement.md).
Cada perfume tiene su carpeta pública con `general.webp`,
`detail.webp` e `inspiration.webp`, más sus variantes: **18 composiciones principales y 42 archivos**.
Las fotografías ya incorporan fondo, sombra y encuadre; la interfaz no añade una escena, borde
ni máscara. Las fuentes reales conservan sus proporciones, etiquetas y colores. El mismo nodo de
imagen cambia de rol al acercarse y volver. La referencia olfativa es algo mayor y sigue siendo
secundaria. «Precio de oferta» continúa retirado.
[Estructura, preparación, fuentes y limpieza](docs/perfume-asset-structure.md).

Los importes tachados son referencias verificadas de otras tiendas peruanas, identificadas como
«Ref.» y enlazadas a su fuente; no se presentan como historial de AROMAFIA. Royale Opal queda sin
comparación de precio porque no se encontró una referencia peruana verificable.
[Tres fotografías, precios y pruebas](docs/catalog-three-photographs.md).

El detalle comparte el fondo crema dorado de las hojas del libro. Mandarin conserva sus escenas
aprobadas y el detalle cuadrado con fondo extendido. Sus originales se guardan intactos en
`src/assets/perfumes/originals/mandarine/`; los derivados anteriores se limpiaron de la carpeta pública.
La referencia fotográfica vigente es `public/images/perfumes/mandarine/`. Los fondos vacíos
se derivan de sus fotografías de general y detalle; los otros cinco perfumes se componen
con sus fuentes auténticas y conservan los encuadres. La web muestra cada archivo completo,
sin ampliar su fondo por separado ni añadir escenas o filtros en CSS.
[Plantilla de Mandarin, preparación y comprobaciones](docs/mandarin-background-template.md).

La **subfase F de aceptación integral**, anterior a esta corrección visual, corrigió el espacio
de las notas en ventanas de escritorio bajas, conserva acceso al control enfocado después de girar
el móvil o cerrar la compra y alinea el color del navegador móvil con el catálogo. La auditoría de
rendimiento usa un navegador temporal aislado. [Alcance y comprobaciones](docs/book-navigation-subphase-f.md).

La subfase E del nuevo brief muestra los seis perfumes como **un libro en una sola vista**:
dos perfumes por cara, cuatro por apertura de escritorio y dos en móvil. «Abrir libro» anima la
portada; controles, teclado y gesto táctil pasan las hojas. La cuarta cara es una contraportada.
«Explorar» acerca la zona original del perfume mediante una cámara DOM; «Volver al libro» recorre
el movimiento inverso y conserva la página. El detalle reorganiza la misma zona para mostrar
imagen, nombre, precio, notas, presentación y enlaces a fuentes en una sola vista
del papel, sin desplazar una columna ni agrandar el libro. La última revisión retira el título visible
para dar protagonismo al libro. «Comprar» abre únicamente un modal de compra compacto, de hasta480px;
«Continuar en WhatsApp» prepara el mensaje para que el cliente lo revise y envíe allí.
El detalle del producto permanece en el papel; la autorización de modal corresponde solo a la compra.
La información del perfume se consulta únicamente en el libro; no hay ficha completa ni página
de producto adicional. El nombre aparece a la derecha de los controles de lectura. El logo es mayor en portada
y contraportada, con derivados de alta calidad y fondo integrado en el papel. Se conservan las
correcciones de apertura, cierre y giro de D.
Los seis perfumes tienen marcas, notas y descripciones investigadas, con fotografías reales y fuentes
visibles. Las capacidades fueron confirmadas por el propietario: cinco de100ml y Royale Opal de80ml.
El propietario confirmó que los seis están disponibles; el campo no se muestra en la web.
SKU sigue pendiente. Las seis comparaciones olfativas tienen fuentes y fotografías documentadas;
se presentan como similitudes orientativas, sin equivalencia exacta ni afiliación.
El PNG oficial y la animación v3 aprobada se conservan intactos en `pantalla_inicial/`.

## Decisión técnica

**Astro 7 + React 19 por islas + TypeScript estricto**, con HTML estático inicial.
CSS para estados simples y **GSAP con importación diferida** para el libro y su detalle.
ScrollTrigger está disponible en el mismo paquete, pero no es necesario para pasar páginas.
La comparación con Next.js y React/Vite, límites y evolución a comercio están en
[arquitectura](docs/architecture.md). No se conectó ni contrató ningún servicio externo.

## Empezar

Node **24.18.1** y npm **11**; versiones declaradas en `.node-version`, `.nvmrc` y `package.json`.

```sh
npm ci
npm run dev
```

En PowerShell usar `npm.cmd` si `npm.ps1` está bloqueado. No es necesario cambiar la política
de ejecución de Windows. Abrir la URL local que imprime Astro.
Los comandos desactivan telemetría de Astro sin cambiar configuración global.

No se necesita `.env` para trabajar. `.env.example` documenta dos variables públicas:
`PUBLIC_SITE_URL` (vacía hasta conocer el dominio real) y `PUBLIC_SITE_INDEXABLE=false`.
La configuración rechaza indexación sin origen HTTPS. Robots bloquea rastreo en esta fase.

## Comandos

| Comando                           | Función                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                     | Desarrollo local con recarga                                     |
| `npm run typecheck`               | Astro y TypeScript estricto                                      |
| `npm run lint`                    | ESLint de Astro, TS y React/hooks                                |
| `npm run format` / `format:check` | Aplicar/verificar Prettier; excluye originales y skills externas |
| `npm test` / `test:watch`         | Pruebas unitarias Vitest                                         |
| `npm run build`                   | Generar `dist/` estático                                         |
| `npm run build:pages`             | Build estático y control previo para Cloudflare Pages            |
| `npm run check:pages`             | Validar archivos, rutas, intro y límites de carga de Pages       |
| `npm run preview`                 | Servir el build de producción local                              |
| `npm run test:browser:install`    | Instalar Chromium para Playwright una vez                        |
| `npm run test:e2e`                | Escritorio y móvil sobre el build; inicia su servidor            |
| `npm run test:a11y`               | Subconjunto de accesibilidad/teclado con axe                     |
| `npm run check:assets`            | Comprobar integridad del logo y animación aprobados              |
| `npm run check:budget`            | Verificar tamaños del build                                      |
| `npm run audit:performance`       | Lighthouse móvil; requiere preview en puerto4321                 |
| `npm run verify`                  | Cadena completa de verificaciones, build y navegador             |

Para una instalación nueva: `npm ci`, `npm run test:browser:install`, `npm run verify`.
Para rendimiento: `npm run preview -- --port 4321` y en otra terminal
`npm run audit:performance`. Los informes locales van a `reports/`; Playwright usa
`playwright-report/` y `test-results/`. Se ignoran en Git.

Las pruebas y los scripts de auditoría usan el modo headless moderno del Chromium completo
instalado por Playwright (`channel: 'chromium'`), sin recurrir a Chrome Headless Shell. La instalación
usa `--no-shell`; no cambia la versión fijada de Playwright. La suite tiene un solo worker y no
paraleliza sus casos. Ejecutar E2E, capturas visuales y perfiles de rendimiento por turnos, sin
otros procesos de auditoría simultáneos; mantener abierto únicamente el servidor preview necesario.
La suite E2E usa el preview aislado del puerto4322 para no reutilizar el servidor de desarrollo
del4321. Las capturas admiten `AUDIT_BASE_URL` para apuntar a ese mismo build.
[Diagnóstico de estabilidad en Windows y validación del motor](docs/browser-stability.md).

## Organización

```text
pantalla_inicial/         Logo PNG y animación HTML aprobados, sin cambios
.agents/skills/           4 skills documentales auditadas para este proyecto
config/                  Configuración validada y presupuestos
docs/                    Decisiones, marca, skills, contratos y validación
public/_headers          Encabezados previstos para assets en Cloudflare
scripts/                 Calidad, integridad y auditoría reproducible
src/
  assets/perfumes/       Fotografías fuente, con procedencia y dimensiones documentadas
  components/
    seo/                 Metadatos por página
    ui/                  Primitivas Button y Container
    visual/              Reservado para composiciones aprobadas
  config/                Identidad y configuración pública
  design/                Tokens y CSS por capas
  features/catalog/
    domain/              Modelos, dinero/promociones, contrato y validación
    components/          Libro, hojas, precio y detalle con notas/referencia
    styles/              CSS editorial acotado al catálogo
    data/                Productos/variantes, investigación, imágenes; propuestas privadas aparte
    repositories/        Adaptador local
    services/            Composición exclusiva de servidor/build
  features/orders/       Modal compacto, formulario, validación y borrador de WhatsApp
  layouts/               Documento semántico y enlace de salto
  motion/                Carga diferida, estado/controlador del libro, escenas y hook React
  pages/                 Catálogo, 404 y robots
  shared/lib/            Dinero y URLs SEO
tests/unit/              Dominio, motion, contrastes y SEO
tests/e2e/               Navegación, teclado, móvil y axe
```

## Dependencias y compatibilidad

Las versiones exactas están en `package.json` y `package-lock.json`.

| Grupo              | Paquetes y motivo                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| HTML y renderizado | `astro`, `@astrojs/react`, `react`, `react-dom`: estático e islas futuras                                                            |
| SEO                | `@astrojs/sitemap`: se activa al habilitar indexación con dominio real                                                               |
| Motion             | `gsap`: único motor; ScrollTrigger está incluido y es optativo por escena                                                            |
| Tipos              | `typescript`, `@astrojs/check`, `@types/node`, `@types/react`, `@types/react-dom`                                                    |
| Lint               | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, `eslint-plugin-react-hooks`, `globals`, `eslint-config-prettier` |
| Formato            | `prettier`, `prettier-plugin-astro`                                                                                                  |
| Pruebas            | `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright`                                                                        |
| Rendimiento        | `lighthouse` como herramienta de desarrollo, no código del visitante                                                                 |

Se usan ESLint10 y el plugin Astro3 compatibles. `eslint-plugin-jsx-a11y` no se instaló porque
su peer dependency aún excluye ESLint10; accesibilidad se comprueba con axe, teclado y revisión
semántica. TypeScript5.9.3 es una versión fijada compatible, sin actualización mayor automática.
Lighthouse13.5.0 evita una nueva cadena transitiva innecesaria detectada en13.6.0.
El informe de seguridad y sus límites están en [validación](docs/validation.md).

No se instalaron Tailwind, Motion, Three.js, SDKs de pagos/Supabase/R2, gestión global de estado,
router cliente ni CLI de Cloudflare: todavía no existe un requisito que los necesite.

## Continuar el proyecto

- [AGENTS.md](AGENTS.md): reglas persistentes para tareas futuras.
- [Arquitectura](docs/architecture.md) y [despliegue futuro](docs/deployment.md).
- [Skills detectadas e instaladas](docs/skills.md), con procedencia fijada.
- [Marca y sistema de diseño](docs/brand-and-design.md).
- [Contrato de catálogo](docs/catalog.md).
- [Contenido editable y pendientes](docs/catalog-content.md), [plan visual](docs/catalog-visual-phase-1.md)
  y cierres de [fase 2](docs/catalog-phase-2.md), [fase 3](docs/catalog-phase-3.md)
  y [fase 4](docs/catalog-phase-4.md).
- [Motion](src/motion/README.md), [rendimiento y accesibilidad](docs/performance-and-accessibility.md).
- [Resultados reales y límites](docs/validation.md).
- [Arquitectura de navegación espacial](docs/book-navigation-subphase-a.md) y
  entregas de [subfase B](docs/book-navigation-subphase-b.md), [C](docs/book-navigation-subphase-c.md)
  [D](docs/book-navigation-subphase-d.md), [E](docs/book-navigation-subphase-e.md)
  y [F](docs/book-navigation-subphase-f.md).
- [Pruebas visuales de giro, apertura y cierre](docs/motion-visual-subphase-d.md).
- [Datos investigados, fotografías y modal de compra](docs/catalog-research-and-purchase-modal.md).

El catálogo funciona como un libro interactivo con apertura y navegación por caras. `#libro/N`
restaura la cara física; `#libro/N/perfume/slug` restaura la lectura del perfume y el sufijo
`/pedido` restaura el modal de compra con esa selección. Atrás, Escape y el control
de regreso conservan el contexto. Sin JS, las hojas vuelven al flujo
normal, con la información visible y enlaces «Comprar» nativos a WhatsApp. Reduced motion mantiene toda la funcionalidad
sin descargar el motor de animación.
El formulario valida nombre, teléfono, ciudad, perfume y comentario opcional; los datos permanecen
en la página hasta continuar en WhatsApp, sin almacenamiento persistente ni envío automático.
El mensaje solicita confirmar presentación y precio; no reserva ni realiza pagos.
La aceptación de F se entrega para revisión visual. Mandarin Sky de Armaf conserva el slug
`mandarine`; los precios anteriores y SKU siguen sin confirmarse. Las composiciones actuales se
sirven como WebP locales responsive de calidad 94, con fuentes y tratamiento en `docs/perfume-assets.json`.
No se ha desplegado el proyecto ni se han enviado mensajes.
