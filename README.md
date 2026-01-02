# md2linkedin

A tiny, single-page tool that converts Markdown-ish formatting into LinkedIn-ready **Unicode** “bold/italic/mono” text (the common LinkedIn formatting trick).

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

## Use

Open `index.html` in your browser.

There’s also a `sample.txt` you can paste into the page to try everything quickly.

## Notes / caveats

- This outputs **plain text**, not HTML.
- Unicode “font” characters can render differently depending on device/font support.
- Some characters (emojis, non‑Latin scripts) are left unchanged.

## License

MIT (add a LICENSE file if you want this explicit in the repo).
