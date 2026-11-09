import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { Header } from './header/header';
import { PageShell } from './page-shell/page-shell';
import { Sidebar } from './sidebar/sidebar';

describe('Header', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('shows the brand linking home and no context by default', async () => {
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a.brand')?.getAttribute('href')).toBe('/monthly-planning');
    expect(el.querySelector('.header-context')).toBeNull();
  });

  it('shows the context label when given', async () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('context', 'Expenses');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.header-context')?.textContent).toBe('Expenses');
  });
});

describe('Sidebar', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('links to the three areas and highlights the active one', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('activeItem', 'planning');
    await fixture.whenStable();
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a.nav-item'));

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/monthly-planning',
      '/expenses/new'
    ]);
    const active = links.filter((link) => link.classList.contains('active'));
    expect(active.map((link) => link.textContent?.trim())).toEqual(['Planning']);
    expect(active[0].getAttribute('aria-current')).toBe('page');
  });
});

@Component({
  imports: [PageShell],
  template: `<app-page-shell activeItem="expenses" context="Expenses"><h1>Projected title</h1></app-page-shell>`
})
class ShellHost {}

describe('PageShell', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('renders header, sidebar and the projected page content inside <main>', async () => {
    const fixture = TestBed.createComponent(ShellHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-header .header-context')?.textContent).toBe('Expenses');
    expect(el.querySelector('app-sidebar a.active')?.textContent).toContain('Add Expense');
    expect(el.querySelector('main h1')?.textContent).toBe('Projected title');
  });
});
