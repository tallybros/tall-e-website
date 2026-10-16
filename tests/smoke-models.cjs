/**
 * Smoke test for every model in the allowlists.
 *
 * Calls /api/generate with a 1-sentence prompt for each configured model
 * and verifies a non-error response. Catches the class of bugs where a
 * provider changes required parameters, deprecates a model ID, or an API
 * key goes stale — before a real user does.
 *
 * Uses the DEV_TOKEN rate-limit bypass so repeated runs don't trip the
 * per-IP limiter.
 *
 * Usage:
 *   npm run test:models
 *   npm run test:models -- --url http://localhost:5173
 *
 * Requires DEV_TOKEN or ADMIN_PASSWORD in .env.local or .env.
 * (Pull from Vercel with `vercel env pull .env.local`.)
 */

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ─── Load env files (manual, so no Node-version requirement) ──────────────
for (const file of ['.env.local', '.env']) {
  const p = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    const [, key, raw] = m;
    if (key in process.env) continue; // first-file-wins, don't overwrite real env
    process.env[key] = raw.replace(/^["']|["']$/g, '');
  }
}

// ─── Parse CLI args ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const BASE = urlFlag !== -1 ? args[urlFlag + 1] : 'https://tall-e.ai';
const DEV_TOKEN = process.env.DEV_TOKEN || process.env.ADMIN_PASSWORD;

if (!DEV_TOKEN) {
  console.error(
    '❌  No DEV_TOKEN or ADMIN_PASSWORD in .env.local or .env.\n' +
      '    Pull them from Vercel:  vercel env pull .env.local\n' +
      '    Or add manually:        DEV_TOKEN=<value> >> .env\n'
  );
  process.exit(2);
}

// ─── Extract model allowlists from generate.js ────────────────────────────
// Single source of truth: parse the arrays directly so we always test
// exactly the models the API will accept.
const generateSource = fs.readFileSync(
  path.resolve(__dirname, '../api/generate.js'),
  'utf8'
);

function extractList(name) {
  const match = generateSource.match(
    new RegExp(`${name}\\s*=\\s*\\[([^\\]]+)\\]`)
  );
  if (!match) throw new Error(`Could not find ${name} in generate.js`);
  return match[1]
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

const MODELS = [
  ...extractList('OPENAI_MODELS').map((m) => ({ provider: 'OpenAI', id: m })),
  ...extractList('ANTHROPIC_MODELS').map((m) => ({ provider: 'Anthropic', id: m })),
  ...extractList('GOOGLE_MODELS').map((m) => ({ provider: 'Google', id: m })),
];

// ─── HTTP POST helper ─────────────────────────────────────────────────────
function post(endpoint, body) {
  return new Promise((resolve, reject) => {
    const parsed = new url.URL(endpoint);
    const lib = parsed.protocol === 'https:' ? https : http;
    const payload = JSON.stringify(body);
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data: { error: `Non-JSON: ${data.slice(0, 200)}` } });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── Run ──────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n📋 Smoke-testing ${MODELS.length} models against ${BASE}\n`);

  const results = [];
  for (const { provider, id } of MODELS) {
    const start = Date.now();
    try {
      const { status, data } = await post(`${BASE}/api/generate`, {
        prompt: 'Reply with the single word: ok',
        model: id,
        devToken: DEV_TOKEN,
      });
      const ms = Date.now() - start;
      if (status === 200 && data.text) {
        console.log(`  ✓ ${provider.padEnd(10)} ${id.padEnd(28)} ${ms}ms`);
        results.push({ ok: true, id });
      } else {
        console.error(
          `  ✗ ${provider.padEnd(10)} ${id.padEnd(28)} HTTP ${status} — ${data.error || JSON.stringify(data).slice(0, 100)}`
        );
        results.push({ ok: false, id, err: data.error || `HTTP ${status}` });
      }
    } catch (err) {
      console.error(`  ✗ ${provider.padEnd(10)} ${id.padEnd(28)} ${err.message}`);
      results.push({ ok: false, id, err: err.message });
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log('');
  if (failed.length) {
    console.error(`❌  ${failed.length}/${results.length} model(s) failed. Fix before deploying.\n`);
    process.exit(1);
  } else {
    console.log(`✅  All ${results.length} models respond correctly.\n`);
  }
}

run().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
