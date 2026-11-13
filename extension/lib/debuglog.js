// Builds the "Copy debug logs" report and the email that carries it to support. Pure: the popup passes in what
// the background and page scripts saved (codes, counts and timestamps only, never page addresses) plus the
// version, browser and style. Nothing is sent by Beam itself: the user's mail app opens with the report filled in.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamDebugLog = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const SUPPORT_EMAIL = 'support@rarecreatures.app';
  const KEYS = ['bgLast', 'bgAt', 'bgErr', 'bgReply', 'contentLast', 'contentAt', 'msgAt', 'avail'];

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
      `A message last reached a page ${ago(s.msgAt, now)}`,
      `AirPlay devices reported by Safari: ${s.avail || 'no event received'}`,
      `Page script result: ${s.contentLast || 'none yet'}, ${ago(s.contentAt, now)}`,
    ].join('\n');
  }

  // problem: what the user typed under "What went wrong?"; it leads the email and the clipboard copy.
  function body(text, problem = '') {
    return `${problem.trim()}\n\n${text}\n`;
  }

  function mailto(text, version, problem = '') {
    const subject = `Beam ${version} debug logs`;
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body(text, problem))}`;
  }

  return { SUPPORT_EMAIL, KEYS, report, body, mailto };
});
