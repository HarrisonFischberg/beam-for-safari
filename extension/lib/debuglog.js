// Builds the "Copy debug logs" report and the email that carries it to support. Pure: the popup passes in what
// the background and page scripts saved (codes, counts and timestamps only, never page addresses) plus the
// version, browser and style. Nothing is sent by Beam itself: the user's mail app opens with the report filled in.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamDebugLog = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const SUPPORT_EMAIL = 'support@rarecreatures.app';
  const KEYS = ['bgLast', 'bgAt', 'bgErr', 'bgReply', 'contentLast', 'contentAt', 'loads', 'loadAt', 'msgAt', 'avail'];

  function ago(t, now) {
    return t ? `${Math.round((now - t) / 1000)}s ago` : 'never';
  }

  // s: the saved diagnostic fields; info: { version, userAgent, style, now }
  function report(s, info) {
    const now = info.now;
    return [
      'Beam debug log',
      `Beam version: ${info.version}`,
      `Browser: ${info.userAgent}`,
      `Style: ${info.style}`,
      `Written: ${new Date(now).toISOString()}`,
      '',
      `Background saw: ${s.bgLast || 'nothing yet'}, ${ago(s.bgAt, now)}`,
      `Background reply: ${s.bgErr ? 'ERROR ' + s.bgErr : s.bgReply || 'none'}`,
      `Page script loaded on ${s.loads || 0} page(s), last ${ago(s.loadAt, now)}`,
      `A message last reached a page ${ago(s.msgAt, now)}`,
      `AirPlay devices reported by Safari: ${s.avail || 'no event received'}`,
      `Page script result: ${s.contentLast || 'none yet'}, ${ago(s.contentAt, now)}`,
    ].join('\n');
  }

  function mailto(text, version) {
    const subject = `Beam ${version} debug logs`;
    const body = `What happened (optional):\n\n\n${text}\n`;
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return { SUPPORT_EMAIL, KEYS, report, mailto };
});
