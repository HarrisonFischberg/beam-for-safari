// Static server for the T002 spike fixtures. Safari needs byte ranges to play MP4, and the Apple TV fetches
// the media itself over the LAN, so this binds 0.0.0.0 and supports Range. Synthetic files only; stop it when done.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mp4': 'video/mp4', '.m3u8': 'application/vnd.apple.mpegurl', '.ts': 'video/mp2t', '.css': 'text/css' };

// "bytes=a-b", "bytes=a-", "bytes=-n" -> {start,end} inclusive, or null when unsatisfiable or malformed.
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start, end;
  if (m[1] === '') { const n = Number(m[2]); if (n === 0) return null; start = Math.max(0, size - n); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  return start <= end && start < size ? { start, end } : null;
}

export function createServer(root) {
  const base = path.resolve(root);
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400).end('bad request'); return; } // a stray "%" must not crash the server
    const file = path.resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (file !== base && !file.startsWith(base + path.sep)) { res.writeHead(403).end('forbidden'); return; }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }
      const headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
      if (req.headers.range) {
        const r = parseRange(req.headers.range, st.size);
        if (!r) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }).end(); return; }
        res.writeHead(206, { ...headers, 'Content-Range': `bytes ${r.start}-${r.end}/${st.size}`, 'Content-Length': r.end - r.start + 1 });
        fs.createReadStream(file, r).pipe(res);
      } else {
        res.writeHead(200, { ...headers, 'Content-Length': st.size });
        fs.createReadStream(file).pipe(res);
      }
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const ports = [4201, 4202]; // two origins, so the iframe fixture is cross-origin
  const lan = Object.values(os.networkInterfaces()).flat().find((i) => i && i.family === 'IPv4' && !i.internal);
  for (const p of ports) createServer(root).listen(p, '0.0.0.0');
  console.log(`Open on the Mac (use the LAN address, the Apple TV cannot reach 127.0.0.1):\n  http://${lan ? lan.address : '<your-LAN-ip>'}:${ports[0]}/\nCtrl+C to stop.`);
}
