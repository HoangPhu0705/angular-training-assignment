import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorState } from './error-state/error-state';
import { LoadingState } from './loading-state/loading-state';
import { MissingPlanState } from './missing-plan-state/missing-plan-state';

describe('LoadingState', () => {
  it('announces a default or custom message', async () => {
    const fixture = TestBed.createComponent(LoadingState);
    await fixture.whenStable();
    const status: HTMLElement = fixture.nativeElement.querySelector('[role=status]');
    expect(status.textContent).toContain('Loading…');

    fixture.componentRef.setInput('message', 'Loading monthly plan…');
    await fixture.whenStable();
    expect(status.textContent).toContain('Loading monthly plan…');
  });
});

describe('ErrorState', () => {
  it('shows an alert with a retry button that emits retry', async () => {
    const fixture = TestBed.createComponent(ErrorState);
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);
    fixture.componentRef.setInput('title', 'Couldn’t load this plan');
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('[role=alert] h2')?.textContent).toBe('Couldn’t load this plan');
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button when not retryable', async () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('retryable', false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});

describe('MissingPlanState', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('names the period and links to monthly planning', async () => {
    const fixture = TestBed.createComponent(MissingPlanState);
    fixture.componentRef.setInput('period', { year: 2026, month: 12 });
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Monthly plan unavailable');
    expect(el.textContent).toContain('There is no monthly plan for December 2026 yet.');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/monthly-planning');
  });

  it('falls back to a generic message without a period', async () => {
    const fixture = TestBed.createComponent(MissingPlanState);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('There is no monthly plan for this period yet.');
  });
});
