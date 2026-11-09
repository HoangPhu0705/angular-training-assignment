import { firstValueFrom, of, throwError, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { ApiFailure } from '../../models/api-error.model';
import { toLoadState } from './to-load-state';

describe('toLoadState', () => {
  it('emits loading then success', async () => {
    const states = await firstValueFrom(of(42).pipe(toLoadState(), toArray()));
    expect(states).toEqual([{ status: 'loading' }, { status: 'success', data: 42 }]);
  });

  it('emits loading then error with the failure', async () => {
    const failure: ApiFailure = { kind: 'notFound', message: 'No plan.' };
    const states = await firstValueFrom(throwError(() => failure).pipe(toLoadState(), toArray()));
    expect(states).toEqual([{ status: 'loading' }, { status: 'error', failure }]);
  });
});
