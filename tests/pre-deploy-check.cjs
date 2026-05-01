/**
 * Pre-deploy safety check.
 *
 * Run this BEFORE every `vercel --prod`. It:
 *  1. Reads the current production /api/settings and prints it clearly.
 *  2. Verifies the response has a valid shape (model + non-empty brands).
 *  3. Exits non-zero if anything looks wrong, blocking the deploy.
 *
 * Usage:  node tests/pre-deploy-check.cjs
 *         node tests/pre-deploy-check.cjs --url https://preview.vercel.app
 */

const https = require('https');
const url = require('url');

const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const BASE = urlFlag !== -1 ? args[urlFlag + 1] : 'https://www.tall-e.nl';

function get(endpoint) {
  return new Promise((resolve, reject) => {
    const parsed = new url.URL(endpoint);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: { Accept: 'application/json' },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { reject(new Error(`Non-JSON response: ${body.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log(`\n📋 Pre-deploy check against: ${BASE}\n`);
  let failed = false;

  console.log('Checking /api/settings…');
  try {
    const { status, data } = await get(`${BASE}/api/settings`);

    if (status !== 200) {
      console.error(`  ✗ HTTP ${status} – expected 200`);
      failed = true;
    } else {
      console.log(`  HTTP ${status} OK`);
    }

    console.log('\n  ── Current production state ──────────────────────────');
    console.log(`  Model: ${data.model}`);
    if (!data.brands || data.brands.length === 0) {
      console.error('  ✗ brands: [] – EMPTY. Deploy blocked to prevent blank demo.');
      failed = true;
    } else {
      console.log(`  Brands (${data.brands.length}):`);
      data.brands.forEach((b, i) => {
        const guideLen = (b.guide || '').length;
        const presets  = (b.presets || []).length;
        const vis      = b.hidden ? '(hidden)' : '(visible)';
        const guideOk  = guideLen > 50 ? '✓' : '⚠ short';
        console.log(`    ${i + 1}. ${b.name} [${b.id}] ${vis} – guide: ${guideLen} chars ${guideOk}, presets: ${presets}`);
        if (guideLen === 0 && !b.hidden) {
          console.error(`       ✗ EMPTY guide on visible persona "${b.name}" – will produce generic output!`);
          failed = true;
        }
      });

      const visible = data.brands.filter((b) => !b.hidden);
      if (visible.length === 0) {
        console.error('  ✗ All brands are hidden – demo would show no personas!');
        failed = true;
      } else {
        console.log(`\n  ✓ ${visible.length} visible persona(s) – demo will work.`);
      }
    }
    console.log('  ─────────────────────────────────────────────────────\n');

  } catch (err) {
    console.error(`  ✗ Failed to fetch /api/settings: ${err.message}`);
    failed = true;
  }

  if (failed) {
    console.error('❌  Pre-deploy check FAILED. Fix the above before deploying.\n');
    process.exit(1);
  } else {
    console.log('✅  Pre-deploy check passed. Safe to deploy.\n');
  }
}

run().catch((err) => {
  console.error('Pre-deploy check crashed:', err);
  process.exit(1);
});
