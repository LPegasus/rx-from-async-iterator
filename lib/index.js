"use strict";
/// <reference lib="es2018.asynciterable" />
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
function fromAsyncIterator(g) {
    var cancellationToken = createDefaultCancellation();
    var _g = typeof g === "function" ? g(cancellationToken.cancel) : g;
    /* istanbul ignore if */
    if (!isAsyncIterator(_g)) {
        throw new TypeError("fromAsyncIterator received wrong type param.");
    }
    else {
        return new rxjs_1.Observable(asStream(_g, cancellationToken));
    }
}
exports.fromAsyncIterator = fromAsyncIterator;
function createDefaultCancellation() {
    var stopped = false;
    return {
        cancel: function () {
            if (!stopped) {
                stopped = true;
            }
            else {
                console.warn("AsyncIterator already stopped.");
            }
        },
        canceled: function () {
            return stopped;
        }
    };
}
exports.createDefaultCancellation = createDefaultCancellation;
function asStream(g, cancellation) {
    return function (ob) {
        var run = function () {
            var result = g.next();
            result.then(function (i) {
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
            }, function (err) {
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
