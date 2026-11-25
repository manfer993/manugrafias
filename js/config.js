// ManuGrafias AR - single configuration file (NFR-08).
// Every tunable value of the AR experience lives here; no code changes are needed to adjust them.

export const config = {
  // Photographer data: Cloud Firestore, document photographers/<slug> (written by the content panel).
  // Public Firebase web configuration (NFR-05: no secret keys here, only the public web config).
  // Firebase console > Project settings > General > Your apps > Web app.
  firebase: {
    apiKey: 'AIzaSyB8tY6_12ZzPDWZc-i7FNlgOjSnYA21Y5E',
    projectId: 'manugrafias-2026',
    storageBucket: 'manugrafias-2026.firebasestorage.app', // only used when mediaBaseUrl is ''
  },

  // Base for media paths that are not absolute URLs. The content panel stores absolute Supabase Storage URLs,
  // so this only applies to relative paths: '' = Cloud Storage for Firebase (needs the Blaze plan).
  mediaBaseUrl: 'https://hdajccuxsqteijcodyxg.supabase.co/storage/v1/object/public/media/',

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
