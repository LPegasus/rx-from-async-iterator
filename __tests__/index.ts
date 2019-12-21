import { fromAsyncIterator, isAsyncIteratorFunction } from "../src/index";
import { isAsyncIterator } from './../src/index';

function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

async function sleep(time = 16) {
  return new Promise(r => setTimeout(r, time));
}

async function* gen3() {
  yield* gen2();
  yield 666;
}

async function* gen2(error?: Error) {
  yield "a";
  await sleep();
  yield "b";
  await sleep();
  if (error) {
    throw error;
  }
  yield "c";
  yield* gen();
}

it("fromAsyncIterator", async () => {
  const callback = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  await new Promise(r => {
    fromAsyncIterator(gen2())
      .subscribe(callback, error, complete)
      .add(r);
  });
  expect(callback).toHaveBeenCalledTimes(6);
  ["a", "b", "c", 1, 2, 3].forEach((value, i) => {
    expect(callback).toHaveBeenNthCalledWith(i + 1, value);
  });
  expect(error).not.toBeCalled();
  expect(complete).toBeCalledTimes(1);
});

it("fromAsyncIterator with error", async () => {
  const callback = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const err = new Error();
  await new Promise(r => {
    fromAsyncIterator(gen2(err))
      .subscribe(callback, error, complete)
      .add(r);
  });

  expect(callback).toHaveBeenCalledTimes(2);
  ["a", "b"].forEach((value, i) => {
    expect(callback).toHaveBeenNthCalledWith(i + 1, value);
  });

  expect(error).toBeCalledWith(err);
  expect(complete).toBeCalledTimes(0);
});

it("fromAsyncIterator with sub async*", async () => {
  const callback = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  await new Promise(r => {
    fromAsyncIterator(gen3())
      .subscribe(callback, error, complete)
      .add(r);
  });
  const results = ["a", "b", "c", 1, 2, 3, 666];
  expect(callback).toHaveBeenCalledTimes(results.length);
  results.forEach((value, i) => {
    expect(callback).toHaveBeenNthCalledWith(i + 1, value);
  });
  expect(error).not.toBeCalled();
  expect(complete).toBeCalledTimes(1);
});

it("fromAsyncIterator with function", async () => {
  const callback = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  await new Promise(r => {
    fromAsyncIterator(gen3)
      .subscribe(callback, error, complete)
      .add(r);
  });
  const results = ["a", "b", "c", 1, 2, 3, 666];
  expect(callback).toHaveBeenCalledTimes(results.length);
  results.forEach((value, i) => {
    expect(callback).toHaveBeenNthCalledWith(i + 1, value);
  });
  expect(error).not.toBeCalled();
  expect(complete).toBeCalledTimes(1);
});

it("after unsubscribe should stop AsyncIterator", done => {
  let i = 0;
  const stream = fromAsyncIterator(async function*() {
    while (true) {
      await sleep(50);
      ++i;
      yield i;
    }
  });
  const subscription = stream.subscribe(d => {
    if (d === 5) {
      subscription.unsubscribe();
    }
  });
  subscription.add(() => {
    expect(i).toBe(5);
    setTimeout(() => {
      expect(i).toBe(6);
      done();
    }, 60)
  });
});

it("isAsyncIteratorFunction", () => {
  expect(isAsyncIteratorFunction(gen)).toBeFalsy();
  expect(isAsyncIteratorFunction(gen3)).toBeTruthy();
});

it("isAsyncIterator", () => {
  expect(isAsyncIterator(gen())).toBeFalsy();
  expect(isAsyncIterator(gen3())).toBeTruthy();
});