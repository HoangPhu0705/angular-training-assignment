import { describe, expect, it } from 'vitest';

import { groupVndDigits, isDigitString, toCanonicalDigits } from './vnd';

describe('groupVndDigits', () => {
  it.each([
    ['0', '0'],
    ['999', '999'],
    ['1000', '1,000'],
    ['10500000', '10,500,000'],
    ['-250000', '-250,000'],
    ['9223372036854775807', '9,223,372,036,854,775,807']
  ])('formats %s as %s', (input, expected) => {
    expect(groupVndDigits(input)).toBe(expected);
  });

  it('returns unexpected input unchanged', () => {
    expect(groupVndDigits('12.5')).toBe('12.5');
    expect(groupVndDigits('')).toBe('');
  });
});

describe('toCanonicalDigits', () => {
  it.each([
    [' 030,000,000 ', '30000000'],
    ['000', '0'],
    ['abc', ''],
    ['-1', '1'],
    ['1250000', '1250000']
  ])('normalises %j to %j', (input, expected) => {
    expect(toCanonicalDigits(input)).toBe(expected);
  });
});

describe('isDigitString', () => {
  it('accepts only ASCII digits', () => {
    expect(isDigitString('123')).toBe(true);
    expect(isDigitString('-1')).toBe(false);
    expect(isDigitString('')).toBe(false);
  });
});
