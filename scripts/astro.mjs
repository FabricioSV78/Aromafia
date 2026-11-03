// Keep local commands self-contained; no global telemetry config or analytics calls.
process.env.ASTRO_TELEMETRY_DISABLED = '1';
await import('../node_modules/astro/bin/astro.mjs');
