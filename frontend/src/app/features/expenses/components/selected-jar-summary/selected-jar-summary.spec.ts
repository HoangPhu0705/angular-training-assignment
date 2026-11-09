import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { planFixture } from '../../../../../testing/fixtures';
import { SelectedJarSummary } from './selected-jar-summary';

describe('SelectedJarSummary', () => {
  async function render(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(SelectedJarSummary);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('asks for a jar when none is selected', async () => {
    const el = await render();
    expect(el.querySelector('.jar-summary.empty')?.textContent).toContain('Select a jar');
    expect(el.querySelector('.figures')).toBeNull();
  });

  it('shows the selected jar with its plan budget before saving', async () => {
    const food = planFixture().jars[1];
    const el = await render({ jar: food });

    expect(el.querySelector('.jar-summary')?.classList).toContain('jar-food');
    expect(el.querySelector('.jar-summary')?.textContent).toContain('Food');
    expect(el.querySelector('.jar-summary')?.textContent).toContain('20% of monthly income');
    expect(el.querySelector('.figures')?.textContent).toContain('6,000,000 VND');
    expect(el.querySelector('.remaining')).toBeNull();
  });
});
