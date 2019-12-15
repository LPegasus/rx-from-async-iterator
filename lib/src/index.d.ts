/// <reference lib="es2018.asynciterable" />
import { Observable } from "rxjs";
export declare function fromAsyncIterator<T = unknown>(g: AsyncGenerator<T, void, void>): Observable<T>;
export declare function asStream<T = unknown>(g: AsyncGenerator<T, void, void>): (ob: {
    next(result: T): void;
    complete(): void;
    error(err: any): void;
}) => void;
