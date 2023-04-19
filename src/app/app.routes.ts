import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'remote1',
    loadChildren: () =>
      loadRemoteModule({
        type: 'manifest',
        remoteName: 'remote1',
        exposedModule: './Routes',
      }),
  },
];

export default APP_ROUTES;
