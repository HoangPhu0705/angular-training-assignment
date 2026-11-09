import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { planFixture } from '../../../../../testing/fixtures';
import { AllocationSummary } from './allocation-summary';

describe('AllocationSummary', () => {
  async function render() {
    const fixture = TestBed.createComponent(AllocationSummary);
    fixture.componentRef.setInput('plan', planFixture());
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('builds the donut from the jar rates and describes it for screen readers', async () => {
    const donut = (await render()).querySelector<HTMLElement>('.donut')!;

    expect(donut.getAttribute('role')).toBe('img');
    expect(donut.getAttribute('aria-label')).toBe(
      'Allocation: Living Expenses 35%, Food 20%, Children 10%, Emergency Fund 10%, Savings 10%, Investment 10%, Entertainment & Travel 5%'
    );
    expect(donut.style.background).toBe(
      'conic-gradient(var(--f1-jar-living) 0% 35%, var(--f1-jar-food) 35% 55%, var(--f1-jar-children) 55% 65%, ' +
        'var(--f1-jar-emergency) 65% 75%, var(--f1-jar-savings) 75% 85%, var(--f1-jar-investment) 85% 95%, ' +
        'var(--f1-jar-travel) 95% 100%)'
    );
  });

  it('lists every jar in the legend with its theme colour class', async () => {
    const items = (await render()).querySelectorAll('.legend-item');

    expect(items).toHaveLength(7);
    expect(items[0].querySelector('.legend-name')?.className).toContain('jar-living');
    expect(items[0].querySelector('.legend-name')?.className).toContain('legend-name');
    expect(items[6].textContent).toContain('Entertainment & Travel');
    expect(items[6].textContent).toContain('5%');
  });
});
