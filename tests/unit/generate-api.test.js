/**
 * Regression guard for api/generate.js token-limit parameters.
 *
 * OpenAI's newer models (GPT-6 family, o-series) renamed max_tokens ->
 * max_completion_tokens. Anthropic still uses max_tokens. If someone
 * copy-pastes the wrong parameter name between branches, the API breaks
 * silently (OpenAI returns a 400 "unsupported parameter" error).
 *
 * These assertions treat the file as text — API handlers aren't easily
 * unit-testable without mocking fetch, so we assert the exact parameter
 * name appears in each branch's request body.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generateSource = readFileSync(
  resolve(__dirname, '../../api/generate.js'),
  'utf8'
);

describe('api/generate.js token-limit parameters', () => {
  it('OpenAI branch uses max_completion_tokens (required by GPT-6 and o-series)', () => {
    // Isolate the OpenAI section between the OpenAI fetch call and the next branch
    const openaiSection = generateSource.match(
      /api\.openai\.com\/v1\/chat\/completions[\s\S]*?(?=if \(isGoogle\)|api\.anthropic\.com)/
    )?.[0];
    expect(openaiSection, 'OpenAI section not found in generate.js').toBeTruthy();
    expect(openaiSection).toContain('max_completion_tokens');
    expect(openaiSection).not.toContain('max_tokens:');
  });

  it('Anthropic branch still uses max_tokens (their standard, unchanged)', () => {
    const anthropicSection = generateSource.match(
      /api\.anthropic\.com\/v1\/messages[\s\S]*/
    )?.[0];
    expect(anthropicSection, 'Anthropic section not found in generate.js').toBeTruthy();
    expect(anthropicSection).toContain('max_tokens:');
    expect(anthropicSection).not.toContain('max_completion_tokens');
  });
});
