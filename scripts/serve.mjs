/**
 * Serves the exported site with no dependencies, so the demo can be opened from
 * a laptop or a USB stick without installing anything.
 *   node scripts/serve.mjs [port]
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The same file works in two places: inside the repo it serves `../out`, and in
 * the delivered package, where it sits beside the exported site, it serves
 * `./site`. So the package never carries a second, divergent copy.
 */
const here = dirname(fileURLToPath(import.meta.url));
const CANDIDATES = [join(here, '..', 'out'), join(here, 'site'), join(here, 'out')];
const ROOT = CANDIDATES.find((p) => existsSync(p)) ?? CANDIDATES[0];
const PORT = Number(process.argv[2] ?? 3100);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.md': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(ROOT)) {
  console.error('No site found next to this script, and no build in ../out. Run:  npm run build');
  process.exit(1);
}

const resolve = (urlPath) => {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, clean);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  return file.startsWith(ROOT) ? file : null;
};

const server = createServer((req, res) => {
  const file = resolve(req.url ?? '/');
  if (!file || !existsSync(file)) {
    const notFound = join(ROOT, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    if (existsSync(notFound)) return createReadStream(notFound).pipe(res);
    return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
  createReadStream(file).pipe(res);
});

// If something else already holds the port (an old server left running), step
// to the next one rather than dying with a stack trace.
const listen = (port, attempt = 0) => {
  const onError = (err) => {
    server.removeListener('listening', onListening);
    if (err.code === 'EADDRINUSE' && attempt < 10) {
      console.log(`  port ${port} is busy, trying ${port + 1}...`);
      listen(port + 1, attempt + 1);
    } else {
      console.error(`  Could not start: ${err.message}`);
      process.exit(1);
    }
  };
  const onListening = () => {
    server.removeListener('error', onError);
    console.log(`
  Taameem demo running
  ->  http://localhost:${port}

  Press Ctrl+C to stop.
`);
  };
  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port);
};
listen(PORT);
