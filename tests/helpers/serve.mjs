// Minimal static file server for the end-to-end tests.
//
// The site is served over http://localhost rather than file:// because localhost is a
// secure context, which the Clipboard API requires. Dependency-free on purpose: the
// only thing this needs to do is hand back the five files the site is made of.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

const ROOT = new URL('../../', import.meta.url);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

export function createStaticServer() {
  return createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const name = path === '/' ? 'index.html' : path.replace(/^\/+/, '');

    // Refuse traversal outside the repository root.
    const target = new URL(name, ROOT);
    if (!target.href.startsWith(ROOT.href)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    try {
      const body = await readFile(target);
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
}

const port = Number(process.env.PORT ?? 4173);

createStaticServer().listen(port, () => {
  console.log(`serving ${ROOT.pathname} on http://localhost:${port}`);
});
