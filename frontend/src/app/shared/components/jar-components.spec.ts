import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { JarType } from '../../models/budget-plan.model';
import { JarCard } from './jar-card/jar-card';
import { JarIcon } from './jar-icon/jar-icon';
import { ProgressBar } from './progress-bar/progress-bar';

const ALL_JAR_TYPES: JarType[] = [
  'livingExpenses',
  'food',
  'children',
  'emergencyFund',
  'savings',
  'investment',
  'entertainmentAndTravel'
];

describe('JarIcon', () => {
  it.each(ALL_JAR_TYPES)('renders an SVG for %s, hidden from screen readers', async (jarType) => {
    const fixture = TestBed.createComponent(JarIcon);
    fixture.componentRef.setInput('jarType', jarType);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('svg')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });
});

describe('JarCard', () => {
  async function render(budgetVnd?: string) {
    const fixture = TestBed.createComponent(JarCard);
    fixture.componentRef.setInput('jarType', 'food');
    fixture.componentRef.setInput('name', 'Food');
    fixture.componentRef.setInput('percentage', 20);
    if (budgetVnd !== undefined) {
      fixture.componentRef.setInput('budgetVnd', budgetVnd);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows name and rate with the jar theme, but no money when no budget is given (F1)', async () => {
    const el = await render();
    expect(el.classList).toContain('jar-food');
    expect(el.querySelector('.jar-name')?.textContent).toBe('Food');
    expect(el.querySelector('.jar-rate')?.textContent).toBe('20%');
    expect(el.querySelector('.jar-amount')).toBeNull();
  });

  it('shows the backend budget exactly as given (F2)', async () => {
    const el = await render('6000000');
    expect(el.querySelector('.jar-amount')?.textContent).toBe('6,000,000 VND');
    expect(el.querySelector<HTMLElement>('.meter span')?.style.width).toBe('20%');
  });
});

describe('ProgressBar', () => {
  it('exposes value and label to assistive tech and sizes the fill', async () => {
    const fixture = TestBed.createComponent(ProgressBar);
    fixture.componentRef.setInput('value', 64);
    fixture.componentRef.setInput('label', 'Food: 64% used');
    await fixture.whenStable();
    const bar: HTMLElement = fixture.nativeElement.querySelector('[role=progressbar]');
    const fill: HTMLElement = fixture.nativeElement.querySelector('.fill');

    expect(bar.getAttribute('aria-valuenow')).toBe('64');
    expect(bar.getAttribute('aria-label')).toBe('Food: 64% used');
    expect(fill.style.width).toBe('64%');
    expect(fill.classList).not.toContain('over');
  });

  it('marks over-budget', async () => {
    const fixture = TestBed.createComponent(ProgressBar);
    fixture.componentRef.setInput('value', 100);
    fixture.componentRef.setInput('label', 'Living Expenses: 102.86% used, over budget');
    fixture.componentRef.setInput('over', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.fill').classList).toContain('over');
  });
});
