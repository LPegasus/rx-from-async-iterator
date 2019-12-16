/// <reference lib="es2018.asynciterable" />
import { Observable } from "rxjs";
export declare function fromAsyncIterator<T = unknown>(g: AsyncGenerator<T, void, void> | ((stop: StopCallback) => AsyncGenerator<T, void, void>)): Observable<T>;
export interface CancellationToken {
    canceled(): boolean;
    cancel(): void;
}
export declare function createDefaultCancellation(): CancellationToken;
export declare type StopCallback = () => void;
export declare function asStream<T = unknown>(g: AsyncGenerator<T, void, void>, cancellation?: CancellationToken): (ob: {
    next(result: T): void;
    complete(): void;
    error(err: any): void;
}) => void;
export declare function isAsyncIterator(g: any): g is AsyncGenerator;
