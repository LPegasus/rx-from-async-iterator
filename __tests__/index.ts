import { fromAsyncIterator } from "../src/index";

function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

async function sleep() {
  return new Promise(r => setTimeout(r, 1000));
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
