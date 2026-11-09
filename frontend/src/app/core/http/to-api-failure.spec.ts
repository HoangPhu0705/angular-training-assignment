import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { toApiFailure } from './to-api-failure';

function httpError(status: number, error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('toApiFailure', () => {
  it('maps status 0 to network', () => {
    expect(toApiFailure(httpError(0, new ProgressEvent('error')))).toEqual({ kind: 'network' });
  });

  it('maps VALIDATION_ERROR with its field errors', () => {
    const fieldErrors = [{ field: 'monthlyIncomeVnd', code: 'MUST_BE_POSITIVE', message: 'Must be positive.' }];
    expect(
      toApiFailure(httpError(400, { code: 'VALIDATION_ERROR', message: 'Invalid.', errors: fieldErrors }))
    ).toEqual({
      kind: 'validation',
      message: 'Invalid.',
      fieldErrors
    });
  });

  it('defaults missing field errors to an empty list', () => {
    expect(toApiFailure(httpError(400, { code: 'VALIDATION_ERROR', message: 'Invalid.' }))).toEqual({
      kind: 'validation',
      message: 'Invalid.',
      fieldErrors: []
    });
  });

  it.each([
    [400, 'JAR_NOT_IN_MONTHLY_PLAN', 'jarNotInPlan'],
    [404, 'MONTHLY_PLAN_NOT_FOUND', 'notFound'],
    [409, 'MONTHLY_PLAN_ALREADY_EXISTS', 'conflict']
  ])('maps %i %s to %s', (status, code, kind) => {
    expect(toApiFailure(httpError(status, { code, message: 'Message.', errors: [] }))).toEqual({
      kind,
      message: 'Message.'
    });
  });

  it('maps 500, unknown codes, non-envelope bodies and non-HTTP errors to server', () => {
    expect(toApiFailure(httpError(500, { code: 'INTERNAL_ERROR', message: 'Boom', errors: [] }))).toEqual({
      kind: 'server'
    });
    expect(toApiFailure(httpError(400, { code: 'SOMETHING_NEW', message: 'x' }))).toEqual({ kind: 'server' });
    expect(toApiFailure(httpError(502, '<html>Bad gateway</html>'))).toEqual({ kind: 'server' });
    expect(toApiFailure(httpError(500, null))).toEqual({ kind: 'server' });
    expect(toApiFailure(new Error('oops'))).toEqual({ kind: 'server' });
  });
});
