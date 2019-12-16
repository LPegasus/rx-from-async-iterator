/// <reference lib="es2018.asynciterable" />
import { Observable } from "rxjs";
export function fromAsyncIterator(g) {
    const cancellationToken = createDefaultCancellation();
    const _g = typeof g === "function" ? g(cancellationToken.cancel) : g;
    /* istanbul ignore if */
    if (!isAsyncIterator(_g)) {
        throw new TypeError("fromAsyncIterator received wrong type param.");
    }
    else {
        return new Observable(asStream(_g, cancellationToken));
    }
}
export function createDefaultCancellation() {
    let stopped = false;
    return {
        cancel: () => {
            if (!stopped) {
                stopped = true;
            }
            else {
                console.warn("AsyncIterator already stopped.");
            }
        },
        canceled() {
            return stopped;
        }
    };
}
export function asStream(g, cancellation = {
    cancel() { },
    canceled() {
        return false;
    }
}) {
    return (ob) => {
        const run = () => {
            const result = g.next();
            result.then(i => {
                if (i.done) {
                    ob.complete();
                }
                else {
                    if (cancellation.canceled()) {
                        ob.complete();
                    }
                    else {
                        ob.next(i.value);
                        run();
                    }
                }
            }, err => {
                ob.error(err);
            });
        };
        run();
    };
}
export function isAsyncIterator(g) {
    /* istanbul ignore if */
    if (!Symbol.asyncIterator) {
        throw new TypeError("Symbol.asyncIterator is not defined.");
    }
    return typeof g[Symbol.asyncIterator] === "function";
}
