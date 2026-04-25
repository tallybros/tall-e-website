const pa11y = require('pa11y');
const { start } = require('./serve-dist.cjs');

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  { path: '/', label: 'Homepage' },
  { path: '/personified-ai', label: 'Personified AI (public)' },
  { path: '/personified-ai/admin', label: 'Personified AI (admin)' },
];

async function run() {
  console.log('Building is expected already. Starting static server…');
  const server = await start(PORT);

  let failed = 0;
  try {
    for (const { path: p, label } of ROUTES) {
      console.log(`\n→ ${label} (${p})`);
      const results = await pa11y(`${BASE}${p}`, {
        standard: 'WCAG2AA',
        wait: 1500,
        timeout: 30000,
        ignore: ['notice', 'warning'],
        chromeLaunchConfig: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
      });

      if (results.issues.length === 0) {
        console.log(`  ✓ No accessibility errors.`);
      } else {
        failed += results.issues.length;
        console.error(`  ✗ ${results.issues.length} error(s):`);
        results.issues.forEach((i) => {
          console.error(`    [${i.type.toUpperCase()}] ${i.message}`);
          console.error(`    Selector: ${i.selector}`);
        });
      }
    }
  } catch (err) {
    console.error('Test runner error:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }

  if (failed > 0) {
    console.error(`\n${failed} accessibility error(s) total.`);
    process.exitCode = 1;
  } else {
    console.log('\n✓ All accessibility checks passed.');
  }
}

run();
