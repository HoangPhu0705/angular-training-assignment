import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SpendingByJar } from '../../../../models/spending.model';
import { SpendingRow } from './spending-row';

describe('SpendingRow', () => {
  async function render(overrides: Partial<SpendingByJar> = {}) {
    const fixture = TestBed.createComponent(SpendingRow);
    fixture.componentRef.setInput('jar', {
      jarType: 'food',
      jarName: 'Food',
      percentageUsed: 64,
      plannedBudgetVnd: '5000000',
      spentBudgetVnd: '3200000',
      ...overrides
    } satisfies SpendingByJar);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const bar = el.querySelector<HTMLElement>('[role=progressbar]')!;
    const fill = el.querySelector<HTMLElement>('.fill')!;
    return { el, bar, fill };
  }

  it('shows the amounts, percentage and a matching bar', async () => {
    const { el, bar, fill } = await render();

    expect(el.classList).toContain('jar-food');
    expect(el.querySelector('.percentage')?.textContent).toBe('64%');
    expect(el.querySelector('small')?.textContent).toBe('3,200,000 VND spent of 5,000,000 VND');
    expect(fill.style.width).toBe('64%');
    expect(bar.getAttribute('aria-valuenow')).toBe('64');
    expect(bar.getAttribute('aria-label')).toBe('Food: 3,200,000 of 5,000,000 VND spent, 64% used');
    expect(el.querySelector('.badge-over')).toBeNull();
  });

  it('shows the real percentage over 100 but caps the bar, and says over budget', async () => {
    const { el, bar, fill } = await render({
      percentageUsed: 102.86,
      spentBudgetVnd: '9000000',
      plannedBudgetVnd: '8750000'
    });

    expect(el.querySelector('.percentage')?.textContent).toBe('102.86%');
    expect(fill.style.width).toBe('100%');
    expect(fill.classList).toContain('over');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(bar.getAttribute('aria-label')).toContain('102.86% used, over budget');
    expect(el.classList).toContain('over-budget');
    expect(el.querySelector('.badge-over')?.textContent).toBe('Over budget');
  });

  it('does not mark exactly 100% as over budget', async () => {
    const { el } = await render({ percentageUsed: 100, spentBudgetVnd: '5000000' });
    expect(el.classList).not.toContain('over-budget');
    expect(el.querySelector('.badge-over')).toBeNull();
  });

  it('shows zero spending as 0% with an empty bar', async () => {
    const { el, fill } = await render({ percentageUsed: 0, spentBudgetVnd: '0', plannedBudgetVnd: '2500000' });

    expect(el.querySelector('.percentage')?.textContent).toBe('0%');
    expect(el.querySelector('small')?.textContent).toBe('0 VND spent of 2,500,000 VND');
    expect(fill.style.width).toBe('0%');
  });

  it('rounds the shown percentage to two decimals', async () => {
    const { el } = await render({ percentageUsed: 33.3333 });
    expect(el.querySelector('.percentage')?.textContent).toBe('33.33%');
  });
});
