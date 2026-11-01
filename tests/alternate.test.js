const test = require('node:test');
const assert = require('node:assert/strict');
const { pickPlaylist, remember, sourcePlaylist, isPlaylistUrl, RESET_SLACK_MS } = require('../extension/lib/alternate.js');

test('isPlaylistUrl: http(s) .m3u8 only, query and fragment allowed', () => {
  assert.equal(isPlaylistUrl('https://cdn.example.org/v/master.m3u8'), true);
  assert.equal(isPlaylistUrl('https://cdn.example.org/v/master.m3u8?token=abc'), true);
  assert.equal(isPlaylistUrl('http://x/a.M3U8#t=1'), true);
  assert.equal(isPlaylistUrl('https://x/seg001.ts'), false);
  assert.equal(isPlaylistUrl('https://x/manifest.mpd'), false);
  assert.equal(isPlaylistUrl('blob:https://x/123'), false);
  assert.equal(isPlaylistUrl('https://x/a.m3u8.js'), false);
  assert.equal(isPlaylistUrl(undefined), false);
});

test('pickPlaylist: the earliest playlist wins (master before variants, live refetches ignored)', () => {
  const entries = [
    { url: 'https://x/720p.m3u8', t: 1200 },
    { url: 'https://x/master.m3u8', t: 1000 },
    { url: 'https://x/seg1.ts', t: 900 },
    { url: 'https://x/1080p.m3u8', t: 1300 },
  ];
  assert.equal(pickPlaylist(entries), 'https://x/master.m3u8');
});

test('pickPlaylist: none seen is null (plain MediaSource keeps its explanation)', () => {
  assert.equal(pickPlaylist([]), null);
  assert.equal(pickPlaylist([{ url: 'https://x/seg1.m4s', t: 1 }]), null);
  assert.equal(pickPlaylist(undefined), null);
});

test('pickPlaylist: after the page swaps sources, older playlists are stale unless fetched just before', () => {
  const entries = [{ url: 'https://x/old.m3u8', t: 1000 }, { url: 'https://x/new.m3u8', t: 50000 }];
  assert.equal(pickPlaylist(entries, 49000), 'https://x/new.m3u8');
  assert.equal(pickPlaylist([{ url: 'https://x/old.m3u8', t: 1000 }], 60000), null);
  // A player that fetched the manifest a moment before attaching its new MediaSource still counts.
  assert.equal(pickPlaylist([{ url: 'https://x/new.m3u8', t: 60000 - RESET_SLACK_MS + 1 }], 60000), 'https://x/new.m3u8');
});

test('remember: keeps first fetch per URL, ignores non-playlists, caps the list', () => {
  let e = [];
  e = remember(e, 'https://x/a.m3u8', 1);
  e = remember(e, 'https://x/a.m3u8', 2);
  e = remember(e, 'https://x/seg.ts', 3);
  assert.deepEqual(e, [{ url: 'https://x/a.m3u8', t: 1 }]);
  for (let i = 0; i < 80; i++) e = remember(e, `https://x/${i}.m3u8`, 10 + i);
  assert.equal(e.length, 50);
  assert.equal(e[e.length - 1].url, 'https://x/79.m3u8');
});

test('sourcePlaylist: an HLS <source> by extension or by type, never a blob', () => {
  assert.equal(sourcePlaylist([{ src: 'blob:https://x/1', type: 'video/mp4' }, { src: 'https://x/a.m3u8', type: '' }]), 'https://x/a.m3u8');
  assert.equal(sourcePlaylist([{ src: 'https://x/live', type: 'application/vnd.apple.mpegurl' }]), 'https://x/live');
  assert.equal(sourcePlaylist([{ src: 'https://x/live', type: 'application/x-mpegURL' }]), 'https://x/live');
  assert.equal(sourcePlaylist([{ src: 'blob:https://x/1', type: 'application/vnd.apple.mpegurl' }]), null);
  assert.equal(sourcePlaylist([{ src: 'https://x/a.mp4', type: 'video/mp4' }]), null);
  assert.equal(sourcePlaylist([]), null);
});
