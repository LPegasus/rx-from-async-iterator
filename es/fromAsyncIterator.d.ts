import { Observable } from "rxjs";
export declare function fromAsyncIterator<T = unknown>(g: AsyncGenerator<T | Observable<T>, void, void> | (() => AsyncGenerator<T, void, void>)): Observable<T>;
