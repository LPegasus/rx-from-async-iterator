"use strict";
/// <reference lib="es2018.asynciterable" />
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
function fromAsyncIterator(g) {
    /* istanbul ignore if */
    if (!isAsyncIterator(g)) {
        throw new TypeError("fromAsyncIterator received wrong type param.");
    }
    else {
        return new rxjs_1.Observable(asStream(g));
    }
}
exports.fromAsyncIterator = fromAsyncIterator;
function asStream(g) {
    return function (ob) {
        var run = function () {
            var result = g.next();
            result.then(function (i) {
                if (i.done) {
                    ob.complete();
                }
                else {
                    ob.next(i.value);
                    run();
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
