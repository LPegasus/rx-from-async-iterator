/// <reference lib="es2018.asynciterable" />

import { Observable } from "rxjs";

export function fromAsyncIterator<T = unknown>(
  g: AsyncGenerator<T, void, void>
) {
  /* istanbul ignore if */
  if (!isAsyncIterator(g)) {
    throw new TypeError("fromAsyncIterator received wrong type param.");
  } else {
    return new Observable<T>(asStream(g));
  }
}

export function asStream<T = unknown>(g: AsyncGenerator<T, void, void>) {
  return (ob: {
    next(result: T): void;
    complete(): void;
    error(err: any): void;
  }) => {
    const run = () => {
      const result = g.next();
      result.then(
        i => {
          if (i.done) {
            ob.complete();
          } else {
            ob.next(i.value);
            run();
          }
        },
        err => {
          ob.error(err);
        }
      );
    };
    run();
  };
}

export function isAsyncIterator(g: any): g is AsyncGenerator {
  /* istanbul ignore if */
  if (!Symbol.asyncIterator) {
    throw new TypeError("Symbol.asyncIterator is not defined.");
  }
  return typeof g[Symbol.asyncIterator] === "function";
}
