# ManuGrafias AR - Architecture (MVP 1)

Source of requirements: `SRS_manugrafias.md` v1.3.

## Release plan

| Release | Scope | Content loading |
| ------- | ----- | --------------- |
| **MVP 1** (this code) | AR experience: FR-01 to FR-09, ERR-01 to ERR-10, NFR-01 to NFR-09 | By hand in the Firebase console |
| **MVP 2** | Content panel: FR-10 to FR-14, ERR-11 to ERR-13 | Panel writes the same contract |

The AR experience never changes between MVP 1 and MVP 2: both read the contract below.

## Components

```
Phone browser (GitHub Pages, static)
  index.html + js/*.js (ES modules, no build step)
  A-Frame 1.5.0 + MindAR 1.2.5 (CDN, pinned)
        |
        | 1 read: GET photographers/{slug}       (Firestore REST, public get)
        | media:  GET targets.mind + videos       (Cloud Storage, public read, CORS)
        v
Firebase
  Cloud Firestore     photographers/{slug}
  Cloud Storage       photographers/{slug}/published/...
  Authentication      (MVP 2, administrator only)
```

## Data contract

### Firestore `photographers/{slug}` (public `get`, no `list`)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name` | string | Shown on the welcome screen |
| `websiteUrl` | string | Must start with `https://` (otherwise the button is hidden) |
| `published` | map | Absent until the first publication (ERR-10) |
| `published.version` | number | Incremented on every publication |
| `published.targetsPath` | string | Storage path of the compiled `targets.mind` |
| `published.artworks` | array of map | Only what the AR experience needs |
| `published.artworks[].id` | string | Artwork id (same as `artworks/{id}` in MVP 2) |
| `published.artworks[].targetIndex` | number | Position of the image inside `targets.mind` (0-based) |
| `published.artworks[].videoPath` | string | Storage path of the video |
| `published.artworks[].aspectRatio` | number | Target image width / height (plane size, FR-04) |

Titles, upload dates and authors are **not** in this document: they are panel-only data (MVP 2 collection
`artworks/{id}`, not readable by end users), so they can never leak into the AR experience (section 1.5).

### Cloud Storage

```
photographers/{slug}/published/v{version}/targets.mind
photographers/{slug}/published/videos/{artworkId}.mp4
```

### Why one document

- One read per visit: fast welcome screen (NFR-03) and minimal Firestore usage (NFR-09).
- Atomic publication for MVP 2 (ERR-11, ERR-12): the panel uploads the new `targets.mind` under a new
  `v{version}` folder and new videos first, and only then replaces `published` in a single write.
  If anything fails before that write, the live version is untouched.

## AR experience flow (code map)

| Step | Code |
| ---- | ---- |
| Environment checks (ERR-02, ERR-03) | `js/env.js`, `boot()` in `js/main.js` |
| Slug and data (FR-01, ERR-04, ERR-10) | `js/data.js` |
| Libraries + `targets.mind` preload, "Scan Artwork" enabled (ERR-05) | `loadArLibraries`, `preloadTargets`, `createScene` in `js/ar.js` |
| Tap: video download + audio unlock + camera (FR-03) | click handler in `enableScan()` |
| Tracking, playback, tolerance, mute, hint, video errors (FR-04 to FR-09, ERR-06) | `js/playback.js` (unit tested) |
| Background / screen lock (ERR-07) | `visibilitychange` handler in `enableScan()` |
| Tunable values (NFR-08) | `js/config.js` |
| Texts | `js/strings.js` |
