/**
 * Unit tests for pure utility functions.
 * These must pass before any deploy.
 */

import { describe, it, expect } from 'vitest';

// ─── getError (ContactBot) ────────────────────────────────────────────────────
// Copied from src/components/ContactBot.jsx — if that function changes, update here too.

function validEmail(s) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test((s || '').trim());
}

function getError(key, value) {
  if (key === 'name' && !value.trim()) return "Because I hate getting \"Hi [firstname] [lastname],\" emails";
  if (key === 'email') {
    if (!value.trim()) return "Because messenger pigeons should roam free on Dam Square";
    if (!validEmail(value)) return "mmm... This doesn't look like an email";
  }
  if (key === 'message') {
    if (value.trim().length < 5) return "I'm all about words – please share a few more";
    if (value.length > 2000) return "That is a lot of information! Give me the gist and we'll talk about the details later";
  }
  return null;
}

describe('getError – name', () => {
  it('returns error for empty name', () => {
    expect(getError('name', '')).toBeTruthy();
    expect(getError('name', '   ')).toBeTruthy();
  });
  it('returns null for valid name', () => {
    expect(getError('name', 'Tally')).toBeNull();
  });
});

describe('getError – email', () => {
  it('returns error for empty email', () => {
    expect(getError('email', '')).toBeTruthy();
  });
  it('returns error for invalid email formats', () => {
    expect(getError('email', 'notanemail')).toBeTruthy();
    expect(getError('email', 'missing@tld')).toBeTruthy();
    expect(getError('email', '@nodomain.com')).toBeTruthy();
  });
  it('returns null for valid emails', () => {
    expect(getError('email', 'tally@tall-e.nl')).toBeNull();
    expect(getError('email', 'user+tag@example.co.uk')).toBeNull();
  });
});

describe('getError – message', () => {
  it('returns error for short message', () => {
    expect(getError('message', 'hi')).toBeTruthy();
    expect(getError('message', '    ')).toBeTruthy();
  });
  it('returns error for message over 2000 chars', () => {
    expect(getError('message', 'a'.repeat(2001))).toBeTruthy();
  });
  it('returns null for valid message', () => {
    expect(getError('message', 'Hello, I would like to work together.')).toBeNull();
  });
  it('returns null at exactly 2000 chars', () => {
    expect(getError('message', 'a'.repeat(2000))).toBeNull();
  });
});

// ─── linkify ─────────────────────────────────────────────────────────────────
// Copied from src/components/SelectedWork.jsx — keep in sync.

function linkify(text) {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const a = (href, label) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#17D9DA;text-decoration:underline;text-underline-offset:2px">${label}</a>`;
  return esc
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => a(url, label))
    .replace(/(?<!href=")(https?:\/\/[^\s<>"]+)/g, (url) => a(url, url));
}

describe('linkify', () => {
  it('converts markdown links', () => {
    const out = linkify('[click here](https://example.com)');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('>click here<');
  });

  it('converts bare URLs', () => {
    const out = linkify('visit https://example.com now');
    expect(out).toContain('href="https://example.com"');
  });

  it('escapes HTML in plain text', () => {
    const out = linkify('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('does not double-link already-linked URLs', () => {
    const out = linkify('[label](https://example.com)');
    expect(out.match(/href=/g)?.length).toBe(1);
  });

  it('returns plain text unchanged when no links', () => {
    expect(linkify('no links here')).toBe('no links here');
  });

  it('handles empty string', () => {
    expect(linkify('')).toBe('');
  });
});

// ─── buildSystemPrompt ────────────────────────────────────────────────────────
// Copied from api/generate.js — keep in sync.

function buildSystemPrompt(guide) {
  return `You are a writer with a specific voice. Everything you write must follow the Voice & Tone guide below — not as a generic AI, not as a helpful assistant. As this writer. Every word.\n\nDo not mention the guide. Do not explain what you are doing. Just write.\n\n${guide}\n\nStay in this voice for your entire response. If you catch yourself sounding generic, stop and rewrite.`;
}

describe('buildSystemPrompt', () => {
  it('includes the guide verbatim', () => {
    const guide = 'Be direct. Use short sentences.';
    const prompt = buildSystemPrompt(guide);
    expect(prompt).toContain(guide);
  });

  it('includes the role assignment framing', () => {
    const prompt = buildSystemPrompt('any guide');
    expect(prompt).toContain('You are a writer');
    expect(prompt).toContain('not as a generic AI');
  });

  it('includes the closing reinforcement', () => {
    const prompt = buildSystemPrompt('any guide');
    expect(prompt).toContain('stop and rewrite');
  });

  it('does not expose the word "guide" as an instruction to the model', () => {
    // The model should not be told to explain the guide back to users
    const prompt = buildSystemPrompt('any guide');
    expect(prompt).toContain('Do not mention the guide');
  });
});
