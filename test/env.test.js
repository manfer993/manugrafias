import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkEnvironment } from '../js/env.js';

const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const INSTAGRAM_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0';
const FACEBOOK_ANDROID = 'Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0.0.0;]';
const MAC_CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const ok = { webgl: true, camera: true, allowDesktop: false };

test('supported mobile browsers pass', () => {
  assert.deepEqual(checkEnvironment({ ua: IPHONE_SAFARI, maxTouchPoints: 5, ...ok }), { block: null, platform: 'ios' });
  assert.deepEqual(checkEnvironment({ ua: ANDROID_CHROME, maxTouchPoints: 5, ...ok }), { block: null, platform: 'android' });
  assert.equal(checkEnvironment({ ua: IPAD, maxTouchPoints: 5, ...ok }).block, null);
});

test('ERR-02: in-app browsers are detected', () => {
  assert.equal(checkEnvironment({ ua: INSTAGRAM_IOS, maxTouchPoints: 5, ...ok }).block, 'in-app');
  assert.equal(checkEnvironment({ ua: FACEBOOK_ANDROID, maxTouchPoints: 5, ...ok }).block, 'in-app');
});

test('ERR-03: desktop and unsupported devices are blocked', () => {
  assert.equal(checkEnvironment({ ua: MAC_CHROME, maxTouchPoints: 0, ...ok }).block, 'desktop');
  assert.equal(checkEnvironment({ ua: MAC_CHROME, maxTouchPoints: 0, ...ok, allowDesktop: true }).block, null);
  assert.equal(checkEnvironment({ ua: ANDROID_CHROME, maxTouchPoints: 5, ...ok, webgl: false }).block, 'unsupported');
});
