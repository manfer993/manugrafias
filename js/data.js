// Data access for the AR experience.
//
// Contract (shared with the MVP 2 content panel, see docs/architecture.md):
//   photographers/{slug}
//     name:        string
//     websiteUrl:  string (https://)
//     published:   map, absent until the first publication
//       version:     number
//       targetsPath: string  Storage path of the compiled targets.mind
//       artworks:    array of map
//         id:          string
//         targetIndex: number  position of the artwork inside targets.mind
//         videoPath:   string  Storage path of the video
//         aspectRatio: number  width / height of the target image
//
// The AR experience reads ONE document per visit, so a publication is atomic:
// the panel uploads the new files first and swaps `published` last.

export class NotFoundError extends Error {}

// ---- Firestore REST value decoding (keeps the SDK out of the AR bundle) ----

export function decodeValue(value) {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('referenceValue' in value) return value.referenceValue;
  return null;
}

export function decodeFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) out[key] = decodeValue(value);
  return out;
}

// ---- Slug ----

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function readSlug(search) {
  const slug = new URLSearchParams(search).get('p');
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return SLUG_PATTERN.test(normalized) ? normalized : null;
}

// ---- Normalization: turns a raw document into what the AR experience needs ----

export function normalizePhotographer(raw, resolveMediaUrl) {
  const published = raw.published || null;
  const artworks = (published && Array.isArray(published.artworks) ? published.artworks : [])
    .filter((a) => a && Number.isInteger(a.targetIndex) && a.videoPath)
    .map((a) => ({
      id: String(a.id ?? a.targetIndex),
      targetIndex: a.targetIndex,
      videoUrl: resolveMediaUrl(a.videoPath),
      aspectRatio: Number(a.aspectRatio) > 0 ? Number(a.aspectRatio) : null,
    }))
    .sort((a, b) => a.targetIndex - b.targetIndex);

  return {
    name: String(raw.name || ''),
    websiteUrl: isHttpsUrl(raw.websiteUrl) ? raw.websiteUrl : null,
    targetsUrl: published && published.targetsPath ? resolveMediaUrl(published.targetsPath) : null,
    artworks,
  };
}

export function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

// ---- Sources ----

export function storageUrl(bucket, path) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}

async function fetchFromFirestore(slug, firebase) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${firebase.projectId}` +
    `/databases/(default)/documents/photographers/${encodeURIComponent(slug)}?key=${firebase.apiKey}`;
  const response = await fetch(url);
  if (response.status === 404) throw new NotFoundError(slug);
  if (!response.ok) throw new Error(`Firestore ${response.status}`);
  const doc = await response.json();
  return normalizePhotographer(decodeFields(doc.fields || {}), (path) =>
    storageUrl(firebase.storageBucket, path),
  );
}

async function fetchFromLocal(slug, localDataPath) {
  const response = await fetch(`${localDataPath}/${slug}.json`, { cache: 'no-cache' });
  if (response.status === 404) throw new NotFoundError(slug);
  if (!response.ok) throw new Error(`Local data ${response.status}`);
  const raw = await response.json();
  return normalizePhotographer(raw, (path) => new URL(path, document.baseURI).href);
}

export function loadPhotographer(slug, config) {
  return config.dataSource === 'local'
    ? fetchFromLocal(slug, config.localDataPath)
    : fetchFromFirestore(slug, config.firebase);
}
