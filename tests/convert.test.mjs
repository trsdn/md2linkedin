// Behavior and failure-path coverage for the Markdown -> LinkedIn Unicode converter.
//
// These assert CURRENT behavior. Where current behavior is a rough edge it is asserted
// as-is and labelled, so that changing it is a deliberate act with a failing test, not a
// silent regression.

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConverter } from './helpers/load-app.mjs';

const { mdToLinkedInUnicode: md, stylize, strike, STYLE } = loadConverter();

// --- emphasis ---

test('bold maps to mathematical bold', () => {
  assert.equal(md('**bold**'), '𝐛𝐨𝐥𝐝');
  assert.equal(md('__bold__'), '𝐛𝐨𝐥𝐝');
});

test('italic maps to mathematical italic', () => {
  assert.equal(md('*italic*'), '𝑖𝑡𝑎𝑙𝑖𝑐');
  assert.equal(md('_italic_'), '𝑖𝑡𝑎𝑙𝑖𝑐');
});

test('bold-italic is applied before bold and italic', () => {
  assert.equal(md('***both***'), '𝒃𝒐𝒕𝒉');
  assert.equal(md('___both___'), '𝒃𝒐𝒕𝒉');
});

test('italic lowercase h uses U+210E, not the mathematical italic block', () => {
  // U+1D455 is unassigned; Unicode places italic small h at PLANCK CONSTANT.
  assert.equal(md('*hi*'), 'ℎ𝑖');
  assert.ok(md('*hi*').startsWith('\u210E'));
});

test('bold has digits but italic and bold-italic do not', () => {
  assert.equal(md('**2024**'), '𝟐𝟎𝟐𝟒');
  assert.equal(md('*2024*'), '2024');
  assert.equal(md('***2024***'), '2024');
});

// --- code ---

test('inline code becomes monospace', () => {
  assert.equal(md('`code`'), '𝚌𝚘𝚍𝚎');
});

test('markdown inside inline code is not re-emphasised', () => {
  // Code spans are protected before the emphasis pass, so the asterisks survive literally.
  assert.equal(md('`**not bold**`'), '**𝚗𝚘𝚝 𝚋𝚘𝚕𝚍**');
});

test('fenced code blocks become monospace line by line', () => {
  assert.equal(md('```\ncode line\n```'), '\n𝚌𝚘𝚍𝚎 𝚕𝚒𝚗𝚎\n');
});

// --- block structure ---

test('headings become bold and lose their markers', () => {
  assert.equal(md('# Title'), '𝐓𝐢𝐭𝐥𝐞');
  assert.equal(md('###### Title'), '𝐓𝐢𝐭𝐥𝐞');
});

test('bullets use the default bullet char', () => {
  assert.equal(md('- item'), '• item');
  assert.equal(md('+ item'), '• item');
});

test('bullet char is configurable', () => {
  assert.equal(md('- item', { bulletChar: '–' }), '– item');
});

test('links flatten to "text (url)"', () => {
  assert.equal(md('[t](https://e.com)'), 't (https://e.com)');
});

test('tables render as aligned plain text', () => {
  assert.equal(md('| a | b |\n| --- | --- |\n| 1 | 2 |'), 'a | b\n----|----\n1 | 2');
});

test('strikethrough combines U+0336 but leaves spaces bare', () => {
  assert.equal(md('~~no~~'), 'n̶o̶');
  assert.equal(md('~~a b~~'), 'a̶ b̶');
});

// --- failure and edge paths ---

test('empty input produces empty output', () => {
  assert.equal(md(''), '');
});

test('unclosed markers are left untouched rather than half-converted', () => {
  assert.equal(md('**oops'), '**oops');
  assert.equal(md('~~oops'), '~~oops');
  assert.equal(md('`oops'), '`oops');
});

test('astral-plane characters pass through unchanged', () => {
  // Surrogate pairs must not be split by the code-point mapping.
  assert.equal(md('**a 🎉 b**'), '𝐚 🎉 𝐛');
});

test('non-Latin scripts pass through unchanged', () => {
  assert.equal(md('**日本語**'), '日本語');
});

test('asterisk bullets are not consumed by the italic rule', () => {
  assert.equal(md('* item'), '• item');
});

test('a single-character italic span is left unconverted', () => {
  // Current behavior: the italic rule needs a non-space at both ends of a >=2 char span.
  assert.equal(md('*h*'), '*h*');
});

test('CRLF input is normalised to LF', () => {
  assert.equal(md('a\r\nb'), 'a\nb');
});

test('runs of blank lines collapse to a single blank line', () => {
  assert.equal(md('a\n\n\n\n\nb'), 'a\n\nb');
});

test('trailing whitespace before a newline is stripped', () => {
  assert.equal(md('a   \nb'), 'a\nb');
});

// --- helper-level guarantees ---

test('stylize leaves unmapped characters alone', () => {
  assert.equal(stylize(STYLE.BOLD, '!?-'), '!?-');
});

test('strike preserves newlines without overlaying them', () => {
  assert.equal(strike('a\nb'), 'a̶\nb̶');
});
