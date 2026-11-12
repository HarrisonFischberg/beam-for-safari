// Regenerates Beam's icon PNGs from the SVG sources in design/icons/ (Night Projector, light and dark).
// The Mac app icon itself is Beam/Beam/Beam/AppIcon.icon (Icon Composer), built from design/icons/layers/.
// Needs Playwright with Chromium: `node scripts/make-icons.js` from the repo root.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const src = (n) => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join('design/icons', n)).toString('base64');
const jobs = [];
for (const [variant, file] of [['', 'app-light.svg'], ['-dark', 'app-dark.svg']]) {
  jobs.push([file, 128, `Beam/Beam/Beam/Resources/Icon${variant}.png`]);
}
for (const s of [16, 32, 48, 96, 128]) jobs.push(['app-light.svg', s, `extension/images/icon-${s}.png`]);
for (const v of ['light', 'dark']) for (const s of [16, 32, 64]) jobs.push([`toolbar-${v}.svg`, s, `extension/images/toolbar-${v}-${s}.png`]);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [file, px, out] of jobs) {
    await p.setViewportSize({ width: px, height: px });
    await p.setContent(`<html><body style="margin:0;background:transparent"><img src="${src(file)}" width="${px}" height="${px}" style="display:block"></body></html>`);
    await p.waitForFunction(() => document.images[0].complete);
    await p.screenshot({ path: out, omitBackground: true });
  }
  await b.close();
  console.log(`wrote ${jobs.length} files`);
})();
