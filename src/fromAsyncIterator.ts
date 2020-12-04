import { Observable } from "rxjs";
import { asStream } from "./asStream";

export function fromAsyncIterator<T = unknown>(
  g:
    | AsyncGenerator<T | Observable<T>, void, void>
    | (() => AsyncGenerator<T, void, void>)
): Observable<T> {
  const _g: () => AsyncGenerator<T | Observable<T>, void, void> =
    typeof g === "function" ? g : () => g;
  return new Observable<T>(asStream(_g));
}
