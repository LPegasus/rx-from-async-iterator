import { Observable } from "rxjs";
import { asStream } from "./asStream";
export function fromAsyncIterator(g) {
    const _g = typeof g === "function" ? g : () => g;
    return new Observable(asStream(_g));
}
//# sourceMappingURL=fromAsyncIterator.js.map