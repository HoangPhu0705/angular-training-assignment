import { Routes } from '@angular/router';

import { validPeriodGuard } from './core/guards/valid-period.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Home · Family Finance',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage)
  },
  {
    path: 'monthly-planning',
    title: 'Monthly planning · Family Finance',
    loadComponent: () => import('./features/monthly-planning/monthly-planning-page').then((m) => m.MonthlyPlanningPage)
  },
  {
    path: 'monthly-plans/:year/:month/spending',
    title: 'Spending by jar · Family Finance',
    canActivate: [validPeriodGuard],
    loadComponent: () => import('./features/spending-by-jar/spending-by-jar-page').then((m) => m.SpendingByJarPage)
  },
  {
    path: 'monthly-plans/:year/:month',
    title: 'Month budget summary · Family Finance',
    canActivate: [validPeriodGuard],
    loadComponent: () =>
      import('./features/income-allocation/income-allocation-page').then((m) => m.IncomeAllocationPage)
  },
  {
    path: 'expenses/new',
    title: 'Add an expense · Family Finance',
    loadComponent: () => import('./features/expenses/add-expense-page').then((m) => m.AddExpensePage)
  },
  { path: '**', redirectTo: 'monthly-planning' }
];
