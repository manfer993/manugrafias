// English (default language). Texts quoted in the SRS are kept verbatim.

export default {
  // Loading
  loadingLabel: 'Loading',
  loading: 'Loading…',
  jsRequired: 'JavaScript is required.',

  // FR-02
  intro: 'Watch each photo come to life with video and sound: tap Scan Artwork and point your camera at the print.',
  tipsTitle: 'Keep these tips in mind before scanning',
  tipVolumeTitle: 'Turn up the volume',
  tipVolumeBody: 'Disable silent mode.',
  tipLightTitle: 'Find good light',
  tipLightBody: 'Make sure you are in a well-lit place.',
  tipAimTitle: 'Fit the whole photo in the frame',
  tipAimBody: 'Get close enough so that all of it is visible.',
  scanArtwork: 'Scan Artwork',
  startingCamera: 'Starting camera…',
  privacyPolicy: 'Privacy Policy',

  // FR-07: photographer links (icon only, the label is read by screen readers)
  linkInstagram: 'Instagram (opens in a new tab)',
  linkBehance: 'Behance (opens in a new tab)',
  linkPortfolio: 'Portfolio (opens in a new tab)',
  photographerLinks: 'Photographer links',
  connectTitle: 'Connect with me',

  // Camera screen
  searching: 'Searching for artwork…',
  centerHelp: 'Move closer to the photo and fit it inside the frame.',
  mute: 'Mute',
  unmute: 'Unmute',

  // FR-08

  // FR-09
  scanHint: 'Still nothing? Get a little closer and look for good light.',

  // ERR-06 / NFR-03
  videoUnavailable: 'Video unavailable, please try again',
  videoLoading: 'Loading video…',

  // ERR-01
  cameraDeniedTitle: 'Camera access is needed',
  cameraDeniedBody:
    'ManuGrafias uses your camera to recognize the photograph. Nothing is recorded or sent anywhere.',
  cameraDeniedSteps: {
    ios: [
      'To enable it: open Settings > Safari > Camera and choose Allow,',
      'or tap “aA” in the address bar > Website Settings > Camera > Allow.',
      'Then come back and tap Try again.',
    ],
    android: [
      'To enable it: tap the icon next to the address bar > Permissions > Camera > Allow.',
      'Then tap Try again.',
    ],
  },
  tryAgain: 'Try again',

  // ERR-02
  inAppTitle: 'Open in Safari / Chrome',
  inAppSteps: {
    ios: ['This app’s browser cannot open the camera.', 'Tap ••• or the share button and choose “Open in Safari”.'],
    android: ['This app’s browser cannot open the camera.', 'Tap ⋮ and choose “Open in Chrome”.'],
    other: ['This app’s browser cannot open the camera.', 'Open the link in Safari (iPhone) or Chrome (Android).'],
  },
  copyLink: 'Copy link',
  linkCopied: 'Link copied. Paste it in Safari or Chrome.',

  // ERR-03
  desktopTitle: 'Open this link on your phone',
  desktopBody: 'Scan this QR code with your phone camera.',
  unsupportedBody:
    'This browser cannot use the camera for augmented reality. Open the link in Safari (iPhone) or Chrome (Android).',
  qrLabel: 'QR code of this page',

  // ERR-04
  notFoundTitle: 'Artwork collection not found',
  notFoundBody: 'Check the QR code or the link you received.',

  // ERR-10
  noArtworksTitle: 'No artworks available yet',
  noArtworksBody: 'Their artworks will be available here soon. Check back later!',

  // Data or library loading failure (no blank screens, section 2.4)
  loadFailedTitle: 'Something went wrong',
  loadFailedBody: 'We could not load the artworks. Check your connection and try again.',

  // NFR-06: Privacy Policy (SRS Appendix A)
  privacy: {
    pageTitle: 'Privacy Policy - ManuGrafias',
    title: 'Privacy Policy - ManuGrafias AR',
    intro: "ManuGrafias AR lets you see videos over printed photographs using your phone's camera.",
    sections: [
      {
        heading: 'Camera',
        body: 'The camera is used only to recognize the photograph in front of you. The images are processed on your device and are never recorded, stored or sent to any server.',
      },
      {
        heading: 'Personal data',
        body: 'We do not ask for, collect or store any personal data. You do not need an account.',
      },
      {
        heading: 'Cookies and tracking',
        body: 'This site does not use cookies, analytics or any tracking tools.',
      },
      {
        heading: 'Hosting',
        body: 'Our service providers (GitHub, Google Firebase and Supabase, which host the site, the data and the videos, and Google Fonts, which serves the fonts) may log technical data such as IP addresses for security purposes. We do not use this data to identify you.',
      },
      {
        heading: 'External links',
        body: 'The Instagram, Behance and Portfolio buttons open the photographer\'s pages, which have their own privacy policies.',
      },
    ],
    contactHeading: 'Contact',
    contactBody: 'For any question, contact',
  },
};
