// Language selection and dictionaries.
//
// Order: ?lang= in the URL > browser languages > DEFAULT_LANGUAGE (English).
// Every dictionary falls back to English for any missing key.

import en from './en.js';
import es from './es.js';

export const DEFAULT_LANGUAGE = 'en';
export const DICTIONARIES = { en, es };
export const SUPPORTED_LANGUAGES = Object.keys(DICTIONARIES);

function match(code) {
  if (!code) return null;
  const base = String(code).trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(base) ? base : null;
}

export function resolveLanguage({ search = '', languages = [] } = {}) {
  const fromUrl = match(new URLSearchParams(search).get('lang'));
  if (fromUrl) return fromUrl;
  for (const code of languages) {
    const found = match(code);
    if (found) return found;
  }
  return DEFAULT_LANGUAGE;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeWithFallback(fallback, overrides) {
  const out = {};
  for (const key of Object.keys(fallback)) {
    const base = fallback[key];
    const value = overrides ? overrides[key] : undefined;
    if (isPlainObject(base)) out[key] = mergeWithFallback(base, isPlainObject(value) ? value : undefined);
    else out[key] = value !== undefined ? value : base;
  }
  return out;
}

export function getStrings(language) {
  const dictionary = DICTIONARIES[language] || DICTIONARIES[DEFAULT_LANGUAGE];
  return mergeWithFallback(DICTIONARIES[DEFAULT_LANGUAGE], dictionary);
}

// Fills static markup: data-i18n="key" sets the text, data-i18n-aria-label="key" sets aria-label.
export function applyStaticTexts(root, strings, language) {
  root.documentElement.lang = language;
  for (const el of root.querySelectorAll('[data-i18n]')) {
    const value = strings[el.dataset.i18n];
    if (typeof value === 'string') el.textContent = value;
  }
  for (const el of root.querySelectorAll('[data-i18n-aria-label]')) {
    const value = strings[el.dataset.i18nAriaLabel];
    if (typeof value === 'string') el.setAttribute('aria-label', value);
  }
}

// Detects and applies the language of the current page.
export function setupLanguage() {
  const language = resolveLanguage({
    search: location.search,
    languages: navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language],
  });
  const strings = getStrings(language);
  applyStaticTexts(document, strings, language);
  return { language, strings };
}
