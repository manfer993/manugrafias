// Environment detection: in-app browsers (ERR-02), desktop and unsupported devices (ERR-03).

const IN_APP_PATTERNS = [
  /FBAN|FBAV|FB_IAB|FBIOS/i, // Facebook, Messenger
  /Instagram/i,
  /WhatsApp/i,
  /\bLine\//i,
  /Twitter|TwitterAndroid/i,
  /Snapchat/i,
  /TikTok|musical_ly|BytedanceWebview/i,
  /LinkedInApp/i,
  /Pinterest/i,
  /; wv\)/i, // generic Android WebView
];

export function isInAppBrowser(ua) {
  return IN_APP_PATTERNS.some((pattern) => pattern.test(ua));
}

export function platformOf(ua, maxTouchPoints = 0) {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  // iPadOS 13+ reports itself as a Mac with touch support.
  if (/Macintosh/i.test(ua) && maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function hasCameraApi() {
  return !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Returns the first blocking condition, or null when the device can run the experience.
export function checkEnvironment({ ua, maxTouchPoints, allowDesktop, webgl, camera }) {
  const platform = platformOf(ua, maxTouchPoints);
  if (isInAppBrowser(ua)) return { block: 'in-app', platform };
  if (platform === 'desktop' && !allowDesktop) return { block: 'desktop', platform };
  if (!webgl || !camera) return { block: 'unsupported', platform };
  return { block: null, platform };
}
