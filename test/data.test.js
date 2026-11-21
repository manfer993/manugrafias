import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeFields, normalizePhotographer, readSlug, storageUrl } from '../js/data.js';

test('decodes a Firestore REST document with the photographer contract', () => {
  const fields = {
    name: { stringValue: 'Ana' },
    websiteUrl: { stringValue: 'https://ana.example' },
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
  assert.equal(p.websiteUrl, 'https://ana.example');
  assert.equal(p.targetsUrl, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/photographers%2Fana%2Fpublished%2Fv3%2Ftargets.mind?alt=media');
  assert.deepEqual(p.artworks.map((a) => a.id), ['a', 'b']);
  assert.equal(p.artworks[1].aspectRatio, 0.8);
});

test('ERR-10: a photographer without `published` has no artworks', () => {
  const p = normalizePhotographer({ name: 'Ana', websiteUrl: 'https://ana.example' }, (x) => x);
  assert.equal(p.targetsUrl, null);
  assert.equal(p.artworks.length, 0);
});

test('website URL must be https (AC-11.3 contract)', () => {
  const p = normalizePhotographer({ name: 'Ana', websiteUrl: 'http://ana.example' }, (x) => x);
  assert.equal(p.websiteUrl, null);
});

test('FR-01: slug comes from ?p= and invalid slugs are rejected', () => {
  assert.equal(readSlug('?p=ana-lopez'), 'ana-lopez');
  assert.equal(readSlug('?p=Ana-Lopez'), 'ana-lopez');
  assert.equal(readSlug('?p=../x'), null);
  assert.equal(readSlug(''), null);
});
