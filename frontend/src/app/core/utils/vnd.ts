// Money stays a digit string; never Number()/parseFloat.

const DIGITS = /^\d+$/;

export function groupVndDigits(value: string): string {
  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  if (!DIGITS.test(digits)) {
    return value;
  }
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `-${grouped}` : grouped;
}

export function toCanonicalDigits(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

export function isDigitString(value: string): boolean {
  return DIGITS.test(value);
}
