import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { validPeriodGuard } from './valid-period.guard';

@Component({ template: 'plan page' })
class PlanStub {}

@Component({ template: 'planning page' })
class PlanningStub {}

describe('validPeriodGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'monthly-planning', component: PlanningStub },
          { path: 'monthly-plans/:year/:month', component: PlanStub, canActivate: [validPeriodGuard] }
        ])
      ]
    });
  });

  it('lets a valid period through', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/monthly-plans/2026/9');
    expect(TestBed.inject(Router).url).toBe('/monthly-plans/2026/9');
    expect(harness.routeNativeElement?.textContent).toContain('plan page');
  });

  it.each(['/monthly-plans/abc/9', '/monthly-plans/2026/13', '/monthly-plans/2026/0'])(
    'redirects %s to /monthly-planning',
    async (url) => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url);
      expect(TestBed.inject(Router).url).toBe('/monthly-planning');
    }
  );
});
