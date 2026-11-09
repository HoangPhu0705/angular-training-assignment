import { describe, expect, it } from 'vitest';

import { parseIsoDate, todayIsoDate } from './date';

describe('todayIsoDate', () => {
  it('uses the local calendar date, zero-padded', () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 1, 30))).toBe('2026-01-05');
    expect(todayIsoDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
});

describe('parseIsoDate', () => {
  it('parses real dates', () => {
    expect(parseIsoDate('2026-09-26')).toEqual({ year: 2026, month: 9, day: 26 });
    expect(parseIsoDate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
    expect(parseIsoDate('2000-02-29')).toEqual({ year: 2000, month: 2, day: 29 });
  });

  it.each(['', '2026-9-26', '2026-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-00-10', '0000-01-01'])(
    'rejects %j',
    (value) => {
      expect(parseIsoDate(value)).toBeNull();
    }
  );
});
