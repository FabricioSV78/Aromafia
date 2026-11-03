# Skills y herramientas

Auditoría: **2 de noviembre de 2026**. Se revisaron las skills locales antes de instalar nuevas,
el catálogo oficial `openai/skills` y las instrucciones de cada fuente elegida.

## Disponibles antes de esta fase

20 skills de usuario: `agents-sdk`, `basin`, `cf-cli`, `cloudflare`, `cloudflare-email-service`,
`cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `gateway-workers`, `k2`,
`nextjs-on-cloudflare`, `sandbox-migrate-to-next`, `sandbox-next`, `sandbox-sdk`, `sandbox-stable`,
`turnstile-spin`, `web-perf`, `workers-best-practices`, `workers-profiling`, `wrangler`.

5 directorios de sistema verificados: `imagegen`, `openai-docs`, `review-agent`, `skill-creator`
y `skill-installer`. `review-agent` existe en disco pero no figura como skill activa en el catálogo
de esta sesión; no se invocó. El inventario de rutas está en `skills-lock.json`.

Plugins disponibles en el contexto: Sites, Plugin Management y Work Pets. No se usaron para
registrar/publicar proyectos ni conectar cuentas. Chrome DevTools ya estaba disponible y se
utilizó para verificar la carga y una escena técnica temporal. Node24.18.1, npm11.16.0 y Git2.55.0
estaban presentes. No había Python funcional en PATH, solo el alias de WindowsApps.

Para esta fase se aplicaron `skill-installer`, `cloudflare` y `web-perf`. Las skills de productos
Cloudflare específicos quedan disponibles para su necesidad real. No se instalaron duplicados.

## Cuatro instalaciones acotadas al proyecto

| Skill                         | Fuente oficial / revisión auditada                                                                    | Aplicación                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `vercel-react-best-practices` | `vercel-labs/agent-skills`, `skills/react-best-practices`, `063bee94c3f4df8453406c830b0a7df0f2860278` | Islas pequeñas, imports directos, carga condicional, sin convertir Astro en Next |
| `web-design-guidelines`       | Mismo repo/SHA, `skills/web-design-guidelines`                                                        | Semántica, teclado, foco, imágenes y accesibilidad                               |
| `frontend-design`             | `anthropics/skills`, `skills/frontend-design`, `41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f`             | Tokens basados en marca; futura dirección visual tras recibir el brief           |
| `gsap-performance`            | `greensock/gsap-skills`, `skills/gsap-performance`, `aed9cfd3277740755f6bfc1155c7aa645403b760`        | Transform/opacity, carga por escena, suspensión y limpieza                       |

Están en `.agents/skills/`, no en una colección global duplicada. La procedencia y hashes se
registran en `skills-lock.json`. Las revisiones son auditadas y reproducibles; no se afirma que
sean siempre el último HEAD. El instalador rechaza sobrescribir directorios existentes.
Las skills estarán disponibles automáticamente desde el siguiente turno; sus archivos se leyeron
y sus reglas pertinentes se aplicaron durante esta implementación.

Se usó el helper oficial de OpenAI `install-skill-from-github.py` con `--ref`, `--dest` y
`--method download`. Para ejecutarlo se descargó Python3.14.10 embebible de python.org en
`.cache/tooling`, verificando firma Authenticode válida de Python Software Foundation antes
de ejecutarlo. No se alteró Python global ni la política PowerShell. No se ejecutaron scripts
de las skills descargadas: las carpetas seleccionadas son documentación.

## Alcance y precauciones concretas

- `frontend-design` no autoriza construir el hero o inventar secciones. El brief explícito prevalece.
- Las reglas específicas de Next/RSC no aplican a Astro. No instalar SWR u otros paquetes por un ejemplo.
- La fuente de `web-design-guidelines` consulta reglas actuales de Vercel; ese enlace externo es mutable
  aunque la skill esté fijada. Revisar el contenido antes de aplicarlo.
- GSAP enlaza su repositorio de skills desde sus docs oficiales. No se instalaron `gsap-core` ni
  `gsap-scrolltrigger` en la revisión examinada: se detectaron problemas de frontmatter/ejemplos
  y no hacen falta para esta base. Lifecycle se verificó con docs oficiales y pruebas propias.
- No se instaló la skill OpenAI `playwright`: está orientada a CLI interactiva con Bash. Este proyecto
  usa `@playwright/test` y Chrome DevTools, suficientes para su flujo actual.
- No se instaló `cloudflare-deploy`: ya existen skills Cloudflare y esta fase no despliega.
- No se inventaron skills de SEO/Astro/accesibilidad inexistentes: se usaron fuentes oficiales y pruebas.

Fuentes: [instalador OpenAI](https://github.com/openai/skills/tree/main/skills/.system/skill-installer),
[Vercel](https://github.com/vercel-labs/agent-skills),
[Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design),
[GSAP](https://github.com/greensock/gsap-skills),
[reglas web de Vercel](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
