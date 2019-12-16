/// <reference lib="es2018.asynciterable" />

import { Observable } from "rxjs";

export function fromAsyncIterator<T = unknown>(
  g:
    | AsyncGenerator<T, void, void>
    | ((stop: StopCallback) => AsyncGenerator<T, void, void>)
) {
  const cancellationToken = createDefaultCancellation();
  const _g: AsyncGenerator<T, void, void> =
    typeof g === "function" ? g(cancellationToken.cancel) : g;
  /* istanbul ignore if */
  if (!isAsyncIterator(_g)) {
    throw new TypeError("fromAsyncIterator received wrong type param.");
  } else {
    return new Observable<T>(asStream(_g, cancellationToken));
  }
}

export interface CancellationToken {
  canceled(): boolean;
  cancel(): void;
}

export function createDefaultCancellation(): CancellationToken {
  let stopped = false;
  return {
    cancel: () => {
      if (!stopped) {
        stopped = true;
      } else {
        console.warn("AsyncIterator already stopped.");
      }
    },
    canceled() {
      return stopped;
    }
  };
}

export type StopCallback = () => void;

export function asStream<T = unknown>(
  g: AsyncGenerator<T, void, void>,
  cancellation: CancellationToken = {
    cancel() {},
    canceled() {
      return false;
    }
  }
) {
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
            if (cancellation.canceled()) {
              ob.complete();
            } else {
              ob.next(i.value);
              run();
            }
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
