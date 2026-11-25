import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeFields, mediaResolver, normalizePhotographer, readSlug, storageUrl } from '../js/data.js';

test('decodes a Firestore REST document with the photographer contract', () => {
  const fields = {
    name: { stringValue: 'Ana' },
    links: { mapValue: { fields: { portfolio: { stringValue: 'https://ana.example' }, instagram: { stringValue: 'https://instagram.com/ana' } } } },
    published: {
      mapValue: {
        fields: {
          version: { integerValue: '3' },
          targetsPath: { stringValue: 'photographers/ana/published/v3/targets.mind' },
          artworks: {
            arrayValue: {
              values: [
                { mapValue: { fields: { id: { stringValue: 'b' }, targetIndex: { integerValue: '1' }, videoPath: { stringValue: 'v/b.mp4' }, aspectRatio: { doubleValue: 0.8 } } } },
                { mapValue: { fields: { id: { stringValue: 'a' }, targetIndex: { integerValue: '0' }, videoPath: { stringValue: 'v/a.mp4' }, aspectRatio: { integerValue: '1' } } } },
              ],
            },
          },
        },
      },
    },
  };
  const p = normalizePhotographer(decodeFields(fields), (path) => storageUrl('bucket', path));
  assert.equal(p.name, 'Ana');
  assert.deepEqual(p.links, [
    { type: 'instagram', url: 'https://instagram.com/ana' },
    { type: 'portfolio', url: 'https://ana.example' },
  ]);
  assert.equal(p.targetsUrl, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/photographers%2Fana%2Fpublished%2Fv3%2Ftargets.mind?alt=media');
  assert.deepEqual(p.artworks.map((a) => a.id), ['a', 'b']);
  assert.equal(p.artworks[1].aspectRatio, 0.8);
});

test('ERR-10: a photographer without `published` has no artworks', () => {
  const p = normalizePhotographer({ name: 'Ana' }, (x) => x);
  assert.equal(p.targetsUrl, null);
  assert.equal(p.artworks.length, 0);
});

test('FR-07: only Instagram, Behance and Portfolio https links are kept, in that order', () => {
  const p = normalizePhotographer(
    {
      name: 'Ana',
      links: { portfolio: 'https://ana.example', behance: 'http://behance.net/ana', twitter: 'https://x.com/ana', instagram: 'https://instagram.com/ana' },
    },
    (x) => x,
  );
  assert.deepEqual(p.links.map((l) => l.type), ['instagram', 'portfolio']);
  assert.deepEqual(normalizePhotographer({ name: 'Ana' }, (x) => x).links, []);
});

test('FR-01: slug comes from ?p= and invalid slugs are rejected', () => {
  assert.equal(readSlug('?p=ana-lopez'), 'ana-lopez');
  assert.equal(readSlug('?p=Ana-Lopez'), 'ana-lopez');
  assert.equal(readSlug('?p=../x'), null);
  assert.equal(readSlug(''), null);
});

test('media paths resolve against mediaBaseUrl, or Cloud Storage when it is empty', () => {
  const site = 'https://manfer993.github.io/manugrafias/?p=ana';
  const path = 'photographers/ana/published/videos/a.mp4';
  assert.equal(
    mediaResolver({ mediaBaseUrl: 'media/' }, site)(path),
    'https://manfer993.github.io/manugrafias/media/photographers/ana/published/videos/a.mp4',
  );
  assert.equal(
    mediaResolver({ mediaBaseUrl: 'media' }, site)('/' + path),
    'https://manfer993.github.io/manugrafias/media/photographers/ana/published/videos/a.mp4',
  );
  assert.equal(
    mediaResolver({ mediaBaseUrl: '', firebase: { storageBucket: 'b' } }, site)(path),
    storageUrl('b', path),
  );
});
