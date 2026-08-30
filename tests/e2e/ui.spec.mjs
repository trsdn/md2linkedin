// End-to-end coverage for the UI wiring layer.
//
// The node --test suite covers the conversion engine directly. Everything asserted here
// is the part it cannot reach: live conversion on input, textarea selection handling,
// undo/redo history, clipboard, downloads and dialogs.

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const md = '#md';
const out = '#out';

// --- live conversion ---

test('converts as you type while auto is on', async ({ page }) => {
  await page.fill(md, '**bold**');
  await expect(page.locator(out)).toHaveValue('𝐛𝐨𝐥𝐝');
});

test('updates the markdown character count', async ({ page }) => {
  await page.fill(md, 'hello');
  await expect(page.locator('#mdCount')).toContainText('5');
});

test('reports the output length against the post limit', async ({ page }) => {
  await page.fill(md, 'abc');
  await expect(page.locator('#status')).toContainText('Characters:');
  await expect(page.locator('#status')).toContainText('3000');
});

test('warns when the output exceeds the post limit', async ({ page }) => {
  await page.fill(md, 'a'.repeat(3100));
  await expect(page.locator('#status')).toContainText('Over limit by 100');
});

test('with auto off, typing does not convert until Convert is clicked', async ({ page }) => {
  await page.uncheck('#toggleAuto');
  await page.fill(md, '**bold**');
  await expect(page.locator(out)).toHaveValue('');

  await page.click('#btnConvert');
  await expect(page.locator(out)).toHaveValue('𝐛𝐨𝐥𝐝');
  await expect(page.locator('#status')).toContainText('Converted.');
});

// --- toolbar and selection ---

test('the bold button wraps the current selection', async ({ page }) => {
  await page.fill(md, 'wrap me');
  await page.$eval(md, (el) => el.setSelectionRange(0, 4));
  await page.click('#tbBold');
  await expect(page.locator(md)).toHaveValue('**wrap** me');
  await expect(page.locator(out)).toHaveValue('𝐰𝐫𝐚𝐩 me');
});

test('the bold button inserts a selected placeholder when nothing is selected', async ({ page }) => {
  await page.fill(md, '');
  await page.$eval(md, (el) => el.setSelectionRange(0, 0));
  await page.click('#tbBold');

  await expect(page.locator(md)).toHaveValue('**bold**');

  // The placeholder is left selected so it can be typed over immediately.
  const selection = await page.$eval(md, (el) => el.value.slice(el.selectionStart, el.selectionEnd));
  expect(selection).toBe('bold');
});

test('the italic button wraps the current selection', async ({ page }) => {
  await page.fill(md, 'wrap me');
  await page.$eval(md, (el) => el.setSelectionRange(0, 4));
  await page.click('#tbItalic');
  await expect(page.locator(md)).toHaveValue('*wrap* me');
});

test('the bullet style selector changes the rendered bullet', async ({ page }) => {
  await page.fill(md, '- item');
  await expect(page.locator(out)).toHaveValue('• item');

  const options = await page.$$eval('#bulletStyle option', (els) => els.map((e) => e.value));
  const alternative = options.find((value) => value !== '•');
  test.skip(!alternative, 'only one bullet style is offered');

  await page.selectOption('#bulletStyle', alternative);
  await expect(page.locator(out)).toHaveValue(`${alternative} item`);
});

// --- undo / redo history ---

test('undo and redo step through programmatic edits', async ({ page }) => {
  // Insert example and Clear both record history immediately, so this needs no timing.
  await page.click('#btnExample');
  await expect(page.locator(md)).toHaveValue(/Launching something new/);

  await page.click('#btnClear');
  await expect(page.locator(md)).toHaveValue('');

  await page.click('#tbUndo');
  await expect(page.locator(md)).toHaveValue(/Launching something new/);

  await page.click('#tbRedo');
  await expect(page.locator(md)).toHaveValue('');
});

test('undo steps through typed edits once the debounce has settled', async ({ page }) => {
  // Typing is coalesced into a history entry 350ms after the last keystroke.
  await page.click(md);
  await page.keyboard.type('first');
  await page.waitForTimeout(500);

  await page.keyboard.type(' second');
  await page.waitForTimeout(500);
  await expect(page.locator(md)).toHaveValue('first second');

  await page.click('#tbUndo');
  await expect(page.locator(md)).toHaveValue('first');

  await page.click('#tbRedo');
  await expect(page.locator(md)).toHaveValue('first second');
});

// --- clipboard, download, and their empty-state failure paths ---

test('copy puts the converted output on the clipboard', async ({ page }) => {
  await page.fill(md, '**bold**');
  await page.click('#btnCopy');

  await expect(page.locator('#status')).toContainText('Copied');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe('𝐛𝐨𝐥𝐝');
});

test('copy reports when there is nothing to copy', async ({ page }) => {
  await page.fill(md, '');
  await page.click('#btnCopy');
  await expect(page.locator('#status')).toContainText('Nothing to copy.');
});

test('download produces a .txt file containing the output', async ({ page }) => {
  await page.fill(md, '**bold**');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#btnDownload'),
  ]);

  expect(download.suggestedFilename()).toBe('linkedin-post.txt');

  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString('utf8')).toBe('𝐛𝐨𝐥𝐝');

  await expect(page.locator('#status')).toContainText('Downloaded.');
});

test('download reports when there is nothing to download', async ({ page }) => {
  await page.fill(md, '');
  await page.click('#btnDownload');
  await expect(page.locator('#status')).toContainText('Nothing to download.');
});

test('select all selects the whole output', async ({ page }) => {
  await page.fill(md, '**bold**');
  await page.click('#btnSelect');

  const selected = await page.$eval(out, (el) => el.value.slice(el.selectionStart, el.selectionEnd));
  expect(selected).toBe('𝐛𝐨𝐥𝐝');
  await expect(page.locator('#status')).toContainText('Selected output.');
});

// --- example and clear ---

test('insert example fills the editor and converts it', async ({ page }) => {
  await page.click('#btnExample');

  await expect(page.locator(md)).toHaveValue(/Launching something new/);
  await expect(page.locator(out)).not.toHaveValue('');
  await expect(page.locator('#status')).toContainText('Example inserted.');
});

test('clear empties both panes', async ({ page }) => {
  await page.click('#btnExample');
  await expect(page.locator(out)).not.toHaveValue('');

  await page.click('#btnClear');
  await expect(page.locator(md)).toHaveValue('');
  await expect(page.locator(out)).toHaveValue('');
  await expect(page.locator('#status')).toContainText('Cleared.');
});

// --- dialogs ---

test('the guide dialog opens and closes', async ({ page }) => {
  await expect(page.locator('#dlgGuide')).toBeHidden();

  await page.click('#btnGuide');
  await expect(page.locator('#dlgGuide')).toBeVisible();

  await page.click('#btnCloseGuide');
  await expect(page.locator('#dlgGuide')).toBeHidden();
});

test('the privacy dialog opens from the footer link', async ({ page }) => {
  await page.click('#lnkPrivacy');
  await expect(page.locator('#dlgPrivacy')).toBeVisible();
});

// --- page health ---

test('the page loads and converts without console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  await page.fill(md, '**bold** *italic* `code` ~~strike~~\n- item\n[t](https://e.com)');
  await expect(page.locator(out)).not.toHaveValue('');

  expect(errors).toEqual([]);
});
