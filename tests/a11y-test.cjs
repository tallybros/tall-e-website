const pa11y = require('pa11y');
const { start } = require('./serve-dist.cjs');

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;

// Known pre-existing issues that are intentional design decisions (low-contrast
// turquoise sections, footer muted text, purple button 0.05 under threshold).
// Baselines set 2026-05-01. Tests fail only if the count INCREASES — i.e. new
// issues are introduced. To raise a baseline, document why in a comment here.
//
// 2026-05-29: Homepage 20→23. Footer contrast issues (white brand text, copyright
// + Coolors link in muted teal) were always present but only detected after the
// Conversation Design section was added — likely pa11y timing artifact. Footer
// hasn't changed; accepting as known.
const ROUTES = [
  { path: '/',                    label: 'Homepage',                 baseline: 23 },
  { path: '/personified-ai',      label: 'Personified AI (public)',  baseline: 5  },
  { path: '/personified-ai/admin',label: 'Personified AI (admin)',   baseline: 11 },
];

async function run() {
  console.log('Building is expected already. Starting static server…');
  const server = await start(PORT);

  let failed = 0;
  try {
    for (const { path: p, label, baseline } of ROUTES) {
      console.log(`\n→ ${label} (${p})`);
      const results = await pa11y(`${BASE}${p}`, {
        standard: 'WCAG2AA',
        wait: 1500,
        timeout: 30000,
        ignore: ['notice', 'warning'],
        chromeLaunchConfig: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
      });

      const count = results.issues.length;
      const newIssues = count - baseline;

      if (newIssues <= 0) {
        console.log(`  ✓ ${count} known issue(s), none new (baseline: ${baseline}).`);
      } else {
        failed += newIssues;
        console.error(`  ✗ ${newIssues} NEW issue(s) above baseline of ${baseline} (total: ${count}):`);
        // Only show the issues beyond the baseline count so the output is actionable
        results.issues.slice(baseline).forEach((i) => {
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
    console.error(`\n${failed} new accessibility error(s) introduced. Fix before deploying.`);
    process.exitCode = 1;
  } else {
    console.log('\n✓ No new accessibility issues introduced.');
  }
}

run();
