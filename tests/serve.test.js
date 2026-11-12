const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let root, server, base;
test.before(async () => {
  const { createServer } = await import('../fixtures/serve.mjs');
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-fixtures-'));
  fs.writeFileSync(path.join(root, 'a.mp4'), '0123456789');
  fs.writeFileSync(path.join(root, 'x.m3u8'), '#EXTM3U');
  fs.writeFileSync(path.join(path.dirname(root), 'secret.txt'), 'outside root');
  server = createServer(root);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { server.close(); fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(path.join(path.dirname(root), 'secret.txt'), { force: true }); });

test('parseRange handles open, suffix, clamped and bad ranges', async () => {
  const { parseRange } = await import('../fixtures/serve.mjs');
  assert.deepEqual(parseRange('bytes=0-3', 10), { start: 0, end: 3 });
  assert.deepEqual(parseRange('bytes=4-', 10), { start: 4, end: 9 });
  assert.deepEqual(parseRange('bytes=-3', 10), { start: 7, end: 9 });
  assert.deepEqual(parseRange('bytes=5-99', 10), { start: 5, end: 9 });
  for (const bad of ['bytes=10-12', 'bytes=-0', 'bytes=-', 'bytes=3-1', 'items=0-1', '', undefined]) assert.equal(parseRange(bad, 10), null, String(bad));
});

test('full file: 200 with Accept-Ranges and the right type', async () => {
  const r = await fetch(`${base}/a.mp4`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('accept-ranges'), 'bytes');
  assert.equal(r.headers.get('content-type'), 'video/mp4');
  assert.equal(await r.text(), '0123456789');
});

test('byte range: 206 with Content-Range and only those bytes', async () => {
  const r = await fetch(`${base}/a.mp4`, { headers: { Range: 'bytes=2-5' } });
  assert.equal(r.status, 206);
  assert.equal(r.headers.get('content-range'), 'bytes 2-5/10');
  assert.equal(await r.text(), '2345');
});

test('unsatisfiable range: 416', async () => {
  const r = await fetch(`${base}/a.mp4`, { headers: { Range: 'bytes=50-60' } });
  assert.equal(r.status, 416);
  assert.equal(r.headers.get('content-range'), 'bytes */10');
});

test('HLS playlist gets the Apple MIME type', async () => {
  assert.equal((await fetch(`${base}/x.m3u8`)).headers.get('content-type'), 'application/vnd.apple.mpegurl');
});

test('a malformed path gets 400 and the server keeps running', async () => {
  assert.equal((await fetch(`${base}/%`)).status, 400);
  assert.equal((await fetch(`${base}/a.mp4`)).status, 200);
});

test('missing file 404; path traversal never reaches files outside the root', async () => {
  assert.equal((await fetch(`${base}/nope.mp4`)).status, 404);
  const http = require('node:http');
  const status = await new Promise((resolve) => {
    http.get({ host: '127.0.0.1', port: server.address().port, path: '/..%2fsecret.txt' }, (res) => { res.resume(); resolve(res.statusCode); });
  });
  assert.ok(status === 403 || status === 404, `traversal returned ${status}`);
  const raw = await new Promise((resolve) => {
    http.get({ host: '127.0.0.1', port: server.address().port, path: '/../secret.txt' }, (res) => { let b = ''; res.on('data', (d) => (b += d)); res.on('end', () => resolve(b)); });
  });
  assert.notEqual(raw, 'outside root');
});
