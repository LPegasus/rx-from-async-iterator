import { Observable } from "rxjs";

export function fromAsyncIterator<T = unknown>(
  g: AsyncGenerator<T, void, void> | (() => AsyncGenerator<T, void, void>)
): Observable<T> {
  const _g: () => AsyncGenerator<T, void, void> =
    typeof g === "function" ? g : () => g;
  return new Observable<T>(asStream(_g));
}

export interface CancellationToken {
  canceled(): boolean;
  cancel(): void;
}

export function asStream<T = unknown>(
  gen: () => AsyncGenerator<T, void, void>
) {
  return (ob: any) => {
    const g = gen();
    const run = () => {
      const result = g.next();
      result.then(
        i => {
          if (i.done === true) {
            ob.complete();
          } else if (ob.closed === true || ob.isStopped === true) {
            return;
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


export function isAsyncIteratorFunction(g: any): g is AsyncGeneratorFunction {
  return typeof g === "function" && g.prototype && isAsyncIterator(g.prototype);
}
