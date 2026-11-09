import { Component, input } from '@angular/core';

import { DefaultJar } from '../../../../models/budget-plan.model';
import { JarCard } from '../../../../shared/components/jar-card/jar-card';

@Component({
  selector: 'app-default-jar-list',
  imports: [JarCard],
  template: `
    <ul aria-label="Default jar allocation" class="allocation-grid">
      @for (jar of jars(); track jar.jarType) {
        <li>
          <app-jar-card [jarType]="jar.jarType" [name]="jar.name" [percentage]="jar.percentage" />
        </li>
      }
    </ul>
  `,
  styles: `
    .allocation-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    @media (max-width: 560px) {
      .allocation-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
    }
  `
})
export class DefaultJarList {
  readonly jars = input.required<DefaultJar[]>();
}
