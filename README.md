# md2linkedin

A tiny, single-page tool that converts Markdown-ish formatting into LinkedIn-ready **Unicode** “bold/italic/mono” text (the common LinkedIn formatting trick).

Live site: <https://trsdn.github.io/md2linkedin/>
Repo: <https://github.com/trsdn/md2linkedin>
Report an issue: <https://github.com/trsdn/md2linkedin/issues/new>

## What it does

Paste Markdown on the left, copy LinkedIn-ready text on the right.

Supported:

- `**bold**`
- `*italic*`
- `***bolditalic***`
- `` `code` `` (monospace)
- `~~strike~~`
- headings like `# Title` → bold
- bullets like `- item` → `• item`
- links like `[text](url)` → `text (url)`

Also included:

- Auto convert toggle
- Bullet style selector
- Toolbar buttons for common syntax + Undo/Redo
- Copy, Select all, and Download `.txt`
- Optional rich-text paste conversion (Word / Google Docs → Markdown-ish)
- Privacy-first: runs entirely in your browser (no backend)

## Use

Open `index.html` in your browser.

Or use GitHub Pages:
<https://trsdn.github.io/md2linkedin/>

Tip: click “Insert example” on the page to paste a ready-to-go sample post.

## Validate

Two suites, both run in CI on every pull request.

The unit suite needs no dependencies at all — from a clean checkout, with
[Node.js](https://nodejs.org/) 20 or newer:

```sh
node --test
```

It reads the conversion engine straight out of `index.html` and covers the
Markdown → Unicode logic, including failure paths: unclosed markers, empty input,
emoji and non-Latin passthrough, and code spans that must stay literal. It also
checks that the app script parses, the structured data is valid JSON-LD, and the
canonical URL agrees across `index.html`, `sitemap.xml` and `robots.txt`.

The end-to-end suite drives the real page in Chromium and covers the UI layer:
live conversion while typing, toolbar buttons and selection handling, undo/redo,
the bullet style selector, clipboard, download, and the dialogs.

```sh
npm ci
npx playwright install --with-deps chromium
npm test        # unit + end-to-end
```

Individually: `npm run test:unit` and `npm run test:e2e`.

Chromium is the only browser exercised; there is no cross-browser matrix.

## Notes / caveats

- This outputs **plain text**, not HTML.
- Unicode “font” characters can render differently depending on device/font support.
- Some characters (emojis, non‑Latin scripts) are left unchanged.

## Maintenance

Maintainer and triage owner: [@trsdn](https://github.com/trsdn).

- **Dependency updates.** Dependabot checks npm and GitHub Actions weekly and opens
  pull requests. @trsdn reviews them; they merge only once CI is green. The npm
  dependencies are test-only — the published site ships no runtime dependencies.
- **Vulnerability alerts.** Dependabot alerts are enabled. @trsdn triages them and
  leaves no critical alert unresolved.

## License

Apache-2.0 (see `LICENSE`).
