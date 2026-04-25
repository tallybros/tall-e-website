const puppeteer = require('puppeteer');
const { start } = require('./serve-dist.cjs');

const PORT = 3998;
const BASE = `http://localhost:${PORT}`;

const results = [];

function record(name, ok, err) {
  results.push({ name, ok, err });
  if (ok) console.log(`  ✓ ${name}`);
  else console.error(`  ✗ ${name}\n    ${err}`);
}

async function withPage(browser, url, fn) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    // Skip the browser's generic "Failed to load resource" message — the
    // response-handler below already records the specific URL + status.
    if (/Failed to load resource/i.test(t)) return;
    consoleErrors.push(t);
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  page.on('response', (resp) => {
    if (resp.status() >= 400) consoleErrors.push(`${resp.status()} ${resp.url()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  try {
    await fn(page, consoleErrors);
  } finally {
    await page.close();
  }
}

// ─── Shared checks ───────────────────────────────────────────────────────────

async function assertNoConsoleErrors(consoleErrors, label) {
  const ignored = /favicon|manifest|vercel|analytics|posthog|fonts\.googleapis|fonts\.gstatic|base44\.com/i;
  const real = consoleErrors.filter((e) => !ignored.test(e));
  if (real.length) throw new Error(`Console errors on ${label}:\n    ${real.join('\n    ')}`);
}

async function assertNoBrokenImages(page) {
  const broken = await page.$$eval('img', (imgs) =>
    imgs
      .filter((i) => i.src && !i.complete || (i.naturalWidth === 0 && i.src && !i.src.startsWith('data:')))
      .map((i) => i.src)
  );
  if (broken.length) throw new Error(`Broken images: ${broken.join(', ')}`);
}

async function assertTextContrast(page) {
  // Flag text that is visually indistinguishable from its background (catches things
  // like text-turquoise on a turquoise section). Rough luminance-difference check.
  const bad = await page.evaluate(() => {
    function parseRgb(s) {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(',').map((v) => parseFloat(v.trim()));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] == null ? 1 : parts[3] };
    }
    function lum({ r, g, b }) {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    function effectiveBg(el) {
      let e = el;
      while (e) {
        const c = parseRgb(getComputedStyle(e).backgroundColor);
        if (c && c.a > 0) return c;
        e = e.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    }
    const out = [];
    const nodes = document.querySelectorAll('h1,h2,h3,h4,p,a,span,li,button');
    nodes.forEach((el) => {
      const text = (el.innerText || '').trim();
      if (!text || text.length < 2) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const fg = parseRgb(cs.color);
      if (!fg || fg.a < 0.3) return;
      const bg = effectiveBg(el);
      const l1 = lum(fg), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio < 1.4) {
        out.push({
          tag: el.tagName,
          text: text.slice(0, 60),
          fg: cs.color,
          bg: `rgb(${bg.r},${bg.g},${bg.b})`,
          ratio: ratio.toFixed(2),
        });
      }
    });
    return out;
  });
  if (bad.length) {
    const sample = bad.slice(0, 5).map((b) => `<${b.tag}> "${b.text}" ${b.fg} on ${b.bg} (ratio ${b.ratio})`).join('\n    ');
    throw new Error(`${bad.length} near-invisible text node(s):\n    ${sample}`);
  }
}

// ─── Route-specific checks ───────────────────────────────────────────────────

async function checkHomepage(browser) {
  await withPage(browser, `${BASE}/`, async (page, consoleErrors) => {
    record('Homepage: loads without console errors', true, null);
    try { await assertNoConsoleErrors(consoleErrors, '/'); } catch (e) { record('Homepage: no console errors', false, e.message); }

    try {
      const sections = ['work', 'personified-ai', 'about', 'contact'];
      for (const id of sections) {
        const el = await page.$(`#${id}`);
        if (!el) throw new Error(`Missing section #${id}`);
      }
      record('Homepage: all main sections present', true, null);
    } catch (e) { record('Homepage: all main sections present', false, e.message); }

    try { await assertNoBrokenImages(page); record('Homepage: no broken images', true, null); }
    catch (e) { record('Homepage: no broken images', false, e.message); }

    try { await assertTextContrast(page); record('Homepage: text is visible (contrast)', true, null); }
    catch (e) { record('Homepage: text is visible (contrast)', false, e.message); }

    try {
      await page.click('a[href="/personified-ai"]');
      await page.waitForFunction(() => location.pathname === '/personified-ai', { timeout: 5000 });
      record('Homepage: "Try the demo" routes to /personified-ai', true, null);
    } catch (e) { record('Homepage: "Try the demo" routes to /personified-ai', false, e.message); }
  });
}

async function checkPersonifiedPublic(browser) {
  await withPage(browser, `${BASE}/personified-ai`, async (page, consoleErrors) => {
    await page.waitForSelector('.persona-btn', { timeout: 10000 }).catch(() => {});

    try { await assertNoConsoleErrors(consoleErrors, '/personified-ai'); record('PAI: no console errors', true, null); }
    catch (e) { record('PAI: no console errors', false, e.message); }

    const required = ['.persona-card', '.persona-row', '#brand-desc', '#preset-row', '#prompt-input', '#run-btn', '.output-grid', '#generic-out', '#guided-out'];
    try {
      for (const sel of required) {
        const el = await page.$(sel);
        if (!el) throw new Error(`Missing: ${sel}`);
      }
      record('PAI: required elements present', true, null);
    } catch (e) { record('PAI: required elements present', false, e.message); }

    try {
      const getY = (sel) => page.$eval(sel, (el) => Math.round(el.getBoundingClientRect().top));
      const anchors = ['#prompt-input', '.output-grid'];
      const before = {};
      for (const s of anchors) before[s] = await getY(s);
      const btns = await page.$$('.persona-btn');
      for (let i = 1; i < btns.length; i++) {
        await btns[i].click();
        await new Promise((r) => setTimeout(r, 150));
        for (const s of anchors) {
          const after = await getY(s);
          if (Math.abs(before[s] - after) > 2) throw new Error(`Layout shift on persona ${i + 1}: ${s} moved ${before[s]}→${after}`);
        }
      }
      record('PAI: layout stable across persona switches', true, null);
    } catch (e) { record('PAI: layout stable across persona switches', false, e.message); }

    try {
      const cols = await page.$$eval('.output-grid', (els) => {
        if (!els[0]) return 0;
        return getComputedStyle(els[0]).gridTemplateColumns.trim().split(/\s+/).length;
      });
      if (cols !== 2) throw new Error(`output-grid has ${cols} cols, expected 2`);
      record('PAI: output grid is two columns', true, null);
    } catch (e) { record('PAI: output grid is two columns', false, e.message); }

    try { await assertTextContrast(page); record('PAI: text is visible (contrast)', true, null); }
    catch (e) { record('PAI: text is visible (contrast)', false, e.message); }
  });
}

async function checkPersonifiedAdmin(browser) {
  await withPage(browser, `${BASE}/personified-ai/admin`, async (page, consoleErrors) => {
    try { await assertNoConsoleErrors(consoleErrors, '/personified-ai/admin'); record('Admin: no console errors', true, null); }
    catch (e) { record('Admin: no console errors', false, e.message); }

    try {
      const gate = await page.$('#gate');
      if (!gate) throw new Error('Admin gate (#gate) is not rendered');
      record('Admin: password gate renders', true, null);
    } catch (e) { record('Admin: password gate renders', false, e.message); }

    try {
      const robots = await page.$eval('meta[name="robots"]', (m) => m.getAttribute('content'));
      if (!/noindex/.test(robots)) throw new Error(`robots meta is "${robots}"`);
      record('Admin: noindex meta tag is present', true, null);
    } catch (e) { record('Admin: noindex meta tag is present', false, e.message); }
  });
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function run() {
  console.log('Starting static server…');
  const server = await start(PORT);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    console.log('\n--- Homepage ---');
    await checkHomepage(browser);
    console.log('\n--- Personified AI (public) ---');
    await checkPersonifiedPublic(browser);
    console.log('\n--- Personified AI (admin) ---');
    await checkPersonifiedAdmin(browser);
  } finally {
    await browser.close();
    server.close();
  }

  const failed = results.filter((r) => !r.ok).length;
  if (failed > 0) {
    console.error(`\n${failed} regression test(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\n✓ All ${results.length} regression tests passed.`);
  }
}

run().catch((err) => { console.error(err); process.exitCode = 1; });
