import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedService } from '@demo/shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, RouterLink],
  template: `
    <h3>Data exposed to Remote 1: {{ data$ | async | json }}</h3>

    <a routerLink="/">Home</a>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected data$ = inject(SharedService).data$;
}
