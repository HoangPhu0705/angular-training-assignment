import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { DigitsOnlyDirective } from './digits-only.directive';

@Component({
  imports: [ReactiveFormsModule, DigitsOnlyDirective],
  template: `<input [formControl]="amount" appDigitsOnly />`
})
class Host {
  readonly amount = new FormControl('', { nonNullable: true });
}

describe('DigitsOnlyDirective', () => {
  let host: Host;
  let input: HTMLInputElement;

  beforeEach(async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    host = fixture.componentInstance;
    input = fixture.nativeElement.querySelector('input');
  });

  function type(value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it.each([
    ['abc', ''],
    ['-1', '1'],
    ['1,250,000', '1250000'],
    ['12.5', '125']
  ])('TC_F1_004: turns %j into %j', (typed, expected) => {
    type(typed);
    expect(host.amount.value).toBe(expected);
    expect(input.value).toBe(expected);
  });

  it('leaves clean digits alone', () => {
    type('30000000');
    expect(host.amount.value).toBe('30000000');
  });
});
