import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PlaybackController } from '../js/playback.js';

// Deterministic fake clock.
function fakeTimers() {
  let now = 0;
  let seq = 0;
  const pending = new Map();
  return {
    setTimeout(fn, ms) { const id = ++seq; pending.set(id, { fn, at: now + ms }); return id; },
    clearTimeout(id) { pending.delete(id); },
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const next = [...pending.entries()].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        pending.delete(next[0]);
        now = next[1].at;
        next[1].fn();
      }
      now = target;
    },
  };
}

function fakePlayer({ ready = true } = {}) {
  const p = {
    ready, playing: false, failed: false, muted: null, plays: 0, stops: 0, retries: 0, position: 0,
    play(muted) { p.plays++; p.muted = muted; if (p.ready) p.playing = true; },
    stop() { p.stops++; p.playing = false; p.position = 0; },
    setMuted(m) { p.muted = m; },
    isPlaying: () => p.playing,
    isFailed: () => p.failed,
    retry() { p.retries++; p.failed = false; },
  };
  return p;
}

function fakeUi() {
  return {
    hint: false, status: null, planes: {},
    showHint() { this.hint = true; }, hideHint() { this.hint = false; },
    showLoading() { this.status = 'loading'; }, showUnavailable() { this.status = 'unavailable'; },
    hideStatus() { this.status = null; },
    setPlaneVisible(i, v) { this.planes[i] = v; },
  };
}

let timers, ui, players, ctl;
beforeEach(() => {
  timers = fakeTimers();
  ui = fakeUi();
  players = { 0: fakePlayer(), 1: fakePlayer() };
  ctl = new PlaybackController({
    players, ui, timers, toleranceMs: 400, hintDelayMs: 30000, loadTimeoutMs: 10000, indicatorDelayMs: 300,
  });
  ctl.start();
});

test('AC-05.1: detected artwork plays its own video and shows the plane', () => {
  ctl.found(1);
  assert.equal(players[1].plays, 1);
  assert.equal(players[0].plays, 0);
  assert.equal(ui.planes[1], true);
});

test('AC-06.1: loss shorter than the tolerance does not restart the video', () => {
  ctl.found(0);
  ctl.lost(0);
  timers.advance(399);
  ctl.found(0);
  timers.advance(1000);
  assert.equal(players[0].stops, 0);
  assert.equal(players[0].plays, 1);
  assert.equal(players[0].playing, true);
});

test('AC-06.2: loss longer than the tolerance hides, pauses and resets; next framing plays from 0:00', () => {
  ctl.found(0);
  ctl.lost(0);
  timers.advance(400);
  assert.equal(players[0].stops, 1);
  assert.equal(ui.planes[0], false);
  ctl.found(0);
  assert.equal(players[0].plays, 2);
});

test('FR-04: a different artwork stops the previous one at once', () => {
  ctl.found(0);
  ctl.lost(0);
  timers.advance(100);
  ctl.found(1);
  assert.equal(players[0].stops, 1);
  assert.equal(players[1].playing, true);
});

test('AC-08.1 / AC-08.2: mute applies to the playing video and to the next one', () => {
  ctl.found(0);
  ctl.setMuted(true);
  assert.equal(players[0].muted, true);
  ctl.lost(0);
  timers.advance(400);
  ctl.found(1);
  assert.equal(players[1].muted, true);
  ctl.setMuted(false);
  assert.equal(players[1].muted, false);
});

test('AC-09.1: hint appears after 30 s without detection', () => {
  timers.advance(29999);
  assert.equal(ui.hint, false);
  timers.advance(1);
  assert.equal(ui.hint, true);
});

test('AC-09.2: hint disappears on detection; the count restarts on each loss', () => {
  timers.advance(30000);
  ctl.found(0);
  assert.equal(ui.hint, false);
  ctl.lost(0);
  timers.advance(400 + 29000);
  assert.equal(ui.hint, false);
  timers.advance(1000);
  assert.equal(ui.hint, true);
});

test('NFR-03: a video not buffered shows the loading indicator in under 1 s, then plays', () => {
  players[0] = fakePlayer({ ready: false });
  ctl.found(0);
  assert.equal(ui.planes[0], undefined);
  timers.advance(300);
  assert.equal(ui.status, 'loading');
  players[0].playing = true;
  ctl.playing(0);
  assert.equal(ui.status, null);
  assert.equal(ui.planes[0], true);
});

test('AC-ERR-06: still loading after 10 s shows "unavailable"; another artwork plays normally', () => {
  players[0] = fakePlayer({ ready: false });
  ctl.found(0);
  timers.advance(10000);
  assert.equal(ui.status, 'unavailable');
  ctl.lost(0);
  timers.advance(400);
  assert.equal(ui.status, null);
  ctl.found(1);
  assert.equal(players[1].playing, true);
  assert.equal(ui.planes[1], true);
});

test('AC-ERR-06: a load error shows "unavailable" and the next framing retries', () => {
  players[0] = fakePlayer({ ready: false });
  ctl.found(0);
  players[0].failed = true;
  ctl.failed(0);
  assert.equal(ui.status, 'unavailable');
  ctl.lost(0);
  timers.advance(400);
  ctl.found(0);
  assert.equal(players[0].retries, 1);
});

test('AC-ERR-07: suspend stops the video and the hint; resume restarts detection timers', () => {
  ctl.found(0);
  ctl.suspend();
  assert.equal(players[0].stops, 1);
  ctl.found(1); // events while suspended are ignored
  assert.equal(players[1].plays, 0);
  ctl.resume();
  ctl.found(1);
  assert.equal(players[1].plays, 1);
});
