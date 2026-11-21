// User-facing text of the AR experience. Texts quoted in the SRS are kept verbatim.

export const TEXT = {
  // FR-02
  instructions: 'Turn up the volume, disable silent mode and point your camera at the photograph.',
  scanArtwork: 'Scan Artwork',
  loading: 'Loading…',
  startingCamera: 'Starting camera…',
  visitWebsite: 'Visit Website',
  privacyPolicy: 'Privacy Policy',

  // FR-08
  mute: 'Mute',
  unmute: 'Unmute',

  // FR-09
  scanHint: 'Get closer to the photograph and make sure it is well lit.',

  // ERR-06 / NFR-03
  videoUnavailable: 'Video unavailable, please try again',
  videoLoading: 'Loading video…',

  // ERR-01
  cameraDeniedTitle: 'Camera access is needed',
  cameraDeniedBody:
    'ManuGrafias uses your camera to recognize the photograph. Nothing is recorded or sent anywhere.',
  tryAgain: 'Try again',

  // ERR-02
  inAppTitle: 'Open in Safari / Chrome',
  copyLink: 'Copy link',
  linkCopied: 'Link copied. Paste it in Safari or Chrome.',

  // ERR-03
  desktopTitle: 'Open this link on your phone',
  desktopBody: 'Scan this QR code with your phone camera.',
  unsupportedBody: 'This browser cannot use the camera for augmented reality. Open the link in Safari (iPhone) or Chrome (Android).',
  qrLabel: 'QR code of this page',

  // ERR-04
  notFoundTitle: 'Artwork collection not found',
  notFoundBody: 'Check the QR code or the link you received.',

  // ERR-10
  noArtworksTitle: 'No artworks available yet',

  // Data or library loading failure (no blank screens, section 2.4)
  loadFailedTitle: 'Something went wrong',
  loadFailedBody: 'We could not load the artworks. Check your connection and try again.',
};

export function inAppSteps(platform) {
  if (platform === 'ios') {
    return ['This app’s browser cannot open the camera.', 'Tap ••• or the share button and choose “Open in Safari”.'];
  }
  if (platform === 'android') {
    return ['This app’s browser cannot open the camera.', 'Tap ⋮ and choose “Open in Chrome”.'];
  }
  return ['This app’s browser cannot open the camera.', 'Open the link in Safari (iPhone) or Chrome (Android).'];
}

export function cameraDeniedSteps(platform) {
  if (platform === 'ios') {
    return [
      'To enable it: open Settings > Safari > Camera and choose Allow,',
      'or tap “aA” in the address bar > Website Settings > Camera > Allow.',
      'Then come back and tap Try again.',
    ];
  }
  return [
    'To enable it: tap the icon next to the address bar > Permissions > Camera > Allow.',
    'Then tap Try again.',
  ];
}
