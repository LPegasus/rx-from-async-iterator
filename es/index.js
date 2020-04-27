import { Observable } from "rxjs";
function isObservable(value) {
    return value && typeof value.subscribe === "function";
}
export function fromAsyncIterator(g) {
    const _g = typeof g === "function" ? g : () => g;
    return new Observable(asStream(_g));
}
export function asStream(gen) {
    return (ob) => {
        const g = gen();
        const run = () => {
            const result = g.next();
            result.then((i) => {
                if (i.done === true) {
                    ob.complete();
                }
                else if (ob.closed === true || ob.isStopped === true) {
                    return;
                }
                else {
                    if (isObservable(i.value)) {
                        i.value.subscribe({
                            next(v) {
                                ob.next(v);
                            },
                            error(e) {
                                ob.error(e);
                            },
                            complete() {
                                run();
                            },
                        });
                    }
                    else {
                        ob.next(i.value);
                        run();
                    }
                }
            }, (err) => {
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
export function isAsyncIteratorFunction(g) {
    return typeof g === "function" && g.prototype && isAsyncIterator(g.prototype);
}
//# sourceMappingURL=index.js.map