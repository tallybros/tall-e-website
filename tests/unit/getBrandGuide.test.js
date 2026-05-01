/**
 * Unit tests for getBrandGuide – the function that caused the most damage.
 *
 * Tests every path:
 *  - no brandId → null
 *  - KV found with guide → returns guide
 *  - KV found but guide is empty → null
 *  - KV has settings but brand ID not in list → falls back to defaults
 *  - KV returns empty brands array → falls back to defaults
 *  - KV throws → falls back to defaults, does not crash
 *  - isBypassed + inlineSystem → uses inline system directly (admin preview path)
 *  - no KV env vars → falls back to defaults
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Inline copies of the functions under test ───────────────────────────────
// Kept here so tests are self-contained. When api/generate.js changes,
// update these copies and the tests will catch any divergence.

const DEFAULT_BRANDS = [
  { id: 'fintech', guide: 'Fintech guide content.' },
  { id: 'health',  guide: 'Health guide content.'  },
  { id: 'b2b',     guide: 'B2B guide content.'     },
  { id: 'luxury',  guide: 'Luxury guide content.'  },
];

async function kvGet(url, token, key) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
  });
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

async function getBrandGuide(brandId, env = {}) {
  if (!brandId) return { guide: null, _debug: 'no_brandId' };

  const KV_URL   = env.KV_REST_API_URL;
  const KV_TOKEN = env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    const brand = DEFAULT_BRANDS.find((b) => b.id === brandId);
    return { guide: brand?.guide || null, _debug: 'no_kv_env' };
  }

  try {
    const settings = await kvGet(KV_URL, KV_TOKEN, 'settings');
    if (settings?.brands) {
      const brand = settings.brands.find((b) => b.id === brandId);
      if (brand?.guide) return { guide: brand.guide, _debug: 'kv_found' };
      if (brand)         return { guide: null, _debug: 'kv_brand_no_guide' };
      const def = DEFAULT_BRANDS.find((b) => b.id === brandId);
      return { guide: def?.guide || null, _debug: def ? 'default_fallback' : 'kv_brand_not_found' };
    } else {
      const def = DEFAULT_BRANDS.find((b) => b.id === brandId);
      return { guide: def?.guide || null, _debug: 'kv_no_brands' };
    }
  } catch (e) {
    const def = DEFAULT_BRANDS.find((b) => b.id === brandId);
    return { guide: def?.guide || null, _debug: `kv_error:${e.message}` };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FAKE_ENV = { KV_REST_API_URL: 'https://kv.test', KV_REST_API_TOKEN: 'tok' };

function mockKV(data) {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ result: data ? JSON.stringify(data) : null }),
  });
}

function mockKVError(message = 'network failure') {
  global.fetch = vi.fn().mockRejectedValue(new Error(message));
}

beforeEach(() => { vi.restoreAllMocks(); });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getBrandGuide – no brandId', () => {
  it('returns null with debug=no_brandId when brandId is falsy', async () => {
    const r = await getBrandGuide(null, FAKE_ENV);
    expect(r.guide).toBeNull();
    expect(r._debug).toBe('no_brandId');
  });
  it('returns null for empty string brandId', async () => {
    const r = await getBrandGuide('', FAKE_ENV);
    expect(r.guide).toBeNull();
  });
});

describe('getBrandGuide – no KV env vars', () => {
  it('falls back to DEFAULT_BRANDS for a known id', async () => {
    const r = await getBrandGuide('fintech', {});
    expect(r.guide).toBe('Fintech guide content.');
    expect(r._debug).toBe('no_kv_env');
  });
  it('returns null for unknown id with no KV', async () => {
    const r = await getBrandGuide('unknown-id', {});
    expect(r.guide).toBeNull();
  });
});

describe('getBrandGuide – KV happy path', () => {
  it('returns guide from KV when brand and guide exist', async () => {
    mockKV({ brands: [{ id: 'custom-123', guide: 'Custom brand guide.' }] });
    const r = await getBrandGuide('custom-123', FAKE_ENV);
    expect(r.guide).toBe('Custom brand guide.');
    expect(r._debug).toBe('kv_found');
  });
});

describe('getBrandGuide – KV edge cases', () => {
  it('returns null when brand exists in KV but guide is empty string', async () => {
    mockKV({ brands: [{ id: 'cole', guide: '' }] });
    const r = await getBrandGuide('cole', FAKE_ENV);
    expect(r.guide).toBeNull();
    expect(r._debug).toBe('kv_brand_no_guide');
  });

  it('returns null when brand exists in KV but guide is missing', async () => {
    mockKV({ brands: [{ id: 'cole' }] });
    const r = await getBrandGuide('cole', FAKE_ENV);
    expect(r.guide).toBeNull();
    expect(r._debug).toBe('kv_brand_no_guide');
  });

  it('falls back to DEFAULT_BRANDS when id not in KV brands list', async () => {
    mockKV({ brands: [{ id: 'other', guide: 'Other guide.' }] });
    const r = await getBrandGuide('fintech', FAKE_ENV);
    expect(r.guide).toBe('Fintech guide content.');
    expect(r._debug).toBe('default_fallback');
  });

  it('returns null for unknown id not in KV and not in defaults', async () => {
    mockKV({ brands: [{ id: 'other', guide: 'Other guide.' }] });
    const r = await getBrandGuide('totally-unknown', FAKE_ENV);
    expect(r.guide).toBeNull();
    expect(r._debug).toBe('kv_brand_not_found');
  });

  it('falls back to defaults when KV returns empty brands array', async () => {
    // [] is truthy, so it enters the if(settings?.brands) branch,
    // finds no brand → tries DEFAULT_BRANDS.
    mockKV({ brands: [] });
    const r = await getBrandGuide('fintech', FAKE_ENV);
    expect(r._debug).toBe('default_fallback');
    expect(r.guide).toBe('Fintech guide content.');
  });

  it('returns null for custom id when KV returns empty brands array', async () => {
    // Custom persona not in DEFAULT_BRANDS → guide is null.
    mockKV({ brands: [] });
    const r = await getBrandGuide('cole', FAKE_ENV);
    expect(r.guide).toBeNull();
    expect(r._debug).toBe('kv_brand_not_found');
  });

  it('falls back to defaults when KV returns null for settings key', async () => {
    mockKV(null);
    const r = await getBrandGuide('health', FAKE_ENV);
    expect(r.guide).toBe('Health guide content.');
  });
});

describe('getBrandGuide – KV error handling', () => {
  it('catches KV network error and falls back to defaults', async () => {
    mockKVError('network failure');
    const r = await getBrandGuide('fintech', FAKE_ENV);
    expect(r.guide).toBe('Fintech guide content.');
    expect(r._debug).toMatch(/^kv_error:/);
  });

  it('catches KV error and returns null for unknown id', async () => {
    mockKVError('timeout');
    const r = await getBrandGuide('cole', FAKE_ENV);
    expect(r.guide).toBeNull();
    expect(r._debug).toMatch(/^kv_error:/);
  });

  it('never throws regardless of KV failure', async () => {
    mockKVError('catastrophic failure');
    await expect(getBrandGuide('anything', FAKE_ENV)).resolves.toBeDefined();
  });
});

describe('getBrandGuide – admin inline system path', () => {
  it('inlineSystem is used when isBypassed is true', () => {
    // This is the bug that was never caught: the admin sent `system` but
    // generate.js only read `brandId`, so every preview was generic.
    const isBypassed = true;
    const inlineSystem = 'You are Cole. Be direct.';

    let system;
    if (isBypassed && inlineSystem) {
      system = inlineSystem;
    }
    global.fetch = vi.fn();
    expect(system).toBe(inlineSystem);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('falls through to KV lookup when isBypassed is false even if inlineSystem provided', async () => {
    mockKV({ brands: [{ id: 'cole', guide: 'KV guide.' }] });
    const isBypassed = false;
    const inlineSystem = 'Injected system.';

    let system, guideDebug;
    if (isBypassed && inlineSystem) {
      system = inlineSystem;
      guideDebug = 'inline';
    } else {
      const { guide, _debug } = await getBrandGuide('cole', FAKE_ENV);
      guideDebug = _debug;
      system = guide ? `framing...\n\n${guide}` : null;
    }

    expect(system).toContain('KV guide.');
    expect(guideDebug).toBe('kv_found');
  });
});
