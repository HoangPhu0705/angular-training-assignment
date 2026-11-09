import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './home-page';

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 26));
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => vi.useRealTimers());

  async function render() {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    return fixture;
  }

  it('defaults to the current month and links to its pages', async () => {
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    const hrefs = Array.from(el.querySelectorAll<HTMLAnchorElement>('.month-actions a')).map((a) =>
      a.getAttribute('href')
    );

    expect(el.querySelector<HTMLInputElement>('#home-month')?.value).toBe('2026-09');
    expect(hrefs).toEqual([
      '/monthly-plans/2026/9',
      '/monthly-plans/2026/9/spending',
      '/expenses/new?expenseDate=2026-09-01'
    ]);
  });

  it('updates the links when another month is picked', async () => {
    const fixture = await render();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#home-month');
    input.value = '2026-11';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.month-actions a')?.getAttribute('href')).toBe(
      '/monthly-plans/2026/11'
    );
  });

  it('asks for a month when the input is cleared', async () => {
    const fixture = await render();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#home-month');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.month-actions')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Select a month to continue.');
  });
});
