import { Observable, OperatorFunction, catchError, map, of, startWith } from 'rxjs';

import { ApiFailure, LoadState } from '../../models/api-error.model';

export function toLoadState<T>(): OperatorFunction<T, LoadState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data): LoadState<T> => ({ status: 'success', data })),
      catchError((failure: ApiFailure) => of<LoadState<T>>({ status: 'error', failure })),
      startWith<LoadState<T>>({ status: 'loading' })
    );
}
