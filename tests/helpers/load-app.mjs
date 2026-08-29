// Loads the pure conversion engine out of index.html so it can be tested in Node.
//
// index.html is a single-file app with no build step, so there is nothing to import.
// The app script splits into a pure half (Unicode mapping + Markdown conversion) and a
// DOM half, separated by the UI_MARKER comment. Only the pure half is evaluated here,
// which keeps the tests dependency-free and leaves index.html untouched.
//
// Both invariants below are asserted rather than assumed: if index.html is refactored so
// that either stops holding, every test fails with an actionable message instead of
// silently testing nothing.

import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const INDEX_HTML = new URL('../../index.html', import.meta.url);
const UI_MARKER = '// --- UI wiring ---';

export function readIndexHtml() {
  return readFileSync(INDEX_HTML, 'utf8');
}

/** The single application <script>, excluding the typed application/ld+json block. */
export function appScript(html = readIndexHtml()) {
  const matches = [...html.matchAll(/<script(?![^>]*\btype=)[^>]*>([\s\S]*?)<\/script>/g)];
  if (matches.length !== 1) {
    throw new Error(
      `expected exactly 1 untyped <script> in index.html, found ${matches.length}; ` +
        'update tests/helpers/load-app.mjs if the page structure changed on purpose',
    );
  }
  return matches[0][1];
}

/** The pure half of the app script: everything before the UI wiring. */
export function pureScript(html = readIndexHtml()) {
  const body = appScript(html);
  const cut = body.indexOf(UI_MARKER);
  if (cut === -1) {
    throw new Error(
      `marker "${UI_MARKER}" not found in index.html; ` +
        'update tests/helpers/load-app.mjs if the section was renamed on purpose',
    );
  }
  return body.slice(0, cut);
}

/** Evaluates the pure half in an isolated context and returns its converter API. */
export function loadConverter() {
  const context = vm.createContext({});
  vm.runInContext(
    pureScript() +
      '\n;globalThis.__api = { mdToLinkedInUnicode, stylize, strike, mapChar, STYLE };',
    context,
    { filename: 'index.html#app' },
  );
  return context.__api;
}
