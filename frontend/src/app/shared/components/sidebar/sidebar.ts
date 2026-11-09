import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type NavItem = 'home' | 'planning' | 'expenses';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  // Not routerLinkActive: "Planning" must also be active on /monthly-plans/...
  readonly activeItem = input<NavItem>();
}
