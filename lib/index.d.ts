import { Observable } from "rxjs";
export declare function fromAsyncIterator<T = unknown>(g: AsyncGenerator<T, void, void> | (() => AsyncGenerator<T, void, void>)): Observable<T>;
export interface CancellationToken {
    canceled(): boolean;
    cancel(): void;
}
export declare function asStream<T = unknown>(gen: () => AsyncGenerator<T, void, void>): (ob: any) => void;
export declare function isAsyncIterator(g: any): g is AsyncGenerator;
export declare function isAsyncIteratorFunction(g: any): g is AsyncGeneratorFunction;
