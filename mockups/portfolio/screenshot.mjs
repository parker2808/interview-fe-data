import { chromium } from 'playwright-core';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const out = process.argv[2] || '/opt/cursor/artifacts';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

await mkdir(out, { recursive: true });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const file = join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

await new Promise((r) => server.listen(4177, '127.0.0.1', r));

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const base = 'http://127.0.0.1:4177';

function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('not a webp buffer');
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
      height: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
    };
  }
  if (chunk === 'VP8 ') {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  throw new Error(`unknown webp chunk ${chunk}`);
}

async function shot({ name, path, width = 1440, height = 900, dark = false, checkOverflow = false }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/${path}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => document.documentElement.classList.add('capture'));
  if (dark) await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  if (checkOverflow) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('overflow', name, overflow);
  }
  const dest = join(out, name);
  await page.screenshot({ path: dest, fullPage: true, type: 'webp', quality: 80 });
  const size = webpSize(await readFile(dest));
  await page.close();
  console.log('wrote', name, `${size.width}x${size.height}`);
}

await shot({ name: '01-home-light.webp', path: 'home.html' });
await shot({ name: '02-home-dark.webp', path: 'home.html?dark=1', dark: true });
await shot({ name: '03-case-study-light.webp', path: 'case-study.html' });
await shot({ name: '03b-case-study-dark.webp', path: 'case-study.html?dark=1', dark: true });
await shot({ name: '04-blog-post-light.webp', path: 'post.html' });
await shot({ name: '04b-blog-list-light.webp', path: 'notes.html' });
await shot({ name: '05-home-mobile-light.webp', path: 'home.html', width: 390, height: 844, checkOverflow: true });
await shot({ name: '06-admin-dashboard.webp', path: 'admin-dashboard.html' });
await shot({ name: '07-admin-projects-table.webp', path: 'admin-table.html' });
await shot({ name: '08-admin-project-editor.webp', path: 'admin-editor.html' });
await shot({ name: '09-home-skeletons.webp', path: 'home-skeleton.html' });
await shot({ name: '10-about-light.webp', path: 'about.html' });
await shot({ name: '11-projects-light.webp', path: 'projects.html' });
await shot({ name: '12-contact-light.webp', path: 'contact.html' });

await browser.close();
server.close();
