# ManuGrafias AR - Architecture (MVP 1)

Source of requirements: `SRS_manugrafias.md` v1.6.

## Release plan

| Release | Scope | Content loading |
| ------- | ----- | --------------- |
| **MVP 1** (this code) | AR experience: FR-01 to FR-09, ERR-01 to ERR-10, NFR-01 to NFR-09 | By hand (no longer used) |
| **MVP 2** | Content panel: FR-10 to FR-14, ERR-11 to ERR-13 (repository `manugrafias_admin`) | Panel writes the same contract |

The AR experience never changes between MVP 1 and MVP 2: both read the contract below.

## Components

```
Phone browser (GitHub Pages, static)
  index.html + js/*.js (ES modules, no build step)
  A-Frame 1.5.0 + MindAR 1.2.5 (CDN, pinned)
        |
        | 1 read: GET photographers/{slug}       (Firestore REST, public get)
        v
Firebase (no-cost Spark plan)
  Cloud Firestore     photographers/{slug}
  Authentication      (MVP 2, administrator only, Google sign-in)

Supabase (no-cost plan)
  Storage bucket `media`   targets.mind, videos and target images uploaded by the panel
```

## Data contract

### Firestore `photographers/{slug}` (public `get`, no `list`)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name` | string | Shown on the welcome screen |
| `links` | map | Optional. Up to three keys: `instagram`, `behance`, `portfolio` (FR-07) |
| `links.<type>` | string | Must start with `https://` (otherwise that button is hidden). Shown in the order Instagram, Behance, Portfolio |
| `published` | map | Absent until the first publication (ERR-10) |
| `published.version` | number | Incremented on every publication |
| `published.targetsPath` | string | Compiled `targets.mind`: absolute `https://` Supabase URL (a relative path resolves against `mediaBaseUrl`) |
| `published.artworks` | array of map | Only what the AR experience needs |
| `published.artworks[].id` | string | Artwork id (same as `artworks/{id}` in MVP 2) |
| `published.artworks[].targetIndex` | number | Position of the image inside `targets.mind` (0-based) |
| `published.artworks[].videoPath` | string | Video: absolute `https://` URL or path relative to `mediaBaseUrl`, as `targetsPath` |
| `published.artworks[].aspectRatio` | number | Target image width / height (plane size, FR-04) |

Titles, upload dates and authors are **not** in this document: they are panel-only data (MVP 2 collection
`artworks/{id}`, not readable by end users), so they can never leak into the AR experience (section 1.5).

### Media files

All media is in Supabase Storage (next section). GitHub Pages serves only the app: Cloud Storage for Firebase
needs the Blaze plan and the project stays at no cost.

### Supabase Storage (written by the content panel)

A browser panel cannot upload to GitHub Pages safely, so the panel uploads to Supabase Storage (free plan),
with the administrator signed in through Firebase Auth (Google provider) used as Supabase third-party auth.

| Item | Value |
| ---- | ----- |
| Supabase project | `hdajccuxsqteijcodyxg` (`https://hdajccuxsqteijcodyxg.supabase.co`), region East US |
| Bucket | `media`, public read, 50 MB per file, `video/mp4`, `application/octet-stream`, `image/jpeg`, `image/png` |
| Paths | `photographers/{slug}/artworks/{id}/target-{t}.jpg\|png`, `.../video-{t}.mp4`, `photographers/{slug}/published/v{n}/targets.mind` |
| Public URL | `https://hdajccuxsqteijcodyxg.supabase.co/storage/v1/object/public/media/<path>` |
| Write access | `supabase/storage.sql`: only Firebase ID tokens of project `manugrafias-2026` (`iss` + `aud`) with the custom claim `admin: true` can insert, update, delete or list |
| Administrator | Firebase user with custom claims `{ role: 'authenticated', admin: true }` (`scripts/set-admin-claim.mjs`); `role` makes Supabase use the `authenticated` Postgres role |
| Third-party auth | Supabase > Authentication > Third-Party Auth > Firebase, project `manugrafias-2026` |

Verified on 2026-11-25 (admin upload test from a local page with the Firebase JS SDK and supabase-js):
admin upload OK, anonymous upload rejected (403), anonymous list returns nothing, HTTP Range requests return 206,
public objects send `Access-Control-Allow-Origin: *`, and a video loaded with `crossOrigin = 'anonymous'` can be
read back from a canvas (usable as a WebGL texture).

The panel stores absolute public URLs in `published`.

Risk: free Supabase projects are paused after 7 days of low database activity, and the docs do not say whether
public Storage downloads count as activity or keep working while paused. Mitigation: the workflow
`manugrafias_admin/.github/workflows/supabase-keep-alive.yml` runs a database query twice a week.

### Firestore rules (`firebase/firestore.rules`)

| Path | Public | Administrator (Google sign-in + custom claim `admin: true`) |
| ---- | ------ | ----------------------------------------------------------- |
| `photographers/{slug}` | get | list, create, update, delete (the panel deletes a photographer with its artworks) |
| `artworks/{id}` | none | read, write |

Firebase Authentication has new sign-ups disabled, so the administrator is the only account.

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
| Texts per language (default English) | `js/i18n/en.js`, `js/i18n/es.js`, selection in `js/i18n/index.js` |
| Visual style (SRS 4.3), icons | `css/styles.css`, `js/icons.js` (inline SVG, no icon font) |
