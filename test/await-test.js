'use strict';

const assert = require('assert');
const CriticalSection = require('../index');

let currentTime = 0;

function getTime() {
  return currentTime++;
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
    let worker;
    let section;

    beforeEach(() => {
      worker = [];
      section = new CriticalSection();

      return Promise.all([
        new Promise(async (resolve) => {
          await section.enter();
          worker[0] = getTime();
          await section.leave();
          resolve();
        }),
        new Promise(async (resolve) => {
          await section.enter();
          worker[1] = getTime();
          await section.leave();
          resolve();
        }),
        new Promise(async (resolve) => {
          await section.enter();
          worker[2] = getTime();
          await section.leave();
          resolve();
        })
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
});