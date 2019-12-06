"use strict";
/// <reference lib="es2018.asynciterable" />
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
function fromAsyncIterator(g) {
    if (!isAsyncIterator(g)) {
        throw new TypeError("fromAsyncIterator received wrong type param.");
    }
    else {
        return new rxjs_1.Observable(function (ob) {
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
                }, function (err) { return ob.error(err); });
            };
            run();
        });
    }
}
exports.fromAsyncIterator = fromAsyncIterator;
function isAsyncIterator(g) {
    if (!Symbol.asyncIterator) {
        throw new TypeError("Symbol.asyncIterator is not defined.");
    }
    return typeof g[Symbol.asyncIterator] === "function";
}
