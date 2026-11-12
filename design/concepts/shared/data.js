// Synthetic mock data shared by all three concept previews. Titles are invented samples.
export const VIDEOS = [
  { id: 'v1', title: 'Sample: Harbour at dawn', site: 'example.org', duration: '12:04', playing: true },
  { id: 'v2', title: 'Sample: Ten-minute bread', site: 'example.net', duration: '10:31', playing: false },
  { id: 'v3', title: 'Sample: Trail cam, night 4', site: 'example.com', duration: '3:47', playing: false },
];

// Popup states from replica/architecture.md. `reason` strings are the user-facing copy.
export const POPUP_STATES = {
  idle: { label: 'Ready', headline: 'Ready to beam', detail: 'Pick a video, then choose your Apple TV.', videos: VIDEOS },
  onTV: { label: 'On TV', headline: 'Playing on Apple TV', detail: 'Press Stop to bring it back to this Mac.', videos: VIDEOS, onTV: 'v1' },
  noVideo: { label: 'No video', headline: 'No video found', detail: 'Open a page with a video, then try again.', videos: [] },
  siteOff: { label: 'Site off', headline: 'This site turned AirPlay off', detail: 'You can still try. It may not work on this video.', videos: [VIDEOS[0]], blocked: 'v1' },
  noTarget: { label: 'No Apple TV', headline: 'No Apple TV found', detail: 'Check that it is on and on the same Wi-Fi network.', videos: VIDEOS },
};

export const PILL_STATES = {
  picking: 'Choose your Apple TV…',
  onTV: 'Playing on Apple TV',
  notReady: 'The video has not loaded yet. Press play, then Beam again.',
  siteOff: 'This site turned AirPlay off for this video.',
  protected: 'This video is protected, so it can only play here.',
};

export const HOST_STATES = {
  off: { headline: 'Beam is off in Safari', detail: 'Turn it on in Safari Settings, then allow it on websites.', action: 'Open Safari Settings…' },
  on: { headline: 'Beam is on', detail: 'Right-click any video and choose Beam to Apple TV.', action: 'Open Safari Settings…' },
};
export const HOST_STEPS = ['Open Safari Settings…', 'Turn on Beam under Extensions', 'Allow it on websites'];
