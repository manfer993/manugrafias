// ManuGrafias AR - single configuration file (NFR-08).
// Every tunable value of the AR experience lives here; no code changes are needed to adjust them.

export const config = {
  // Where the photographer data comes from:
  //   'firebase' - Cloud Firestore + Cloud Storage for Firebase (production, NFR-02).
  //   'local'    - JSON files in data/photographers/<slug>.json with media inside this site
  //                (technical spike and offline development, same data contract).
  dataSource: 'firebase',

  // Public Firebase web configuration (NFR-05: no secret keys here, only the public web config).
  // Firebase console > Project settings > General > Your apps > Web app.
  firebase: {
    apiKey: 'AIzaSyB8tY6_12ZzPDWZc-i7FNlgOjSnYA21Y5E',
    projectId: 'manugrafias-2026',
    storageBucket: 'manugrafias-2026.firebasestorage.app', // only used when mediaBaseUrl is ''
  },

  // Where targets.mind and the videos are served from when dataSource is 'firebase'.
  //   'media/' - this site (GitHub Pages): files in the repository under media/<Firestore path>.
  //   ''       - Cloud Storage for Firebase (needs the Blaze plan).
  mediaBaseUrl: 'media/',

  // Folder (relative to the site root) used when dataSource is 'local'.
  localDataPath: 'data/photographers',

  // FR-06: time tracking can be lost before the video is hidden, paused and reset to 0:00.
  trackingLossToleranceMs: 400,

  // FR-09: time without a tracked artwork before the scanning hint appears.
  scanHintDelayMs: 30000,

  // ERR-06: time a detected artwork's video may keep loading before "Video unavailable" is shown.
  videoLoadTimeoutMs: 10000,

  // NFR-03: the loading indicator over the photograph must appear in under 1 s.
  videoLoadingIndicatorDelayMs: 300,

  // MindAR tracking parameters (tune during the field tests).
  mindar: {
    filterMinCF: 0.0001, // lower = less jitter, more delay
    filterBeta: 0.001, // higher = less delay, more jitter
    missTolerance: 5, // frames
    warmupTolerance: 5, // frames
  },

  // Development only: lets a desktop browser with a webcam run the experience (skips ERR-03).
  // MUST stay false in production.
  allowDesktop: false,

  // Third-party libraries, pinned to exact versions.
  libs: {
    aframe: 'https://aframe.io/releases/1.5.0/aframe.min.js',
    mindar: 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js',
    qrcode: 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  },
};
