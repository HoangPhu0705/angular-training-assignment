import { Component, computed, input } from '@angular/core';

import { JarType } from '../../../models/budget-plan.model';
import { VndPipe } from '../../pipes/vnd.pipe';
import { JAR_THEME } from '../../jar-theme';
import { JarIcon } from '../jar-icon/jar-icon';

@Component({
  selector: 'app-jar-card',
  imports: [JarIcon, VndPipe],
  host: { '[class]': 'themeClass()' },
  templateUrl: './jar-card.html',
  styleUrl: './jar-card.css'
})
export class JarCard {
  readonly jarType = input.required<JarType>();
  readonly name = input.required<string>();
  readonly percentage = input.required<number>();
  readonly budgetVnd = input<string>();

  protected readonly themeClass = computed(() => JAR_THEME[this.jarType()].cssClass);
}
