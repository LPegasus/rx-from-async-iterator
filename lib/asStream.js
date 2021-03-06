"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIteratorFunction = exports.isAsyncIterator = exports.asStream = void 0;
function asStream(gen) {
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
exports.asStream = asStream;
function isAsyncIterator(g) {
    /* istanbul ignore if */
    if (!Symbol.asyncIterator) {
        throw new TypeError("Symbol.asyncIterator is not defined.");
    }
    return typeof g[Symbol.asyncIterator] === "function";
}
exports.isAsyncIterator = isAsyncIterator;
function isAsyncIteratorFunction(g) {
    return typeof g === "function" && g.prototype && isAsyncIterator(g.prototype);
}
exports.isAsyncIteratorFunction = isAsyncIteratorFunction;
function isObservable(value) {
    return value && typeof value.subscribe === "function";
}
//# sourceMappingURL=asStream.js.map