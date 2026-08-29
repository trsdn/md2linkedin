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

From a clean checkout, with [Node.js](https://nodejs.org/) 20 or newer:

```sh
node --test
```

There is no install step and no dependencies: the suite uses only Node's built-in
test runner, and reads the conversion engine straight out of `index.html`.

It covers:

- The Markdown → Unicode conversion engine, including failure paths — unclosed
  markers, empty input, emoji and non-Latin passthrough, and code spans that must
  stay literal.
- Structural checks on the published site — the app script parses, the structured
  data is valid JSON-LD, and the canonical URL agrees across `index.html`,
  `sitemap.xml` and `robots.txt`.

It does not cover the UI wiring layer (toolbar, undo/redo, clipboard, download) or
cross-browser rendering; both need a real browser.

The same command runs in CI on every pull request and on every push to `main`.

## Notes / caveats

- This outputs **plain text**, not HTML.
- Unicode “font” characters can render differently depending on device/font support.
- Some characters (emojis, non‑Latin scripts) are left unchanged.

## Maintenance

Maintainer and triage owner: [@trsdn](https://github.com/trsdn).

- **Dependency updates.** Dependabot checks GitHub Actions weekly and opens pull
  requests. @trsdn reviews them; they merge only once CI is green. GitHub Actions
  is the only ecosystem configured, because the site ships no package manifest.
- **Vulnerability alerts.** Dependabot alerts are enabled. @trsdn triages them and
  leaves no critical alert unresolved.

## License

Apache-2.0 (see `LICENSE`).
