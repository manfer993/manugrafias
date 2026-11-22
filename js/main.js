import { config } from './config.js';
import { loadPhotographer, readSlug, NotFoundError } from './data.js';
import { checkEnvironment, hasCameraApi, hasWebGL } from './env.js';
import { createPlayer, createScene, loadArLibraries, loadScript, preloadTargets } from './ar.js';
import { PlaybackController } from './playback.js';
import { setupLanguage } from './i18n/index.js';

// Texts come from the dictionary of the detected language (default English).
const { language: LANGUAGE, strings: TEXT } = setupLanguage();

const $ = (id) => document.getElementById(id);

const screens = ['screen-loading', 'screen-welcome', 'screen-message', 'camera-ui'];
function show(id) {
  for (const s of screens) $(s).hidden = s !== id;
}

// ---- Message screens (every error shows the logo and plain language, section 2.4) ----

function showMessage({ title, body = '', subtitle = '', actions = [], extra = null }) {
  $('message-title').textContent = title;
  $('message-subtitle').textContent = subtitle;
  $('message-subtitle').hidden = !subtitle;
  const bodyEl = $('message-body');
  bodyEl.replaceChildren();
  for (const line of [].concat(body).filter(Boolean)) {
    const p = document.createElement('p');
    p.textContent = line;
    bodyEl.appendChild(p);
  }
  const extraEl = $('message-extra');
  extraEl.replaceChildren();
  if (extra) extraEl.appendChild(extra);
  const actionsEl = $('message-actions');
  actionsEl.replaceChildren(...actions);
  show('screen-message');
}

function button(label, onClick, variant = 'primary') {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `btn btn-${variant}`;
  el.textContent = label;
  el.addEventListener('click', onClick);
  return el;
}

function websiteLink(url) {
  const a = document.createElement('a');
  a.className = 'btn btn-secondary';
  a.href = url;
  a.target = '_blank'; // FR-07: new tab, the AR tab stays open
  a.rel = 'noopener noreferrer';
  a.textContent = TEXT.visitWebsite;
  return a;
}

const reload = () => location.reload();

function showLoadFailure() {
  showMessage({ title: TEXT.loadFailedTitle, body: TEXT.loadFailedBody, actions: [button(TEXT.tryAgain, reload)] });
}

// ---- ERR-02 / ERR-03 ----

function showInApp(platform) {
  const feedback = document.createElement('p');
  feedback.className = 'feedback';
  feedback.setAttribute('role', 'status');
  const copy = button(TEXT.copyLink, async () => {
    try {
      await navigator.clipboard.writeText(location.href);
    } catch {
      const input = document.createElement('input');
      input.value = location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    feedback.textContent = TEXT.linkCopied;
  });
  showMessage({ title: TEXT.inAppTitle, body: TEXT.inAppSteps[platform] || TEXT.inAppSteps.other, actions: [copy], extra: feedback });
}

async function showDesktop() {
  const qrHost = document.createElement('div');
  qrHost.className = 'qr';
  showMessage({ title: TEXT.desktopTitle, body: TEXT.desktopBody, extra: qrHost });
  try {
    await loadScript(config.libs.qrcode);
    const qr = window.qrcode(0, 'M');
    qr.addData(location.href);
    qr.make();
    qrHost.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    qrHost.setAttribute('role', 'img');
    qrHost.setAttribute('aria-label', TEXT.qrLabel);
  } catch {
    qrHost.remove();
  }
}

// ---- Boot ----

async function boot() {
  const env = checkEnvironment({
    ua: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    allowDesktop: config.allowDesktop,
    webgl: hasWebGL(),
    camera: hasCameraApi(),
  });
  if (env.block === 'in-app') return showInApp(env.platform);
  if (env.block === 'desktop') return showDesktop();
  if (env.block === 'unsupported') {
    return showMessage({ title: TEXT.desktopTitle, body: TEXT.unsupportedBody });
  }

  const slug = readSlug(location.search);
  if (!slug) return showMessage({ title: TEXT.notFoundTitle, body: TEXT.notFoundBody }); // ERR-04

  // Libraries start downloading in parallel with the photographer data (NFR-03).
  const libsReady = loadArLibraries(config.libs);
  libsReady.catch(() => {});

  let photographer;
  try {
    photographer = await loadPhotographer(slug, config);
  } catch (err) {
    if (err instanceof NotFoundError) return showMessage({ title: TEXT.notFoundTitle, body: TEXT.notFoundBody });
    return showLoadFailure();
  }

  if (!photographer.targetsUrl || photographer.artworks.length === 0) {
    // ERR-10: no camera request.
    return showMessage({
      title: TEXT.noArtworksTitle,
      subtitle: photographer.name,
      actions: photographer.websiteUrl ? [websiteLink(photographer.websiteUrl)] : [],
    });
  }

  renderWelcome(photographer);

  let ar;
  try {
    const [targetsSrc] = await Promise.all([preloadTargets(photographer.targetsUrl), libsReady]);
    ar = createScene({
      container: $('ar-container'),
      targetsSrc,
      artworks: photographer.artworks,
      mindar: config.mindar,
    });
    await ar.ready;
  } catch {
    return showLoadFailure();
  }

  enableScan(photographer, ar);
}

function renderWelcome(photographer) {
  document.title = `${photographer.name} - ManuGrafias`;
  $('photographer-name').textContent = photographer.name;
  $('privacy-link').href = `privacy.html?lang=${LANGUAGE}`;
  for (const id of ['welcome-website', 'camera-website']) {
    const link = $(id);
    if (photographer.websiteUrl) link.href = photographer.websiteUrl;
    else link.hidden = true;
  }
  show('screen-welcome');
}

// ---- AR session ----

function enableScan(photographer, ar) {
  const scan = $('btn-scan');
  scan.disabled = false;
  scan.removeAttribute('aria-busy');
  scan.textContent = TEXT.scanArtwork;

  const ui = {
    showHint: () => ($('scan-hint').hidden = false),
    hideHint: () => ($('scan-hint').hidden = true),
    showLoading: () => setStatus('loading'),
    showUnavailable: () => setStatus('unavailable'),
    hideStatus: () => setStatus(null),
    setPlaneVisible: (i, v) => ar.setPlaneVisible(i, v),
  };

  const players = {};
  const controller = new PlaybackController({
    players,
    ui,
    toleranceMs: config.trackingLossToleranceMs,
    hintDelayMs: config.scanHintDelayMs,
    loadTimeoutMs: config.videoLoadTimeoutMs,
    indicatorDelayMs: config.videoLoadingIndicatorDelayMs,
  });

  const muteButton = $('btn-mute');
  const setMuted = (muted) => {
    controller.setMuted(muted);
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.setAttribute('aria-label', muted ? TEXT.unmute : TEXT.mute);
    muteButton.classList.toggle('is-muted', muted);
  };
  muteButton.addEventListener('click', () => setMuted(!controller.muted));

  for (const artwork of photographer.artworks) {
    const i = artwork.targetIndex;
    players[i] = createPlayer({
      index: i,
      url: artwork.videoUrl,
      host: $('video-host'),
      onPlaying: () => controller.playing(i),
      onError: () => controller.failed(i),
      onForcedMute: () => setMuted(true),
      onAspect: (ratio) => {
        if (!artwork.aspectRatio) ar.setPlaneAspect(i, ratio);
      },
    });
    ar.anchors.get(i).addEventListener('targetFound', () => controller.found(i));
    ar.anchors.get(i).addEventListener('targetLost', () => controller.lost(i));
  }

  let cameraActive = false;
  ar.scene.addEventListener('arReady', () => {
    cameraActive = true;
    show('camera-ui');
    controller.start();
  });
  ar.scene.addEventListener('arError', () => {
    cameraActive = false;
    showCameraDenied();
  });

  scan.addEventListener('click', () => {
    scan.disabled = true;
    scan.textContent = TEXT.startingCamera;
    // Inside the tap: start downloading and unlock audio for every video (FR-03, NFR-03).
    for (const artwork of photographer.artworks) {
      const player = players[artwork.targetIndex];
      player.load();
      player.unlock();
      ar.attachVideo(artwork.targetIndex, player.video.id);
    }
    ar.system.start();
  });

  // ERR-07: pause the video and the camera in the background, resume on return.
  document.addEventListener('visibilitychange', () => {
    if (!cameraActive) return;
    if (document.hidden) {
      controller.suspend();
      ar.system.pause();
      return;
    }
    if (ar.cameraTrackEnded()) {
      cameraActive = false;
      ar.system.stop();
      ar.system.start(); // arReady restarts the controller
      return;
    }
    ar.system.unpause();
    controller.resume();
    // A photograph still in front of the camera does not fire a new targetFound.
    setTimeout(() => ar.trackedTargets().forEach((i) => controller.found(i)), 300);
  });
}

function setStatus(state) {
  const el = $('video-status');
  el.hidden = !state;
  el.dataset.state = state || '';
  $('video-status-text').textContent = state === 'unavailable' ? TEXT.videoUnavailable : TEXT.videoLoading;
}

function showCameraDenied() {
  const platform = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) ? 'ios' : 'android';
  showMessage({
    title: TEXT.cameraDeniedTitle,
    body: [TEXT.cameraDeniedBody, ...TEXT.cameraDeniedSteps[platform]],
    actions: [button(TEXT.tryAgain, reload)],
  });
}

boot();
