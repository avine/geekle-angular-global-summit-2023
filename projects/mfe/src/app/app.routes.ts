import { Routes } from '@angular/router';

import { HomeComponent } from './home.component';

const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
];

export default APP_ROUTES;
