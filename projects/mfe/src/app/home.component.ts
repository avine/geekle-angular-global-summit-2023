import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibService } from 'lib';

@Component({
  selector: 'mfe-home',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, RouterLink],
  template: `
    <h3>
      Service data consumed from the Micro-Frontend application:<br />
      {{ data$ | async | json }}
    </h3>

    <a routerLink="/">Go to home</a> | <a routerLink="./dummy">Dummy</a>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected data$ = inject(LibService).data$;
}
