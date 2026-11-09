import { Component, input } from '@angular/core';

import { Header } from '../header/header';
import { NavItem, Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-page-shell',
  imports: [Header, Sidebar],
  templateUrl: './page-shell.html',
  styleUrl: './page-shell.css'
})
export class PageShell {
  readonly activeItem = input<NavItem>();
  readonly context = input<string>();
}
