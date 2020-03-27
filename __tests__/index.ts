import { interval } from "rxjs";
import { take, mapTo, map } from "rxjs/operators";
import { fromAsyncIterator, isAsyncIteratorFunction } from "../src/index";
import { isAsyncIterator } from "./../src/index";

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
    fromAsyncIterator<string | number>(gen2())
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
    fromAsyncIterator<string | number>(gen2(err))
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
    fromAsyncIterator<string | number>(gen3())
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
    fromAsyncIterator<string | number>(gen3)
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
    }, 60);
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

it("yield Observable will be concat", done => {
  const callback = jest.fn();
  const stream$ = interval(100).pipe(take(3), mapTo("a"));

  fromAsyncIterator(async function*() {
    yield* gen();
    yield stream$;
  }).subscribe(
    callback,
    () => {},
    () => {
      expect(callback).toHaveBeenNthCalledWith(1, 1);
      expect(callback).toHaveBeenNthCalledWith(2, 2);
      expect(callback).toHaveBeenNthCalledWith(3, 3);
      expect(callback).toHaveBeenNthCalledWith(4, "a");
      expect(callback).toHaveBeenNthCalledWith(5, "a");
      expect(callback).toHaveBeenNthCalledWith(6, "a");
      done();
    }
  );
});

it("yield Observalbe with error", done => {
  const err = new Error("BOOM!");
  const callback = jest.fn();
  const completeCallback = jest.fn();
  const errCallback = jest.fn(() => {
    expect(callback).toHaveBeenNthCalledWith(1, 1);
    expect(callback).toHaveBeenNthCalledWith(2, 2);
    expect(callback).toHaveBeenNthCalledWith(3, 3);
    expect(callback).toHaveBeenNthCalledWith(4, 0);
    expect(callback).toHaveBeenNthCalledWith(5, 1);
    expect(callback).toHaveBeenCalledTimes(5);
    expect(completeCallback).toBeCalledTimes(0);
    expect(errCallback).toHaveBeenCalledWith(err);
    done();
  });
  const stream$ = interval(100).pipe(
    take(3),
    map(d => {
      if (d !== 2) {
        return d;
      }
      throw err;
    })
  );

  fromAsyncIterator(async function*() {
    yield* gen();
    yield stream$;
  }).subscribe(callback, errCallback, completeCallback);
});
