export interface Period {
  year: number;
  month: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export function parsePeriod(year: string | null, month: string | null): Period | null {
  if (year === null || month === null || !/^\d{1,4}$/.test(year) || !/^\d{1,2}$/.test(month)) {
    return null;
  }
  const period = { year: Number(year), month: Number(month) };
  return period.year >= 1 && period.month >= 1 && period.month <= 12 ? period : null;
}

export function parseMonthInput(value: string): Period | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return match ? parsePeriod(match[1], match[2]) : null;
}

export function toMonthInput(period: Period): string {
  return `${String(period.year).padStart(4, '0')}-${String(period.month).padStart(2, '0')}`;
}

export function firstDayOf(period: Period): string {
  return `${toMonthInput(period)}-01`;
}

export function formatPeriod(period: Period): string {
  return `${MONTH_NAMES[period.month - 1]} ${period.year}`;
}
