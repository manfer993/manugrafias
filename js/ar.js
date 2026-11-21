// A-Frame + MindAR wiring: libraries, scene, video players.

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

// A-Frame must be registered before MindAR's A-Frame build runs.
export async function loadArLibraries(libs) {
  await loadScript(libs.aframe);
  await loadScript(libs.mindar);
}

// Downloads targets.mind once, so "Scan Artwork" is only enabled when it is available (ERR-05).
export async function preloadTargets(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`targets.mind ${response.status}`);
  return URL.createObjectURL(await response.blob());
}

// ---- Video player (one per artwork) ----

export function createPlayer({ index, url, host, onPlaying, onError, onForcedMute, onAspect }) {
  const video = document.createElement('video');
  video.id = `mg-video-${index}`;
  video.crossOrigin = 'anonymous'; // required to use the video as a WebGL texture
  video.loop = true;
  video.preload = 'auto';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  host.appendChild(video);

  let wantPlay = false;
  let playing = false;
  let failed = false;
  let loaded = false;

  video.addEventListener('playing', () => {
    playing = true;
    if (wantPlay) onPlaying();
  });
  video.addEventListener('pause', () => {
    playing = false;
  });
  video.addEventListener('error', () => {
    failed = true;
    playing = false;
    onError();
  });
  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth && video.videoHeight) onAspect(video.videoWidth / video.videoHeight);
  });

  const safePlay = () => {
    const attempt = video.play();
    if (!attempt) return;
    attempt.catch((err) => {
      if (err && err.name === 'NotAllowedError' && !video.muted) {
        // Audio was not unlocked by the browser: keep the experience working muted.
        video.muted = true;
        onForcedMute();
        video.play().catch(() => {});
      }
    });
  };

  return {
    video,
    // Starts downloading the video (NFR-03: after "Scan Artwork").
    load() {
      if (loaded) return;
      loaded = true;
      video.src = url;
    },
    // Must run inside the "Scan Artwork" tap: lets the video play with sound later (FR-03).
    unlock() {
      const attempt = video.play();
      if (!attempt) return;
      attempt
        .then(() => {
          if (!wantPlay) {
            video.pause();
            video.currentTime = 0;
          }
        })
        .catch(() => {});
    },
    play(muted) {
      wantPlay = true;
      video.muted = muted;
      if (playing && !video.paused) {
        onPlaying();
        return;
      }
      safePlay();
    },
    stop() {
      wantPlay = false;
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* not seekable yet */
      }
    },
    setMuted(muted) {
      video.muted = muted;
    },
    isPlaying: () => playing && !video.paused,
    isFailed: () => failed,
    retry() {
      failed = false;
      video.load();
    },
  };
}

// ---- Scene ----

export function createScene({ container, targetsSrc, artworks, mindar }) {
  const scene = document.createElement('a-scene');
  scene.setAttribute(
    'mindar-image',
    [
      `imageTargetSrc: ${targetsSrc}`,
      'autoStart: false',
      'maxTrack: 1', // FR-04: one artwork at a time
      'uiLoading: no',
      'uiScanning: no',
      'uiError: no',
      `filterMinCF: ${mindar.filterMinCF}`,
      `filterBeta: ${mindar.filterBeta}`,
      `missTolerance: ${mindar.missTolerance}`,
      `warmupTolerance: ${mindar.warmupTolerance}`,
    ].join('; '),
  );
  scene.setAttribute('color-space', 'sRGB');
  scene.setAttribute('renderer', 'colorManagement: true');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
  scene.setAttribute('loading-screen', 'enabled: false');

  const camera = document.createElement('a-camera');
  camera.setAttribute('position', '0 0 0');
  camera.setAttribute('look-controls', 'enabled: false');
  camera.setAttribute('wasd-controls', 'enabled: false');
  scene.appendChild(camera);

  const anchors = new Map();
  const planes = new Map();
  for (const artwork of artworks) {
    const anchor = document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target', `targetIndex: ${artwork.targetIndex}`);

    // The anchor's unit width is the target image width, so the plane covers the photograph exactly (FR-04).
    const plane = document.createElement('a-plane');
    plane.setAttribute('width', '1');
    plane.setAttribute('height', String(artwork.aspectRatio ? 1 / artwork.aspectRatio : 1));
    plane.setAttribute('position', '0 0 0');
    plane.setAttribute('material', 'shader: flat; color: #000');
    plane.setAttribute('visible', 'false');

    anchor.appendChild(plane);
    scene.appendChild(anchor);
    anchors.set(artwork.targetIndex, anchor);
    planes.set(artwork.targetIndex, plane);
  }

  container.appendChild(scene);

  const ready = new Promise((resolve) => {
    if (scene.renderStarted) resolve();
    else scene.addEventListener('renderstart', () => resolve(), { once: true });
  });

  return {
    scene,
    anchors,
    planes,
    ready,
    get system() {
      return scene.systems['mindar-image-system'];
    },
    attachVideo(index, videoId) {
      // color must be white: the flat shader multiplies the texture by it.
      planes.get(index)?.setAttribute('material', `shader: flat; color: #FFF; src: #${videoId}`);
    },
    setPlaneVisible(index, visible) {
      planes.get(index)?.setAttribute('visible', visible ? 'true' : 'false');
    },
    setPlaneAspect(index, aspectRatio) {
      planes.get(index)?.setAttribute('height', String(1 / aspectRatio));
    },
    // Targets MindAR still considers tracked (used after a resume, ERR-07).
    trackedTargets() {
      return [...anchors.entries()].filter(([, el]) => el.object3D && el.object3D.visible).map(([i]) => i);
    },
    cameraTrackEnded() {
      const video = container.querySelector('video:not([id^="mg-video-"])');
      const stream = video && video.srcObject;
      return !stream || stream.getVideoTracks().every((t) => t.readyState === 'ended');
    },
  };
}
