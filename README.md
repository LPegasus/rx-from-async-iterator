[![npm version](https://badge.fury.io/js/rx-from-async-iterator.svg)](https://www.npmjs.com/package/rx-from-async-iterator)[![build](https://travis-ci.org/LPegasus/rx-from-async-iterator.svg?branch=master)](https://travis-ci.org/LPegasus/rx-from-async-iterator)[![coverage](https://img.shields.io/codecov/c/github/LPegasus/rx-from-async-iterator.svg?style=flat-square)](https://codecov.io/gh/LPegasus/rx-from-async-iterator)[![install size](https://packagephobia.now.sh/badge?p=rx-from-async-iterator)](https://packagephobia.now.sh/result?p=rx-from-async-iterator)[![MINIFIED](https://badgen.net/bundlephobia/min/rx-from-async-iterator)](https://bundlephobia.com/result?p=rx-from-async-iterator)[![MINIFIED + GZIPPED](https://badgen.net/bundlephobia/minzip/rx-from-async-iterator)](https://badgen.net/bundlephobia/min/rx-from-async-iterator)

# rx-from-async-iterator

A method to convert **AsyncGeneratorObject** to [Rx.Observable](https://rxjs.dev/guide/observable)



## Install

`npm i -S rx-from-async-iterator`



## Example

### Simple usage

```typescript
import { fromAsyncIterator } from 'rx-from-async-iterator';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

const click$ = fromEvent('click', document.body).pipe(take(2));

async function sleepOneSecond() {
  return new Promise(r => setTimeout(r, 1000));
}

async function* subTask() {
  await sleepOneSecond();
  yield "d";
  await sleepOneSecond();
  yield "e";
  await sleepOneSecond();
}

async function* taskAsync(error?: Error) {
  yield "a";
  await sleepOneSecond();
  yield "b";
  await sleepOneSecond();
  yield "c";
  yield* subTask();
  yield "f";
  yield click$;
}

fromAsyncIterator(taskAsync()).subscribe(console.log);
/// output as follows:
// -> 'a'
// -> 'b'
// -> 'c'
// -> 'd'
// -> 'e'
// -> 'f'  /// and one second duration between each letter.
// -> MouseEvent
// -> MouseEvent
```



### Real world example

Imagine we have an QRCode sign up feature to do, we need to poll an backend interface called `/check/login`

```typescript
async function* pollCheckLogin() {
  let currentStatus = 'currentStatus';
	while(currentStatus === 'pending') {
    yield currentStatus = (await fetch('/check/login').then(resp => resp.json)).status;
  }
  if (currentStatus === 'timeout') {
		yield 'timeout';
  }
  if (currentStatus === 'success') {
    yield 'login success';
    return;
  }
	throw new Error('unknown status');
}

fromAsyncIterator(pollCheckLogin()).subscribe((status) => {
  switch(status) {
    case 'timeout':
      // handle timeout
      break;
    case 'login success':
      // go to home page
      break;
    case 'pending':
      // handle pending
      break;
  }
});
```

