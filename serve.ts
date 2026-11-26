// serve.ts — server statis lokal untuk menguji app/ di peramban.
// Menjalankan:  node serve.ts            (http://localhost:8080)
//              node serve.ts --port 8090
// Hanya menyajikan berkas di bawah app/; tidak ada jaringan keluar.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'app');
const port = Number((process.argv.find((a) => a.startsWith('--port=')) || '').slice(7)) ||
  Number(process.argv[process.argv.indexOf('--port') + 1]) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = normalize(urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));
  const file = join(root, rel);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 — berkas tidak ada\n');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(port, () => {
  console.log('NusaStat tersaji di http://localhost:' + port + '/');
});
