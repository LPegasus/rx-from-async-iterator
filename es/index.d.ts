/// <reference lib="es2018.asynciterable" />
import { Observable } from "rxjs";
export declare function fromAsyncIterator<T = unknown>(g: AsyncGenerator<T, void, void>): Observable<T>;
