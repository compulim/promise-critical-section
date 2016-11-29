'use strict';

class ReleaseCounter {
  constructor() {
    this._current = 0;
    this._pending = [];
  }

  async waitFor(counter) {
    return new Promise(resolve => {
      this._pending[counter] = resolve;

      while (this._pending[this._current]) {
        const nextResolve = this._pending[this._current];

        this._pending[this._current] = null;

        (process.nextTick || setImmediate)(nextResolve);

        this._current++;
      }
    });
  }
}

module.exports = ReleaseCounter;
