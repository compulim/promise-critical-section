'use strict';

const assert = require('assert');
const CriticalSection = require('../index');

let currentTime = 0;

function getTime() {
  return currentTime++;
}

describe('CriticalSection', () => {
  context('single enter', () => {
    let entered;
    let section;

    beforeEach(() => {
      entered = false;
      section = new CriticalSection();

      return section.enter().then(() => entered = true);
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
        section.enter()
          .then(() => worker[0] = getTime())
          .then(() => section.leave()),
        section.enter()
          .then(() => worker[1] = getTime())
          .then(() => section.leave()),
        section.enter()
          .then(() => worker[2] = getTime())
          .then(() => section.leave())
      ]);
    });

    it('should have entered 3 times',                   () => assert.equal(3, worker.length));
    it('should let worker 1 enter first then worker 2', () => assert(worker[0] < worker[1]));
    it('should let worker 2 enter first then worker 3', () => assert(worker[1] < worker[2]));
  });

  context('enter twice in serial', () => {
    let worker;
    let section;

    beforeEach(() => {
      worker = [];
      section = new CriticalSection();

      return section.enter()
        .then(() => worker[0] = getTime())
        .then(() => section.leave())
        .then(() => section.enter())
        .then(() => worker[1] = getTime())
        .then(() => section.leave());
    });

    it('should have entered twice',                     () => assert.equal(2, worker.length));
    it('should let worker 1 enter first then worker 2', () => assert(worker[0] < worker[1]));
  });
});