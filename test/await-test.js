'use strict';

const assert = require('assert');
const CriticalSection = require('../index');
const ReleaseCounter = require('./releaseCounter');

let currentTime = 0;

function getTime() {
  return currentTime++;
}

function delay(interval = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  });
}

describe('CriticalSection using async', () => {
  context('single enter', () => {
    let entered;
    let section;

    beforeEach(async () => {
      entered = false;
      section = new CriticalSection();

      await section.enter();

      entered = true;
    });

    it('should enter successfully', () => {
      assert.equal(true, entered);
    });
  });

  context('enter twice simultaneously', () => {
    let counter;
    let section;
    let worker;

    beforeEach(() => {
      counter = new ReleaseCounter();
      section = new CriticalSection();
      worker = [];

      return Promise.all([
        (async () => {
          await counter.waitFor(0); // make sure this op enter first
          await section.enter();
          await counter.waitFor(3); // make sure 1 and 2 are blocking enter
          worker[0] = getTime();
          await section.leave();
        })(),
        (async () => {
          await counter.waitFor(1);
          await section.enter();
          worker[1] = getTime();
          await section.leave();
        })(),
        (async () => {
          await counter.waitFor(2);
          await section.enter();
          worker[2] = getTime();
          await section.leave();
        })()
      ]);
    });

    it('should have entered 3 times',                   () => assert.equal(3, worker.length));
    it('should let worker 1 enter first then worker 2', () => assert(worker[0] < worker[1]));
    it('should let worker 2 enter first then worker 3', () => assert(worker[1] < worker[2]));
  });

  context('enter twice in serial', () => {
    let worker;
    let section;

    beforeEach(async () => {
      worker = [];
      section = new CriticalSection();

      await section.enter();
      worker[0] = getTime();
      await section.leave();

      await section.enter();
      worker[1] = getTime();
      await section.leave();
    });

    it('should have entered twice',                     () => assert.equal(2, worker.length));
    it('should let worker 1 enter first then worker 2', () => assert(worker[0] < worker[1]));
  });

  context('only one operation can enter', () => {
    let counter;
    let log;
    let section;

    beforeEach(async () => {
      counter = new ReleaseCounter();
      log = '';
      section = new CriticalSection();

      return Promise.all([
        (async () => {
          await section.enter();
          await counter.waitFor(0); // make sure this op enter first
          log += 'E1';
          await counter.waitFor(2); // make sure 1 is blocking on enter
          log += 'L1';
          await section.leave();
        })(),
        (async () => {
          await counter.waitFor(1); // make sure 1 is in the block
          assert.equal('E1', log);
          await section.enter();
          assert.equal('E1L1', log);
          log += 'E2';
          log += 'L2';
          await section.leave();
        })()
      ]);
    });

    it('should allow only one operation at a time', () => assert.equal(log, 'E1L1E2L2'));
  });

  context('race condition', () => {
    const numRaces = 100;
    let logs;
    let section;

    beforeEach(async () => {
      logs = [];
      section = new CriticalSection();

      const tasks = [];

      for (let i = 0; i < numRaces; i++) {
        tasks.push(async () => {
          await section.enter();
          logs.push(`E${ i }`);
          await delay(1);
          logs.push(`L${ i }`);
          await section.leave();
        });
      }

      return Promise.all(tasks.map(task => task()));
    });

    it('should allow only one operation at a time', () => {
      for (let i = 0; i < numRaces; i++) {
        assert(logs[i * 2] === `E${ i }`);
        assert(logs[i * 2 + 1] === `L${ i }`);
      }
    });
  });
});
