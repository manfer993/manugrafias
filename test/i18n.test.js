import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DICTIONARIES, DEFAULT_LANGUAGE, getStrings, resolveLanguage } from '../js/i18n/index.js';

// Same keys, same nesting and same array lengths in every language.
function shape(value) {
  if (Array.isArray(value)) return `array(${value.length})${value.length && typeof value[0] === 'object' ? shape(value[0]) : ''}`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${k}:${shape(value[k])}`).join(',')}}`;
  }
  return typeof value;
}

test('English is the default language', () => {
  assert.equal(DEFAULT_LANGUAGE, 'en');
  assert.equal(resolveLanguage({ search: '', languages: [] }), 'en');
  assert.equal(resolveLanguage({ search: '', languages: ['fr-FR', 'de'] }), 'en');
});

test('browser language selects Spanish, including regional variants', () => {
  assert.equal(resolveLanguage({ languages: ['es-CO', 'en'] }), 'es');
  assert.equal(resolveLanguage({ languages: ['fr', 'es'] }), 'es');
  assert.equal(resolveLanguage({ languages: ['en-US', 'es'] }), 'en');
});

test('?lang= overrides the browser language; unknown values are ignored', () => {
  assert.equal(resolveLanguage({ search: '?p=demo&lang=es', languages: ['en-US'] }), 'es');
  assert.equal(resolveLanguage({ search: '?lang=EN', languages: ['es'] }), 'en');
  assert.equal(resolveLanguage({ search: '?lang=xx', languages: ['es'] }), 'es');
});

test('every dictionary has exactly the same keys as English', () => {
  for (const [code, dictionary] of Object.entries(DICTIONARIES)) {
    assert.equal(shape(dictionary), shape(DICTIONARIES.en), `dictionary "${code}" differs from English`);
  }
});

test('missing keys fall back to English', () => {
  DICTIONARIES.xx = { scanArtwork: 'XX', privacy: { title: 'XX title' } };
  try {
    const strings = getStrings('xx');
    assert.equal(strings.scanArtwork, 'XX');
    assert.equal(strings.privacyPolicy, DICTIONARIES.en.privacyPolicy);
    assert.equal(strings.privacy.title, 'XX title');
    assert.equal(strings.privacy.intro, DICTIONARIES.en.privacy.intro);
  } finally {
    delete DICTIONARIES.xx;
  }
});

test('SRS texts are verbatim in English', () => {
  const en = getStrings('en');
  assert.equal(en.tipVolumeTitle, 'Turn up the volume');
  assert.equal(en.tipVolumeBody, 'Disable silent mode.');
  assert.equal(en.tipLightTitle, 'Find good light');
  assert.equal(en.tipAimTitle, 'Point your camera at the artwork');
  assert.equal(en.scanHint, 'Still nothing? Get a little closer and look for good light.');
  assert.equal(en.videoUnavailable, 'Video unavailable, please try again');
  assert.equal(en.notFoundTitle, 'Artwork collection not found');
  assert.equal(en.noArtworksTitle, 'No artworks available yet');
});
