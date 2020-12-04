"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromAsyncIterator = void 0;
const rxjs_1 = require("rxjs");
const asStream_1 = require("./asStream");
function fromAsyncIterator(g) {
    const _g = typeof g === "function" ? g : () => g;
    return new rxjs_1.Observable(asStream_1.asStream(_g));
}
exports.fromAsyncIterator = fromAsyncIterator;
//# sourceMappingURL=fromAsyncIterator.js.map