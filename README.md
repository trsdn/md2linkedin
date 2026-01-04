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

## Notes / caveats

- This outputs **plain text**, not HTML.
- Unicode “font” characters can render differently depending on device/font support.
- Some characters (emojis, non‑Latin scripts) are left unchanged.

## License

Apache-2.0 (see `LICENSE`).
