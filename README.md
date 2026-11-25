# ManuGrafias AR - MVP 1

WebAR experience that plays a video over a printed photograph (MindAR + A-Frame), hosted on GitHub Pages with
photographer data in Cloud Firestore (Firebase no-cost Spark plan) and media files on GitHub Pages. Requirements: `../SRS_manugrafias.md` v1.4. Architecture and data contract: `docs/architecture.md`.

Photographer URL: `https://manfer993.github.io/manugrafias/?p=<photographer-slug>`

## Structure

```
index.html          AR experience (welcome, camera screen, error screens)
privacy.html        Privacy Policy (SRS Appendix A)
css/styles.css
js/config.js        all tunable values (NFR-08), the Firebase web config and mediaBaseUrl
js/main.js          boot, screens, AR session
js/playback.js      playback rules (FR-04..FR-09, ERR-06), unit tested
js/ar.js            A-Frame / MindAR scene and video players
js/data.js          Firestore REST read + data contract
js/env.js           in-app browser / desktop / support detection
js/icons.js         inline SVG icons (Font Awesome Free, CC BY 4.0)
js/i18n/            user-facing texts: one dictionary per language (en.js, es.js)
firebase/           Firestore rules (Storage rules and CORS kept for a future move to Cloud Storage)
media/              published media served by GitHub Pages: media/photographers/<slug>/published/...
data/               local data for the technical spike (dataSource: 'local')
test/               unit tests (npm test)
```

## 1. Technical spike with local files (no Firebase)

1. Compile the target images with the MindAR compiler
   (https://hiukim.github.io/mind-ar-js-doc/tools/compile). The order of the images is the `targetIndex`
   (first image = 0). Download `targets.mind`.
2. Put `targets.mind` and the videos under `media/photographers/<slug>/published/` and list them in
   `data/photographers/demo.json` (`aspectRatio` = image width / height).
3. In `js/config.js` set `dataSource: 'local'`.
4. Serve the folder: `npm start` (http://localhost:8080/?p=demo).
   - Desktop with webcam: set `allowDesktop: true` temporarily.
   - Phone: the camera needs HTTPS, so test from GitHub Pages (section 4) or an HTTPS tunnel to port 8080.
5. Check on an iPhone (iOS 15+, Safari) and an Android 10+ phone (Chrome), with real prints:
   - [ ] Welcome visible < 3 s and "Scan Artwork" enabled < 8 s on Fast 4G (NFR-03)
   - [ ] The video plays **with sound** right after detection, no extra tap (AC-03.2), especially on iOS
   - [ ] The video covers the print exactly (FR-04)
   - [ ] 400 ms tolerance feels right when shaking the phone (FR-06); tune `trackingLossToleranceMs`
   - [ ] Jitter acceptable; tune `mindar.filterMinCF` / `mindar.filterBeta`
   - [ ] Screen lock and return resume detection without a new permission prompt (ERR-07)
   - [ ] Gallery lighting and glass/reflections on framed prints

Remove `dataSource: 'local'` and `allowDesktop: true` before deploying.

## 2. Firebase setup (once, no-cost Spark plan)

1. Create a Firebase project (Google Analytics is not needed) and add a **Web app** (no Firebase Hosting).
   Copy `apiKey` and `projectId` into `js/config.js` (public web config, not a secret - NFR-05).
2. **Cloud Firestore**: create the database in production mode (the region cannot be changed later).
   Publish `firebase/firestore.rules` (Firestore > Rules, or `firebase deploy --only firestore:rules`).
3. In `js/config.js` set `dataSource: 'firebase'` and keep `mediaBaseUrl: 'media/'`.

Cloud Storage is not used: it needs the Blaze (pay-as-you-go) plan. The media is served by GitHub Pages from
`media/`, same origin as the app, so no CORS setup is needed. To move to Cloud Storage later, upload the same
paths to the bucket, set `storageBucket` and `mediaBaseUrl: ''`, and apply `firebase/storage.rules` and
`firebase/cors.json`.

## 3. Load a photographer by hand (MVP 1)

1. Choose a permanent slug: lowercase letters, numbers and hyphens (e.g. `manuel-munoz`).
2. Compile `targets.mind` with the MindAR compiler, images in a fixed order.
3. Add the files to this repository, then commit and push:
   - `media/photographers/<slug>/published/v1/targets.mind`
   - `media/photographers/<slug>/published/videos/<artworkId>.mp4` (one per artwork, checked against SRS section 5)
4. Firestore: create the document `photographers/<slug>` (paths are relative to `mediaBaseUrl`):
   ```
   name        (string)  Photographer name
   links       (map)     optional, only the ones the photographer has (each https://...)
     instagram   (string)
     behance     (string)
     portfolio   (string)
   published   (map)
     version      (number) 1
     targetsPath  (string) photographers/<slug>/published/v1/targets.mind
     artworks     (array)
       0 (map)  id (string) artwork-1
                targetIndex (number) 0
                videoPath (string) photographers/<slug>/published/videos/artwork-1.mp4
                aspectRatio (number) 0.75
       1 (map)  ...
   ```
5. Open `https://manfer993.github.io/manugrafias/?p=<slug>` and generate the QR code of that URL.

To change artworks: push the new files first (new `targets.mind` under `v2/`), wait for GitHub Pages to
publish them, then update `published` (version, targetsPath, artworks) in Firestore last.

## 4. Deploy to GitHub Pages

1. Push this folder as the root of `https://github.com/manfer993/manugrafias` (branch `main`).
2. Repository > Settings > Pages > Deploy from a branch > `main` / root.
3. The repository must be **public** on the free GitHub plan.

## Languages

Every user-facing text lives in one dictionary per language in `js/i18n/` (`en.js`, `es.js`).
English is the default.

- Selection order: `?lang=es` / `?lang=en` in the URL, then the browser language, then English.
- A key missing in a translation falls back to English.
- To add a language: copy `js/i18n/en.js` to `js/i18n/<code>.js`, translate it and register it in
  `DICTIONARIES` in `js/i18n/index.js`. `npm test` fails if its keys differ from English.

## Tests

```bash
npm test
```

Unit tests cover the playback rules (FR-04 to FR-09, ERR-06, ERR-07), the data contract and the environment
detection. Camera, tracking and audio behavior must be checked on real devices (section 1, step 5).
