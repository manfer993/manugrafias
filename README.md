# ManuGrafias AR - MVP 1

WebAR experience that plays a video over a printed photograph (MindAR + A-Frame), hosted on GitHub Pages with
photographer data in Cloud Firestore (Firebase no-cost Spark plan) and media files in Supabase Storage. Requirements: `../SRS_manugrafias.md` v1.6. Architecture and data contract: `docs/architecture.md`.

Photographer URL: `https://manfer993.github.io/manugrafias/?p=<photographer-slug>`

Content panel (MVP 2): repository [manugrafias_admin](https://github.com/manfer993/manugrafias_admin), published at
`https://manfer993.github.io/manugrafias_admin/`.

## Structure

```
index.html          AR experience (welcome, camera screen, error screens)
privacy.html        Privacy Policy (SRS Appendix A)
css/styles.css
js/config.js        all tunable values (NFR-08) and the Firebase web config
js/main.js          boot, screens, AR session
js/playback.js      playback rules (FR-04..FR-09, ERR-06), unit tested
js/ar.js            A-Frame / MindAR scene and video players
js/data.js          Firestore REST read + data contract
js/env.js           in-app browser / desktop / support detection
js/icons.js         inline SVG icons (Font Awesome Free, CC BY 4.0)
js/i18n/            user-facing texts: one dictionary per language (en.js, es.js)
firebase/           Firestore rules (Storage rules and CORS kept for a future move to Cloud Storage)
supabase/           Supabase Storage bucket and policies (media uploaded by the panel)
scripts/            administrator custom claims
test/               unit tests (npm test)
```

## 1. Firebase setup (done once, no-cost Spark plan)

1. Firebase project with a **Web app** (no Firebase Hosting). `apiKey` and `projectId` go in `js/config.js`
   (public web config, not a secret - NFR-05).
2. **Cloud Firestore** in production mode, rules from `firebase/firestore.rules`
   (`firebase deploy --only firestore:rules`).

Cloud Storage for Firebase is not used (it needs the Blaze plan): media lives in Supabase Storage.

## 2. Content

Photographers, artworks and publications are managed in the content panel
([manugrafias_admin](https://github.com/manfer993/manugrafias_admin)). The panel uploads the images and videos
to Supabase Storage, compiles `targets.mind` and writes `published` in Firestore with absolute URLs. This
repository holds no media.

## 3. Test on devices

1. Serve the folder: `npm start`, then open http://localhost:8080/?p=<slug> (reads the real Firestore data).
   - Desktop with webcam: set `allowDesktop: true` temporarily (never commit it).
   - Phone: the camera needs HTTPS, so test from GitHub Pages (section 4) or an HTTPS tunnel to port 8080.
2. Check on an iPhone (iOS 15+, Safari) and an Android 10+ phone (Chrome), with real prints:
   - [ ] Welcome visible < 3 s and "Scan Artwork" enabled < 8 s on Fast 4G (NFR-03)
   - [ ] The video plays **with sound** right after detection, no extra tap (AC-03.2), especially on iOS
   - [ ] The video covers the print exactly (FR-04)
   - [ ] 400 ms tolerance feels right when shaking the phone (FR-06); tune `trackingLossToleranceMs`
   - [ ] Jitter acceptable; tune `mindar.filterMinCF` / `mindar.filterBeta`
   - [ ] Screen lock and return resume detection without a new permission prompt (ERR-07)
   - [ ] Gallery lighting and glass/reflections on framed prints

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
detection. Camera, tracking and audio behavior must be checked on real devices (section 3).
