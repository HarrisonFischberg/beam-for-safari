const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveTarget } = require('../extension/lib/resolve.js');

const vid = (id, o = {}) => ({ id, currentSrc: `https://example.org/${id}.mp4`, playing: false, visible: true, rect: { width: 640, height: 360 }, ...o });

test('rule 1: srcUrl from the menu picks the matching video', () => {
  const videos = [vid('a'), vid('b'), vid('c')];
  assert.equal(resolveTarget({ videos, srcUrl: 'https://example.org/b.mp4', hitIds: ['c'] }), 'b');
});

test('rule 1: videos sharing one source prefer the one under the pointer', () => {
  const same = 'https://example.org/same.mp4';
  const videos = [vid('a', { currentSrc: same }), vid('b', { currentSrc: same })];
  assert.equal(resolveTarget({ videos, srcUrl: same, hitIds: ['b'] }), 'b');
  assert.equal(resolveTarget({ videos, srcUrl: same, hitIds: [] }), 'a');
});

test('rule 1: an srcUrl that matches nothing falls through to the pointer', () => {
  const videos = [vid('a'), vid('b')];
  assert.equal(resolveTarget({ videos, srcUrl: 'blob:nothing', hitIds: ['b'] }), 'b');
});

test('rule 2: the video under the pointer beats a playing or larger one', () => {
  const videos = [vid('big', { rect: { width: 1280, height: 720 }, playing: true }), vid('small', { rect: { width: 200, height: 100 } })];
  assert.equal(resolveTarget({ videos, hitIds: ['small'] }), 'small');
});

test('rule 2: topmost hit wins and ids that are not videos are ignored', () => {
  const videos = [vid('a'), vid('b')];
  assert.equal(resolveTarget({ videos, hitIds: ['not-a-video', 'b', 'a'] }), 'b');
});

test('rule 3: the only visible video wins without a pointer hit', () => {
  assert.equal(resolveTarget({ videos: [vid('a'), vid('hidden', { visible: false })] }), 'a');
});

test('rule 3: a watched (started, unmuted) video beats a muted autoplay preview', () => {
  const main = vid('main', { currentTime: 42, muted: false, rect: { width: 1280, height: 720 } });
  const preview = vid('preview', { playing: true, currentTime: 3, muted: true, rect: { width: 300, height: 170 } });
  assert.equal(resolveTarget({ videos: [main, preview] }), 'main');
  assert.equal(resolveTarget({ videos: [preview, main] }), 'main');
});

test('rule 3: two watched videos narrow to the playing one, else no video', () => {
  const a = vid('a', { currentTime: 5, playing: true }), b = vid('b', { currentTime: 9 });
  assert.equal(resolveTarget({ videos: [a, b] }), 'a');
  assert.equal(resolveTarget({ videos: [{ ...a, playing: false }, b] }), null);
});

test('rule 3: several visible videos and none watched is ambiguous: null', () => {
  const videos = [vid('a', { playing: true, muted: true }), vid('b', { rect: { width: 1000, height: 600 } })];
  assert.equal(resolveTarget({ videos }), null);
});

test('rule 3: a hidden video does not count', () => {
  const videos = [vid('hidden', { playing: true, currentTime: 9, visible: false }), vid('shown', { rect: { width: 400, height: 225 } })];
  assert.equal(resolveTarget({ videos }), 'shown');
});

test('rule 4: no videos, none visible, or zero area gives null', () => {
  assert.equal(resolveTarget({ videos: [] }), null);
  assert.equal(resolveTarget({ videos: undefined }), null);
  assert.equal(resolveTarget({ videos: [vid('a', { visible: false })] }), null);
  assert.equal(resolveTarget({ videos: [vid('a', { rect: { width: 0, height: 0 } })] }), null);
});

test('ids may be falsy (0) and still resolve', () => {
  const videos = [vid(0), vid(1)];
  assert.equal(resolveTarget({ videos, srcUrl: 'https://example.org/0.mp4' }), 0);
  assert.equal(resolveTarget({ videos, hitIds: [0] }), 0);
});

const { videoUnderPoint } = require('../extension/lib/resolve.js');

test('videoUnderPoint: a video under an overlay counts (BitChute play button over the video)', () => {
  assert.equal(videoUnderPoint([{ localName: 'button' }, { localName: 'video' }, { localName: 'div' }]), true);
  assert.equal(videoUnderPoint([{ tagName: 'VIDEO' }]), true);
});

test('videoUnderPoint: no video under the point leaves the page alone', () => {
  assert.equal(videoUnderPoint([{ localName: 'div' }, { localName: 'body' }, { localName: 'html' }]), false);
  assert.equal(videoUnderPoint([]), false);
  assert.equal(videoUnderPoint(null), false);
});
