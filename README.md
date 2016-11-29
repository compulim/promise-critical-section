promise-critical-section
========================

Allows only one asynchronous operation to run every time.

Although JavaScript is single-threaded, there are times you may want to limit number of asynchronous operation to enter a block simultaneously. For example,
* Pooling a single resource
* Running a series of asynchronous steps one-by-one

How to use
----------

In the code below, `Step 1A` and `Step 1B` will be run serially regardless of race condition from `Step 2`.

```js
import CriticalSection from 'promise-critical-section';

const section = new CriticalSection();

Promise.race([
  section.enter()
    .then(() => {
      // do something that is limited to one asynchoronous operation
      console.log('Step 1A');
    })
    .then(() => {
      // do another thing
      console.log('Step 1B');
    })
    .then(() => section.leave()),
  section.enter()
    .then(() => {
      // do something in the critical section
      console.log('Step 2');
    })
    .then(() => section.leave())
])
```

You can also write it with ES7 async/await. The following example maybe a bit exaggerated.

```js
return Promise.all([
  (async () => {
    await section.enter();
    console.log('Step 1A');
    console.log('Step 1B');
    await section.leave();
  })(),
  (async () => {
    await section.enter();
    console.log('Step 2');
    await section.leave();
  })()
]);
```

Contributions
-------------
Like us? Please [star](star) us or give us [suggestions](issues).

Please file an [issue](issues) to us with minimal repro.
