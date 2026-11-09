import { describe, expect, it } from 'vitest';

import { firstDayOf, formatPeriod, parseMonthInput, parsePeriod, toMonthInput } from './period';

describe('parsePeriod', () => {
  it('parses valid route params', () => {
    expect(parsePeriod('2026', '9')).toEqual({ year: 2026, month: 9 });
    expect(parsePeriod('1', '12')).toEqual({ year: 1, month: 12 });
    expect(parsePeriod('9999', '01')).toEqual({ year: 9999, month: 1 });
  });

  it.each([
    [null, '9'],
    ['2026', null],
    ['abc', '9'],
    ['2026', '13'],
    ['2026', '0'],
    ['0', '9'],
    ['10000', '9'],
    ['2026', '1.5'],
    ['-2026', '9']
  ])('rejects year=%j month=%j', (year, month) => {
    expect(parsePeriod(year, month)).toBeNull();
  });
});

describe('parseMonthInput', () => {
  it('parses YYYY-MM', () => {
    expect(parseMonthInput('2026-09')).toEqual({ year: 2026, month: 9 });
  });

  it('rejects other formats', () => {
    expect(parseMonthInput('')).toBeNull();
    expect(parseMonthInput('2026-9')).toBeNull();
    expect(parseMonthInput('2026-13')).toBeNull();
    expect(parseMonthInput('September 2026')).toBeNull();
  });
});

describe('formatting', () => {
  it('formats a period for display and for inputs', () => {
    expect(formatPeriod({ year: 2026, month: 9 })).toBe('September 2026');
    expect(toMonthInput({ year: 2026, month: 9 })).toBe('2026-09');
    expect(firstDayOf({ year: 2026, month: 11 })).toBe('2026-11-01');
  });
});
