'use strict';

class CriticalSection {
  constructor(options = { Promise: Promise }) {
    this._busy = false;
    this._options = options;
    this._queue = [];
  }

  enter() {
    return new (this._options.Promise)(resolve => {
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
