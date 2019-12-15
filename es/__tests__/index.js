import { fromAsyncIterator } from "../src/index";
function* gen() {
    yield 1;
    yield 2;
    yield 3;
}
async function sleep() {
    return new Promise(r => setTimeout(r, 1000));
}
async function* gen3() {
    yield* gen2();
    yield 666;
}
async function* gen2(error) {
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
