/**
 * Static guards for api/generate.js — catches the class of bugs where the
 * wrong parameter name, model ID, or body shape sneaks into a provider's
 * request. These run instantly, no API calls. For live-API smoke testing,
 * see tests/smoke-models.cjs (run via `npm run test:models` before deploy).
 *
 * The three main classes caught here:
 *   1. Wrong token-limit param (OpenAI's max_tokens -> max_completion_tokens)
 *   2. Required body fields missing per provider
 *   3. Admin UI dropdown drifting from the server-side allowlist (a model
 *      shown to the user but rejected by the API, or vice versa)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(__dirname, p), 'utf8');

const generateSource = read('../../api/generate.js');
const adminSource = read('../../src/pages/PersonifiedAIAdmin.jsx');

// ─── Helpers ──────────────────────────────────────────────────────────────
function sectionBetween(source, from, to) {
  const start = source.indexOf(from);
  if (start === -1) return null;
  const end = to ? source.indexOf(to, start + from.length) : source.length;
  return source.slice(start, end === -1 ? source.length : end);
}

function extractAllowlist(name) {
  const match = generateSource.match(
    new RegExp(`${name}\\s*=\\s*\\[([^\\]]+)\\]`)
  );
  if (!match) return null;
  return match[1]
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

// ─── 1. Token-limit parameter name per provider ───────────────────────────
describe('api/generate.js — token-limit parameter per provider', () => {
  it('OpenAI branch uses max_completion_tokens (required by GPT-6 and o-series)', () => {
    const section = sectionBetween(
      generateSource,
      'api.openai.com/v1/chat/completions',
      'if (isGoogle)'
    );
    expect(section, 'OpenAI section not found').toBeTruthy();
    expect(section).toContain('max_completion_tokens');
    expect(section).not.toMatch(/[^_]max_tokens:/); // not preceded by underscore
  });

  it('Anthropic branch still uses max_tokens (their standard, unchanged)', () => {
    const section = sectionBetween(generateSource, 'api.anthropic.com/v1/messages');
    expect(section, 'Anthropic section not found').toBeTruthy();
    expect(section).toContain('max_tokens:');
    expect(section).not.toContain('max_completion_tokens');
  });
});

// ─── 2. Required body fields per provider ─────────────────────────────────
describe('api/generate.js — required body fields per provider', () => {
  it('OpenAI body includes model, messages, and max_completion_tokens', () => {
    const section = sectionBetween(
      generateSource,
      'api.openai.com/v1/chat/completions',
      'if (isGoogle)'
    );
    expect(section).toMatch(/\bmodel:|\bmodel\b.*?selectedModel/);
    expect(section).toMatch(/\bmessages\b/);
    expect(section).toContain('max_completion_tokens');
  });

  it('Anthropic body includes model, messages, and max_tokens', () => {
    const section = sectionBetween(generateSource, 'api.anthropic.com/v1/messages');
    expect(section).toMatch(/\bmodel:/);
    expect(section).toMatch(/\bmessages:/);
    expect(section).toContain('max_tokens:');
  });

  it('Google body includes contents (its required shape)', () => {
    const section = sectionBetween(generateSource, 'if (isGoogle)', 'api.anthropic.com');
    expect(section).toBeTruthy();
    expect(section).toContain('contents:');
    expect(section).toContain('generativelanguage.googleapis.com');
  });
});

// ─── 3. Admin UI dropdown vs. server allowlist drift ──────────────────────
describe('admin UI model options vs. server allowlists', () => {
  // Parse ALL_MODELS from PersonifiedAIAdmin.jsx (array of {value, label} objects)
  const uiMatch = adminSource.match(/const ALL_MODELS\s*=\s*\[([\s\S]*?)\];/);
  const uiModelValues = uiMatch
    ? [...uiMatch[1].matchAll(/value:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
    : [];

  const allAllowlisted = [
    ...(extractAllowlist('OPENAI_MODELS') || []),
    ...(extractAllowlist('ANTHROPIC_MODELS') || []),
    ...(extractAllowlist('GOOGLE_MODELS') || []),
  ];

  it('found the admin UI model list', () => {
    expect(uiModelValues.length).toBeGreaterThan(0);
  });

  it('every model shown in the admin UI is in a server-side allowlist', () => {
    const unlisted = uiModelValues.filter((m) => !allAllowlisted.includes(m));
    expect(unlisted, `admin UI offers models the API would reject: ${unlisted.join(', ')}`).toEqual([]);
  });

  it('every server-allowlisted model is offered somewhere in the admin UI', () => {
    const missingFromUI = allAllowlisted.filter((m) => !uiModelValues.includes(m));
    expect(missingFromUI, `allowlisted but not shown in admin: ${missingFromUI.join(', ')}`).toEqual([]);
  });
});
