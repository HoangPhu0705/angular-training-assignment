import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appDigitsOnly]',
  host: { '(input)': 'onInput()' }
})
export class DigitsOnlyDirective {
  private readonly ngControl = inject(NgControl);
  private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  protected onInput(): void {
    const digits = this.input.value.replace(/\D/g, '');
    if (digits !== this.input.value) {
      this.ngControl.control?.setValue(digits);
    }
  }
}
