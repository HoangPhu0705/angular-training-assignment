import { Pipe, PipeTransform } from '@angular/core';

import { groupVndDigits } from '../../core/utils/vnd';

@Pipe({ name: 'vnd' })
export class VndPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? `${groupVndDigits(value)} VND` : '';
  }
}
