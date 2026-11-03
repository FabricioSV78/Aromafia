import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

async function getAvailablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  if (!address || typeof address === 'string')
    throw new Error('No se pudo reservar un puerto local para Chromium.');
  return address.port;
}

const port = await getAvailablePort();
const url = 'http://127.0.0.1:4321/';
const budget = JSON.parse(readFileSync('config/performance-budgets.json', 'utf8'));
// Playwright owns an isolated temporary profile and cleans it up when this browser closes.
const browser = await chromium.launch({
  channel: 'chromium',
  headless: true,
  args: [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1'],
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      ready = (
        await fetch(`http://127.0.0.1:${port}/json/version`, {
          signal: AbortSignal.timeout(1000),
        })
      ).ok;
    } catch {
      /* Browser starting. */
    }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('Chromium no inició. Ejecuta npm run test:browser:install.');
  const result = await lighthouse(url, {
    port,
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    logLevel: 'error',
  });
  if (!result) throw new Error('Lighthouse no devolvió resultados. Inicia npm run preview.');
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/lighthouse.html', result.report[0]);
  writeFileSync('reports/lighthouse.json', result.report[1]);
  const audits = result.lhr.audits;
  const summary = {
    performance: result.lhr.categories.performance.score,
    lcpMs: audits['largest-contentful-paint'].numericValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    tbtMs: audits['total-blocking-time'].numericValue,
    note: 'Laboratorio sobre el build local actual. TBT no equivale a INP de usuarios reales. SEO noindex es intencional.',
  };
  console.log(JSON.stringify(summary, null, 2));
  if (
    summary.performance < budget.minLighthousePerformance ||
    summary.lcpMs > budget.maxLabLcpMs ||
    summary.cls > budget.maxLabCls ||
    summary.tbtMs > budget.maxLabTbtMs
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
