// The two looks Beam ships: Signal Blue (default) and Night Violet. The choice is kept in extension storage under
// STORAGE_KEY and applied by adding the style's class to an element whose subtree uses the design tokens
// (the popup's <html>, the pill's wrapper inside its shadow tree). Signal Blue is the base tokens, so it has no class.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamTheme = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const STORAGE_KEY = 'beamStyle';
  const DEFAULT = 'signal';
  const STYLES = {
    signal: { label: 'Signal Blue', className: null },
    violet: { label: 'Night Violet', className: 'beam-violet' },
  };

  // Anything unknown, missing or tampered with falls back to the default.
  function normalize(value) {
    return Object.prototype.hasOwnProperty.call(STYLES, value) ? value : DEFAULT;
  }

  // Sets exactly one style class on el (removes the others).
  function apply(el, value) {
    const id = normalize(value);
    for (const s of Object.values(STYLES)) if (s.className) el.classList.remove(s.className);
    if (STYLES[id].className) el.classList.add(STYLES[id].className);
    return id;
  }

  return { STORAGE_KEY, DEFAULT, STYLES, normalize, apply };
});
