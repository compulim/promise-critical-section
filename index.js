'use strict';

class CriticalSection {
  constructor() {
    this._busy = false;
    this._queue = [];
  }

  enter() {
    return new Promise(resolve => {
      this._queue.push(resolve);

      if (!this._busy) {
        this._busy = true;
        this._queue.shift()();
      }
    });
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
