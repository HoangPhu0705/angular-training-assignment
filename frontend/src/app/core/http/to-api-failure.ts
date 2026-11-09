import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorResponse, ApiFailure } from '../../models/api-error.model';

export function toApiFailure(error: unknown): ApiFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'server' };
  }
  // Offline, backend down, or blocked by CORS.
  if (error.status === 0) {
    return { kind: 'network' };
  }
  const body = isApiErrorResponse(error.error) ? error.error : null;
  switch (body?.code) {
    case 'VALIDATION_ERROR':
      return { kind: 'validation', message: body.message, fieldErrors: body.errors ?? [] };
    case 'JAR_NOT_IN_MONTHLY_PLAN':
      return { kind: 'jarNotInPlan', message: body.message };
    case 'MONTHLY_PLAN_NOT_FOUND':
      return { kind: 'notFound', message: body.message };
    case 'MONTHLY_PLAN_ALREADY_EXISTS':
      return { kind: 'conflict', message: body.message };
    default:
      // Never show raw server text.
      return { kind: 'server' };
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ApiErrorResponse>;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}
