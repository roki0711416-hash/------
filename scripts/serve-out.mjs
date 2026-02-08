import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const hit = args.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
};

const host = getArg('host', process.env.HOST ?? '0.0.0.0');
const port = Number(getArg('port', process.env.PORT ?? '3001'));
const outDir = resolve(getArg('dir', process.env.OUT_DIR ?? 'out'));

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const safeJoin = (base, target) => {
  const targetPath = normalize(target).replace(/^([/\\])+/, '');
  const resolved = resolve(join(base, targetPath));
  if (!resolved.startsWith(base)) return null;
  return resolved;
};

const tryFiles = (pathname) => {
  const direct = safeJoin(outDir, pathname);
  if (!direct) return null;

  if (existsSync(direct) && statSync(direct).isFile()) return direct;

  if (existsSync(direct) && statSync(direct).isDirectory()) {
    const index = join(direct, 'index.html');
    if (existsSync(index) && statSync(index).isFile()) return index;
  }

  const withHtml = `${direct}.html`;
  if (existsSync(withHtml) && statSync(withHtml).isFile()) return withHtml;

  const asDirIndex = join(direct, 'index.html');
  if (existsSync(asDirIndex) && statSync(asDirIndex).isFile()) return asDirIndex;

  return null;
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);

    const filePath = tryFiles(pathname);
    if (!filePath) {
      res.statusCode = 404;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('Not Found');
      return;
    }

    const ext = extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('content-type', mimeByExt[ext] ?? 'application/octet-stream');
    createReadStream(filePath).pipe(res);
  } catch {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`[serve-out] Serving ${outDir}`);
  // eslint-disable-next-line no-console
  console.log(`[serve-out] http://${host}:${port}`);
});
