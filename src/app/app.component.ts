import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibService } from 'lib';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <h1>Geekle Angular Global Summit 2023</h1>

    <router-outlet />
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private libService = inject(LibService);

  ngOnInit(): void {
    this.libService.setData({ value: 'Hello Micro Frontend' });
  }
}
