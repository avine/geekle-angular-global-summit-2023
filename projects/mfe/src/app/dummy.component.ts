import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mfe-dummy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h3>A dummy component in the Micro-Frontend application.</h3>

    <a routerLink="../">Back</a>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DummyComponent {}
