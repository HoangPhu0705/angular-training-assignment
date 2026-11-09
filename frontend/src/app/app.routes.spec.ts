import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('routes', () => {
  it('defines the application navigation routes', () => {
    expect(routes).toEqual([
      expect.objectContaining({ path: '', redirectTo: 'dashboard' }),
      expect.objectContaining({ path: 'dashboard' }),
      expect.objectContaining({ path: 'monthly-planning' }),
      expect.objectContaining({ path: 'monthly-plans/:year/:month/spending' }),
      expect.objectContaining({ path: 'monthly-plans/:year/:month' }),
      expect.objectContaining({ path: 'expenses/new' }),
      expect.objectContaining({ path: '**', redirectTo: 'monthly-planning' })
    ]);
  });

  it('lazy-loads a page component for every page route', async () => {
    const pageRoutes = routes.filter((route) => route.loadComponent);
    expect(pageRoutes).toHaveLength(5);

    for (const route of pageRoutes) {
      const component = await route.loadComponent!();
      expect(component).toBeTypeOf('function');
    }
  });

  it('guards the routes that take a year and month', () => {
    const guarded = routes.filter((route) => route.canActivate?.length).map((route) => route.path);
    expect(guarded).toEqual(['monthly-plans/:year/:month/spending', 'monthly-plans/:year/:month']);
  });
});
