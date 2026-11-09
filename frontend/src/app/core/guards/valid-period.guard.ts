import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { parsePeriod } from '../utils/period';

export const validPeriodGuard: CanActivateFn = (route) =>
  parsePeriod(route.paramMap.get('year'), route.paramMap.get('month')) !== null ||
  inject(Router).createUrlTree(['/monthly-planning']);
