// Structural checks for the published site.
//
// The repo has no build step and no dependencies, so these stand in for the lint/static
// analysis a toolchain would normally provide: the app script must parse, structured data
// must be valid, and the canonical URL must agree everywhere it is repeated.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { appScript, readIndexHtml, pureScript } from './helpers/load-app.mjs';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

const html = readIndexHtml();
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

const CANONICAL = 'https://trsdn.github.io/md2linkedin/';

const attr = (re) => {
  const m = html.match(re);
  assert.ok(m, `index.html is missing ${re}`);
  return m[1];
};

// --- the app script itself ---

test('the app script is syntactically valid JavaScript', () => {
  assert.doesNotThrow(() => new vm.Script(appScript(html), { filename: 'index.html#app' }));
});

test('the pure half of the app script touches no browser globals', () => {
  // Guards the split the test harness depends on: if DOM access moves above the UI
  // wiring marker, the converter can no longer be loaded outside a browser.
  const forbidden = /\b(document|window|navigator|localStorage|sessionStorage)\b/;
  const hit = pureScript(html).match(forbidden);
  assert.equal(hit, null, `browser global "${hit?.[0]}" found above the UI wiring marker`);
});

test('structured data is valid JSON-LD', () => {
  const m = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(m, 'index.html is missing its application/ld+json block');
  const data = JSON.parse(m[1]);
  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data.url, CANONICAL);
});

// --- head metadata ---

test('index.html declares a title and a description', () => {
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.ok(attr(/<meta name="description" content="([^"]+)"/).length > 0);
});

test('the document language is declared', () => {
  assert.match(html, /<html lang="[a-z]{2}(-[A-Z]{2})?"/);
});

// --- canonical URL agreement ---

test('canonical, og:url and JSON-LD all point at the same URL', () => {
  assert.equal(attr(/<link rel="canonical" href="([^"]+)"/), CANONICAL);
  assert.equal(attr(/<meta property="og:url" content="([^"]+)"/), CANONICAL);
});

test('sitemap lists the canonical URL', () => {
  const loc = sitemap.match(/<loc>([^<]+)<\/loc>/);
  assert.ok(loc, 'sitemap.xml has no <loc>');
  assert.equal(loc[1], CANONICAL);
});

test('robots.txt points at the sitemap on the canonical origin', () => {
  const line = robots.match(/^Sitemap:\s*(\S+)$/m);
  assert.ok(line, 'robots.txt has no Sitemap: line');
  assert.equal(line[1], `${CANONICAL}sitemap.xml`);
});

test('robots.txt allows indexing', () => {
  assert.match(robots, /^User-agent:\s*\*$/m);
  assert.match(robots, /^Allow:\s*\/$/m);
});

// --- transport safety ---

test('no plaintext http:// URLs are referenced', () => {
  // Mixed content would be blocked on the HTTPS-only Pages origin.
  //
  // xmlns values are excluded: an XML namespace is an opaque identifier, not a link.
  // The sitemap namespace is defined as http://www.sitemaps.org/schemas/sitemap/0.9 and
  // rewriting it to https would make the sitemap invalid.
  const withoutNamespaces = (text) => text.replace(/xmlns(:\w+)?="[^"]*"/g, '');

  for (const [name, text] of [
    ['index.html', html],
    ['robots.txt', robots],
    ['sitemap.xml', sitemap],
  ]) {
    assert.equal(
      withoutNamespaces(text).includes('http://'),
      false,
      `${name} references a plaintext http:// URL`,
    );
  }
});
