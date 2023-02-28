import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { LibService } from 'lib';

@Component({
  selector: 'mfe-home',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `<h3>Data exposed to Micro Frontend: {{ data$ | async | json }}</h3>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected data$ = inject(LibService).data$;
}
