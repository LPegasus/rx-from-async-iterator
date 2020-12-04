import type { Observable } from 'rxjs';
export declare function asStream<T = unknown>(gen: () => AsyncGenerator<T | Observable<T>, void, void>): (ob: any) => void;
export declare function isAsyncIterator(g: any): g is AsyncGenerator;
export declare function isAsyncIteratorFunction(g: any): g is AsyncGeneratorFunction;
