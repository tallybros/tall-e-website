/**
 * Unit tests for the settings.js fallback logic.
 *
 * The critical invariant: the demo must never be left with zero visible
 * personas. If KV has an empty (or missing) brands array, the API must
 * return the default brands so the demo still works.
 */

import { describe, it, expect } from 'vitest';

// ─── Inline copy of the fallback logic from api/settings.js ──────────────────

const DEFAULT_BRANDS = [
  { id: 'fintech', name: 'Fintech startup', hidden: false },
  { id: 'health',  name: 'Wellness brand',  hidden: false },
  { id: 'b2b',     name: 'B2B SaaS',        hidden: false },
  { id: 'luxury',  name: 'Luxury retail',   hidden: false },
];

const DEFAULT_SETTINGS = {
  model: 'claude-sonnet-4-6',
  brands: DEFAULT_BRANDS,
};

function applyFallback(kvResult) {
  // Mirrors the GET handler logic in api/settings.js
  if (!kvResult) return DEFAULT_SETTINGS;
  if (!kvResult.brands?.length) kvResult.brands = DEFAULT_SETTINGS.brands;
  return kvResult;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('settings fallback – brands array', () => {
  it('returns full DEFAULT_SETTINGS when KV returns null', () => {
    const result = applyFallback(null);
    expect(result.brands).toHaveLength(DEFAULT_BRANDS.length);
    expect(result.model).toBe('claude-sonnet-4-6');
  });

  it('restores default brands when KV returns empty brands array', () => {
    // This is the exact state that left the demo blank.
    const result = applyFallback({ model: 'gemini-2.5-pro', brands: [] });
    expect(result.brands.length).toBeGreaterThan(0);
    expect(result.model).toBe('gemini-2.5-pro');
  });

  it('restores default brands when brands key is missing entirely', () => {
    const result = applyFallback({ model: 'gpt-4o' });
    expect(result.brands.length).toBeGreaterThan(0);
  });

  it('returns KV brands untouched when they are present', () => {
    const kvBrands = [{ id: 'cole', name: 'Cole', hidden: false, guide: 'Cole guide.' }];
    const result = applyFallback({ model: 'gpt-4o', brands: kvBrands });
    expect(result.brands).toEqual(kvBrands);
  });

  it('demo always has at least one visible persona', () => {
    const scenarios = [
      null,
      { model: 'gpt-4o', brands: [] },
      { model: 'gpt-4o' },
      { model: 'gpt-4o', brands: [{ id: 'cole', name: 'Cole', hidden: false }] },
    ];

    for (const kv of scenarios) {
      const settings = applyFallback(kv);
      const visible = settings.brands.filter((b) => !b.hidden);
      expect(visible.length, `visible personas for scenario: ${JSON.stringify(kv)}`).toBeGreaterThan(0);
    }
  });
});

describe('settings fallback – model preference', () => {
  it('preserves KV model when brands are valid', () => {
    const result = applyFallback({ model: 'gemini-2.5-pro', brands: [{ id: 'x', guide: 'g' }] });
    expect(result.model).toBe('gemini-2.5-pro');
  });

  it('uses default model when KV is null', () => {
    const result = applyFallback(null);
    expect(result.model).toBe('claude-sonnet-4-6');
  });

  it('preserves KV model even when brands are restored from defaults', () => {
    const result = applyFallback({ model: 'gpt-4o-mini', brands: [] });
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.brands.length).toBeGreaterThan(0);
  });
});
