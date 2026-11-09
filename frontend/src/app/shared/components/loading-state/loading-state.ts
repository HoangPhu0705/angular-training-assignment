import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    <div class="loading" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span>{{ message() }}</span>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      min-height: 160px;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--f1-slate);
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid var(--f1-grey);
      border-top-color: var(--f1-navy);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }
  `
})
export class LoadingState {
  readonly message = input('Loading…');
}
