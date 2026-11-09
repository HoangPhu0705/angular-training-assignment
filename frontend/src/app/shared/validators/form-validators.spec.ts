import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { isoDate, monthInput, notBlank, positiveWholeVnd } from './form-validators';

const errorsFor = (validator: typeof positiveWholeVnd, value: string | null) => validator(new FormControl(value));

describe('positiveWholeVnd', () => {
  it('leaves empty values to Validators.required', () => {
    expect(errorsFor(positiveWholeVnd, '')).toBeNull();
    expect(errorsFor(positiveWholeVnd, null)).toBeNull();
  });

  it('accepts positive whole amounts, including the 1 VND boundary', () => {
    expect(errorsFor(positiveWholeVnd, '1')).toBeNull();
    expect(errorsFor(positiveWholeVnd, '30000000')).toBeNull();
    expect(errorsFor(positiveWholeVnd, '999999999999999999')).toBeNull();
  });

  it('rejects zero, non-digits and amounts too large for the backend', () => {
    expect(errorsFor(positiveWholeVnd, '0')).toEqual({ positive: true });
    expect(errorsFor(positiveWholeVnd, '000')).toEqual({ positive: true });
    expect(errorsFor(positiveWholeVnd, '1.5')).toEqual({ wholeVnd: true });
    expect(errorsFor(positiveWholeVnd, '-1')).toEqual({ wholeVnd: true });
    expect(errorsFor(positiveWholeVnd, '1000000000000000000')).toEqual({ tooLarge: true });
  });
});

describe('notBlank', () => {
  it('rejects whitespace-only text only', () => {
    expect(errorsFor(notBlank, '   ')).toEqual({ blank: true });
    expect(errorsFor(notBlank, ' groceries ')).toBeNull();
    expect(errorsFor(notBlank, '')).toBeNull();
  });
});

describe('isoDate', () => {
  it('accepts real dates and empty values', () => {
    expect(errorsFor(isoDate, '2028-02-29')).toBeNull();
    expect(errorsFor(isoDate, '')).toBeNull();
  });

  it('rejects impossible dates', () => {
    expect(errorsFor(isoDate, '2026-02-30')).toEqual({ isoDate: true });
  });
});

describe('monthInput', () => {
  it('accepts YYYY-MM and empty values', () => {
    expect(errorsFor(monthInput, '2026-09')).toBeNull();
    expect(errorsFor(monthInput, '')).toBeNull();
  });

  it('rejects other text (e.g. Safari falls back to a text box)', () => {
    expect(errorsFor(monthInput, 'Sept 2026')).toEqual({ monthInput: true });
  });
});
