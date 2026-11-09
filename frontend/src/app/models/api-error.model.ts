export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  errors: ApiFieldError[];
}

// Pages switch on `kind`, never on HTTP status codes.
export type ApiFailure =
  | { kind: 'validation'; message: string; fieldErrors: ApiFieldError[] }
  | { kind: 'jarNotInPlan'; message: string }
  | { kind: 'notFound'; message: string }
  | { kind: 'conflict'; message: string }
  | { kind: 'invalidData' }
  | { kind: 'network' }
  | { kind: 'server' };

export type LoadState<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; failure: ApiFailure };
