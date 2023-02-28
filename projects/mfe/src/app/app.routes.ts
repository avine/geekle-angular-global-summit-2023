import { Routes } from '@angular/router';

import { HomeComponent } from './home.component';

const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'dummy',
    loadComponent: () => import('./dummy.component'),
  },
];

export default APP_ROUTES;
