import { describe, expect, it } from 'vitest';

import { VndPipe } from './vnd.pipe';

describe('VndPipe', () => {
  const pipe = new VndPipe();

  it('formats digit strings as grouped VND', () => {
    expect(pipe.transform('10500000')).toBe('10,500,000 VND');
    expect(pipe.transform('0')).toBe('0 VND');
    expect(pipe.transform('-250000')).toBe('-250,000 VND');
  });

  it('renders nothing for missing values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
