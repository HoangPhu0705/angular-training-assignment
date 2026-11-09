import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { parseIsoDate } from '../../core/utils/date';
import { parseMonthInput } from '../../core/utils/period';
import { toCanonicalDigits } from '../../core/utils/vnd';

// Empty values pass, so Validators.required reports them.

// Backend uses Int64; 18 digits always fits.
const MAX_VND_DIGITS = 18;

export const positiveWholeVnd: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const value = control.value ?? '';
  if (value === '') {
    return null;
  }
  if (!/^\d+$/.test(value)) {
    return { wholeVnd: true };
  }
  const canonical = toCanonicalDigits(value);
  if (canonical === '0') {
    return { positive: true };
  }
  return canonical.length > MAX_VND_DIGITS ? { tooLarge: true } : null;
};

export const notBlank: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const value = control.value ?? '';
  return value !== '' && value.trim() === '' ? { blank: true } : null;
};

export const isoDate: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const value = control.value ?? '';
  return value === '' || parseIsoDate(value) ? null : { isoDate: true };
};

export const monthInput: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const value = control.value ?? '';
  return value === '' || parseMonthInput(value) ? null : { monthInput: true };
};
