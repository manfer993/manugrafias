// Playback rules of the AR experience, independent from A-Frame and the DOM so they can be unit tested.
//
// FR-04  one artwork at a time
// FR-05  play in a loop when detected
// FR-06  tracking-loss tolerance: short losses do not interrupt, longer ones hide + pause + reset
// FR-08  mute state applies to every artwork for the whole session
// FR-09  scanning hint after N seconds without a tracked artwork, restarted on each loss
// ERR-06 loading indicator, then "Video unavailable" after a timeout or a load error
// ERR-07 suspend / resume when the tab is hidden or the screen locks
//
// players[targetIndex] implements: load(), play(muted), stop(), setMuted(muted), isPlaying(), isFailed(), retry()
// ui implements: showHint(), hideHint(), showLoading(), showUnavailable(), hideStatus(), setPlaneVisible(index, visible)

export class PlaybackController {
  constructor({ players, ui, toleranceMs, hintDelayMs, loadTimeoutMs, indicatorDelayMs, timers }) {
    this.players = players;
    this.ui = ui;
    this.toleranceMs = toleranceMs;
    this.hintDelayMs = hintDelayMs;
    this.loadTimeoutMs = loadTimeoutMs;
    this.indicatorDelayMs = indicatorDelayMs;
    this.timers = timers || { setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id) };

    this.active = null; // targetIndex currently shown
    this.muted = false;
    this.running = false;
    this.lossTimer = null;
    this.hintTimer = null;
    this.indicatorTimer = null;
    this.loadTimer = null;
  }

  // Camera feed is live and detection is running.
  start() {
    this.running = true;
    this._armHint();
  }

  found(index) {
    if (!this.running || !this.players[index]) return;

    if (this.active === index && this.lossTimer !== null) {
      // Recovered within the tolerance: playback continues uninterrupted (AC-06.1).
      this._clear('lossTimer');
      return;
    }
    if (this.active === index) return;
    if (this.active !== null) this._stop(this.active);

    this._clear('hintTimer');
    this.ui.hideHint();
    this.active = index;
    this._play(index);
  }

  lost(index) {
    if (!this.running || this.active !== index || this.lossTimer !== null) return;
    this.lossTimer = this.timers.setTimeout(() => {
      this.lossTimer = null;
      this._stop(index);
      this.active = null;
      this.ui.hideStatus();
      this._armHint();
    }, this.toleranceMs);
  }

  // Called by the player when its video actually starts rendering frames.
  playing(index) {
    if (this.active !== index) return;
    this._clearLoadTimers();
    this.ui.hideStatus();
    this.ui.setPlaneVisible(index, true);
  }

  // Called by the player when its video fails to load.
  failed(index) {
    if (this.active !== index) return;
    this._clearLoadTimers();
    this.ui.setPlaneVisible(index, false);
    this.ui.showUnavailable();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.active !== null) this.players[this.active].setMuted(muted);
  }

  suspend() {
    if (this.active !== null) this._stop(this.active);
    this.active = null;
    this.running = false;
    this._clear('hintTimer');
    this.ui.hideHint();
    this.ui.hideStatus();
  }

  resume() {
    this.start();
  }

  // ---- internals ----

  _play(index) {
    const player = this.players[index];
    if (player.isFailed()) player.retry();
    player.play(this.muted);

    if (player.isPlaying()) {
      this.playing(index);
      return;
    }
    this.indicatorTimer = this.timers.setTimeout(() => {
      this.indicatorTimer = null;
      if (this.active === index && !player.isPlaying()) this.ui.showLoading();
    }, this.indicatorDelayMs);
    this.loadTimer = this.timers.setTimeout(() => {
      this.loadTimer = null;
      if (this.active === index && !player.isPlaying()) this.failed(index);
    }, this.loadTimeoutMs);
  }

  _stop(index) {
    this._clear('lossTimer');
    this._clearLoadTimers();
    this.players[index].stop();
    this.ui.setPlaneVisible(index, false);
  }

  _armHint() {
    this._clear('hintTimer');
    if (!this.running) return;
    this.hintTimer = this.timers.setTimeout(() => {
      this.hintTimer = null;
      if (this.active === null) this.ui.showHint();
    }, this.hintDelayMs);
  }

  _clearLoadTimers() {
    this._clear('indicatorTimer');
    this._clear('loadTimer');
  }

  _clear(name) {
    if (this[name] !== null) {
      this.timers.clearTimeout(this[name]);
      this[name] = null;
    }
  }
}
