import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { SharedService } from './shared.service';

@Component({
  selector: 'lib-shared',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: '{{ data$ | async | json }}',
  styles: ['lib-shared { font-weight: bold; color: blue; }'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedComponent {
  protected data$ = inject(SharedService).data$;
}
