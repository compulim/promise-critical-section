'use strict';

class CriticalSection {
  constructor() {
    this._busy = false;
    this._queue = [];
  }

  enter() {
    if (this._busy || this._queue.length) {
      return new Promise(resolve => this._queue.push(resolve));
    } else {
      this._busy = true;

      return Promise.resolve();
    }
  }

  leave() {
    if (this._queue.length) {
      this._queue.shift()();
    } else {
      this._busy = false;
    }
  }
}

module.exports = CriticalSection;
