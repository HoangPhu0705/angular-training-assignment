export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// Local date. toISOString() is UTC, i.e. yesterday in Vietnam before 07:00.
export function todayIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  const valid = date.year >= 1 && date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= daysInMonth(date);
  return valid ? date : null;
}

function daysInMonth({ year, month }: CalendarDate): number {
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return month === 2 && leap ? 29 : DAYS_IN_MONTH[month - 1];
}
